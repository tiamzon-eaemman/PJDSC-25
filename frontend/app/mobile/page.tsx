"use client"

import React, { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import ChecklistModal from '@/components/mobile/ChecklistModal'
import ContactCard from '@/components/mobile/ContactCard'
import NavigationBar from '@/components/mobile/NavigationBar'

const apiBase = (process.env.NEXT_PUBLIC_HAZARD_API_URL as string) || 'http://localhost:8000'

type EvacCenter = { id: string; name?: string; capacity?: number; center?: [number, number]; active?: boolean }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const MobilePlanPage: React.FC = () => {
  const [plan, setPlan] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'plan' | 'map' | 'guide'>('plan')
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [localChecklist, setLocalChecklist] = useState<Array<{ id: string; text: string; completed?: boolean }>>([])
  const [centers, setCenters] = useState<EvacCenter[]>([])
  const [nearest, setNearest] = useState<Array<{ center: EvacCenter; distance: number }>>([])
  const [geoStatus, setGeoStatus] = useState<string>('')
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [loadingCenters, setLoadingCenters] = useState(true)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const [planSource, setPlanSource] = useState<'network' | 'cache' | null>(null)

  const loadPlan = useCallback(async () => {
    setLoadingPlan(true)
    try {
      const res = await fetch(`${apiBase}/plan`)
      if (!res.ok) throw new Error('plan fetch failed')
      const j = await res.json()
      const p = j.plan || null
      setPlan(p)
      if (p?.checklist) setLocalChecklist(p.checklist)
      try { localStorage.setItem('cached_plan', JSON.stringify(j.plan || null)) } catch {}
      setPlanSource('network')
    } catch (e) {
      console.warn(e)
      // offline fallback
      try {
        const cached = localStorage.getItem('cached_plan')
        if (cached) {
          setPlan(JSON.parse(cached))
          setPlanSource('cache')
        }
      } catch {}
    } finally {
      setLoadingPlan(false)
    }
  }, [])

  const loadCenters = useCallback(async () => {
    setLoadingCenters(true)
    try {
      const res = await fetch(`${apiBase}/evac_centers`)
      if (!res.ok) throw new Error('centers fetch failed')
      const j = await res.json()
      setCenters((j.items || []).filter((c: any) => Array.isArray(c.center) && c.center.length === 2))
      try { localStorage.setItem('cached_centers', JSON.stringify(j.items || [])) } catch {}
    } catch (e) {
      console.warn(e)
      try {
        const cached = localStorage.getItem('cached_centers')
        if (cached) setCenters(JSON.parse(cached))
      } catch {}
    } finally {
      setLoadingCenters(false)
    }
  }, [])

  useEffect(() => { loadPlan() }, [loadPlan])
  useEffect(() => { loadCenters() }, [loadCenters])

  // Track offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Geolocation ranking
  const computeNearest = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('Geolocation not supported')
      return
    }
    setGeoStatus('Locating…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserPos([latitude, longitude])
        const ranked = centers.map(c => {
          const [lat, lng] = c.center as [number, number]
          return { center: c, distance: haversine(latitude, longitude, lat, lng) }
        }).sort((a, b) => a.distance - b.distance)
        setNearest(ranked)
        setGeoStatus(`Location acquired (lat ${latitude.toFixed(4)}, lng ${longitude.toFixed(4)})`)
      },
      (err) => {
        setGeoStatus('Geolocation denied')
        console.warn(err)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [centers])

  useEffect(() => { if (centers.length) computeNearest() }, [centers, computeNearest])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <div className="px-4 pt-4 flex items-center justify-between bg-gradient-to-b from-white/90 to-white/40 dark:from-neutral-950/80 dark:to-neutral-900/40 backdrop-blur sticky top-0 z-50 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">S</div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">SAGIP Mobile</span>
            <span className="text-[10px] uppercase text-muted-foreground">Barangay Batong Malake</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && <span className="text-[10px] px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Offline</span>}
          {planSource === 'cache' && !loadingPlan && <span className="text-[10px] px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Cached</span>}
        </div>
      </div>

      {/* Sticky Action Buttons (moved above map) */}
      <div className="px-4 mt-3">
        <div className="rounded-xl bg-white/90 dark:bg-neutral-900/80 backdrop-blur border shadow-sm p-3 flex items-center justify-between gap-3">
          <button
            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={async () => { await Promise.all([loadPlan(), loadCenters()]) }}
            disabled={loadingPlan || loadingCenters}
          >{(loadingPlan || loadingCenters) ? 'Refreshing…' : 'Refresh Data'}</button>
          <button
            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            onClick={computeNearest}
          >Recompute Nearest</button>
        </div>
      </div>

      <div className="px-4 mt-5 flex-1 flex flex-col gap-6 pb-8">
        {activeTab === 'plan' && <h2 className="text-lg font-semibold">LGU Response Plan</h2>}

        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="space-y-2">
              {loadingPlan && <div className="text-xs text-muted-foreground">Loading plan…</div>}
              {!loadingPlan && !plan && <div className="text-xs text-muted-foreground">No plan published yet.</div>}
              {plan && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 shadow-sm backdrop-blur-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive text-white font-bold text-sm">⚠</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{(plan.typhoon?.name || 'Typhoon').toUpperCase()}</span>
                        <span className="text-[11px] text-muted-foreground">Signal {plan.typhoon?.signal}</span>
                        <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="opacity-70">Wind</span> {plan.typhoon?.wind_kmh} km/h</span>
                          <span>{plan.typhoon?.movement}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground">Updated</span>
                      <div className="text-[10px] font-medium max-w-[90px] text-center">{plan.updated_at ? new Date(plan.updated_at).toLocaleString() : ''}</div>
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed bg-white/60 dark:bg-neutral-900/60 border rounded p-3">{plan.text}</div>
                  {/* Hotlines */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold tracking-wide uppercase">Hotlines</h4>
                    {(!plan.hotlines || plan.hotlines.length === 0) && <div className="text-[11px] text-muted-foreground">No hotlines provided.</div>}
                    <div className="grid gap-2">
                      {plan.hotlines && plan.hotlines.map((h: any) => (
                        <ContactCard key={h.label + h.number} name={h.label} number={h.number} />
                      ))}
                    </div>
                  </div>
                  {/* Checklist Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold tracking-wide uppercase">Preparedness Checklist</h4>
                      <button onClick={() => setChecklistOpen(true)} className="text-[10px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Open</button>
                    </div>
                    {(!plan.checklist || plan.checklist.length === 0) && <div className="text-[11px] text-muted-foreground">No checklist items.</div>}
                    <ul className="space-y-1 text-[11px]">
                      {localChecklist.slice(0,4).map(i => (
                        <li key={i.id} className="flex items-center gap-2"><span className={`inline-block w-3 h-3 rounded-full ${i.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />{i.text}</li>
                      ))}
                      {localChecklist.length > 4 && <li className="opacity-70">+ {localChecklist.length - 4} more…</li>}
                    </ul>
                  </div>
                  {/* Map Button */}
                  {plan.map_link && (
                    <a href={plan.map_link} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-medium px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90">Open Routing Map</a>
                  )}
                </div>
              )}
            </div>
            {/* Nearest centers only in plan tab for now */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Nearest Evacuation Centers</h3>
              <div className="text-xs text-muted-foreground">{geoStatus}</div>
              {loadingCenters && <div className="text-xs">Loading centers…</div>}
              {!loadingCenters && nearest.length === 0 && <div className="text-xs">No centers available.</div>}
              <div className="flex flex-col gap-2">
                {nearest.map((entry, idx) => (
                  <div key={entry.center.id} className="group border rounded-lg p-3 bg-white/70 dark:bg-neutral-900/70 backdrop-blur text-xs flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <span className="font-medium">#{idx + 1} {entry.center.name || 'Center'}</span>
                      <span className="opacity-70">Capacity: {entry.center.capacity ?? '—'}</span>
                    </div>
                    <div className="text-right">
                      <span>{(entry.distance/1000).toFixed(2)} km</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Map View</h3>
            <div className="rounded-lg overflow-hidden border shadow-sm">
              <MobileMap centers={centers} userPosition={userPos} />
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-semibold">Preparedness Guide</h3>
            <p className="leading-relaxed">Follow the checklist to ensure readiness. Keep essential documents dry and secured. Monitor official advisories and use the hotlines for emergency assistance only.</p>
          </div>
        )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Nearest Evacuation Centers</h3>
        <div className="text-xs text-muted-foreground">{geoStatus}</div>
        {loadingCenters && <div className="text-xs">Loading centers…</div>}
        {!loadingCenters && nearest.length === 0 && <div className="text-xs">No centers available.</div>}
        <div className="flex flex-col gap-2">
          {nearest.map((entry, idx) => (
            <div key={entry.center.id} className="group border rounded-lg p-3 bg-white/70 dark:bg-neutral-900/70 backdrop-blur text-xs flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col">
                <span className="font-medium">#{idx + 1} {entry.center.name || 'Center'}</span>
                <span className="opacity-70">Capacity: {entry.center.capacity ?? '—'}</span>
              </div>
              <div className="text-right">
                <span>{(entry.distance/1000).toFixed(2)} km</span>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Close inner content container */}
      </div>
      <NavigationBar activeTab={activeTab} onTabChange={(t) => setActiveTab(t as any)} />
      <ChecklistModal
        isOpen={checklistOpen}
        onClose={() => setChecklistOpen(false)}
        items={localChecklist}
        onChange={setLocalChecklist}
      />
    </div>
  )
}

const MobileMap = dynamic(() => import('@/components/map/mobile-map'), { ssr: false })

export default MobilePlanPage
