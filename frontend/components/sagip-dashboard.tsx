"use client"

import * as React from "react"
import { MapPin, Menu, Search, Navigation, Wind, AlertTriangle, Send, Bot, X, MessageSquare, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EvacuationCenterItem } from "@/components/dashboard/EvacuationCenterItem"
import { EvacProvider, useEvacContext } from '@/components/evac/EvacContext'
import EvacEditModal from '@/components/evac/EvacEditModal'
import { LegendPanel } from "@/components/dashboard/LegendPanel"
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/map/map-component'), { ssr: false })

export function SagipDashboard() {
  return (
    <EvacProvider>
      <DashboardContent />
    </EvacProvider>
  )
}

function DashboardContent() {
  const [selectedCenter, setSelectedCenter] = React.useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [isAIOpen, setIsAIOpen] = React.useState(false)
  const { centers, openEditModal, removeCenter, refreshCenters } = useEvacContext()
  const [addCenterMode, setAddCenterMode] = React.useState(false)
  const [visibleFilter, setVisibleFilter] = React.useState<'all' | 'flood' | 'landslide'>('all')
  const [flyToLocation, setFlyToLocation] = React.useState<[number, number] | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null)
  const [planModalOpen, setPlanModalOpen] = React.useState(false)
  const [planText, setPlanText] = React.useState('')
  const [publishing, setPublishing] = React.useState(false)
  const [viewPlanOpen, setViewPlanOpen] = React.useState(false)
  const [currentPlan, setCurrentPlan] = React.useState<any | null>(null)
  const [loadingCurrentPlan, setLoadingCurrentPlan] = React.useState(false)
  const [centerQuery, setCenterQuery] = React.useState('')
  const [planHotlines, setPlanHotlines] = React.useState<Array<{ label: string; number: string }>>([])
  const [newHotlineLabel, setNewHotlineLabel] = React.useState('')
  const [newHotlineNumber, setNewHotlineNumber] = React.useState('')
  const [planChecklist, setPlanChecklist] = React.useState<Array<{ id: string; text: string; completed?: boolean }>>([])
  const [newChecklistText, setNewChecklistText] = React.useState('')

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value
      if (!query) return
      try {
        const viewbox = '121.19,14.19,121.25,14.11'
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&viewbox=${viewbox}&bounded=1&limit=1`)
        const data = await res.json()
        if (data && data.length > 0) {
          const { lat, lon } = data[0]
          setFlyToLocation([parseFloat(lat), parseFloat(lon)])
        }
      } catch (err) { console.error('Search failed', err) }
    }
  }

  const totalCapacity = React.useMemo(() => centers.reduce((acc: number, c: any) => {
    let cap = 0
    if (!c) return acc
    if (typeof c.capacity === 'number') cap = c.capacity
    else if (typeof c.capacity === 'string' && c.capacity.includes('/')) {
      const parts = c.capacity.split('/').map((s: string) => Number(s.replace(/[^0-9.]/g, '')))
      if (!Number.isNaN(parts[1])) cap = parts[1]
    } else if (typeof c.capacity === 'string') {
      const n = Number(c.capacity)
      if (!Number.isNaN(n)) cap = n
    }
    return acc + (cap || 0)
  }, 0), [centers])

  const activeCount = React.useMemo(() => centers.filter((c: any) => !!c.active).length, [centers])

  const handleCenterClick = (id: number) => {
    setSelectedCenter(id)
    console.log(`Moving map to center ${id}`)
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Navigation className="h-5 w-5" />
            </div>
            <span>SAGIP</span>
            <Badge variant="outline" className="ml-2 hidden sm:flex border-primary/50 text-primary">
              Barangay Batong Malake
            </Badge>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3" />

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search areas..."
              className="w-64 rounded-full bg-secondary pl-9 md:w-80 lg:w-96"
              onKeyDown={handleSearch}
            />
          </div>
          {/* Notification and Settings hidden until needed */}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex w-full flex-col border-r bg-card transition-all duration-300 md:w-80 lg:w-96 overflow-y-auto",
            !sidebarOpen && "hidden md:flex",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="p-4 pb-0">
            <Card className="bg-destructive/5 border-destructive/20 shadow-sm">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">TYPHOON KRISTINE</span>
                      <span className="text-[11px] text-muted-foreground">Critical</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[11px] text-muted-foreground">Signal</span>
                    <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center text-white font-bold text-lg">3</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Wind className="h-3 w-3" />185 km/h</div>
                  <div>NW @ 20kph</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="px-4 pt-4">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setPlanModalOpen(true)}
                >
                  <Send className="h-4 w-4" />
                  Send Plan
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-blue-600 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                  onClick={async () => {
                    setViewPlanOpen(true)
                    setLoadingCurrentPlan(true)
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_HAZARD_API_URL || 'http://localhost:8000'}/plan`)
                      if (res.ok) {
                        const j = await res.json()
                        const plan = j.plan || null
                        setCurrentPlan(plan)
                        setPlanText((plan?.text) || '')
                        setPlanHotlines(Array.isArray(plan?.hotlines) ? plan.hotlines : [])
                        setPlanChecklist(Array.isArray(plan?.checklist) ? plan.checklist : [])
                      }
                    } catch (e) { console.warn(e) } finally { setLoadingCurrentPlan(false) }
                  }}
                >
                  View Plan
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter</span>
                <div className="flex gap-2">
                  <button onClick={() => setVisibleFilter('all')} className={`px-2 py-1 rounded text-sm ${visibleFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-white text-slate-700'}`}>All</button>
                  <button onClick={() => setVisibleFilter('flood')} className={`px-2 py-1 rounded text-sm ${visibleFilter === 'flood' ? 'bg-blue-500 text-white' : 'bg-white text-slate-700'}`}>Flood</button>
                  <button onClick={() => setVisibleFilter('landslide')} className={`px-2 py-1 rounded text-sm ${visibleFilter === 'landslide' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700'}`}>Landslide</button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 pb-2 flex items-end justify-between">
            <div>
              <h2 className="mb-1 font-semibold text-lg">Evacuation Centers</h2>
              <p className="text-xs text-muted-foreground">Real-time capacity and status monitoring</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={refreshCenters}
              title="Refresh capacities"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAddCenterMode(s => !s)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors border',
                  addCenterMode ? 'bg-green-600 border-green-700 text-white shadow' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                )}
              >
                <MapPin className="h-3 w-3" />{addCenterMode ? 'Placing…' : 'Add Center'}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search centers by name or capacity..."
                className="pl-8"
                value={centerQuery}
                onChange={e => setCenterQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 px-4 pb-24">
            <div className="flex flex-col gap-2">
              {centers.filter((c: any) => {
                if (!centerQuery.trim()) return true
                const q = centerQuery.toLowerCase()
                return (c.name || '').toLowerCase().includes(q) || String(c.capacity || '').includes(q)
              }).map((center: any) => (
                <React.Fragment key={center.id}>
                  <EvacuationCenterItem
                    center={center}
                    selected={selectedCenter === center.id}
                    onEdit={() => openEditModal(center)}
                    onRemove={() => setDeleteTarget(center)}
                  />
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4 bg-card sticky bottom-0">
            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Total Capacity</span>
                <span className="font-bold text-xl">{totalCapacity.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Active Centers</span>
                <span className="font-bold text-xl">{activeCount}/{centers.length}</span>
              </div>
            </div>
          </div>

          {isAIOpen && (
            <Card className="w-80 border-none bg-card/95 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">SAGIP AI</CardTitle>
                    <CardDescription className="text-[10px]">Data Consolidation Assistant</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsAIOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 h-64 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-xs">
                    <p>Analyzing current hazard data…</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>

        {/* Map Area */}
        <main className="relative flex-1 bg-muted/20">
          <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
            <MapComponent
              centers={centers}
              addCenterMode={addCenterMode}
              setAddCenterMode={setAddCenterMode}
              visibleFilter={visibleFilter}
              setVisibleFilter={setVisibleFilter}
              flyToLocation={flyToLocation}
              onRequestDelete={(c: any) => setDeleteTarget(c)}
            />
          </div>
            <EvacEditModal />

            {deleteTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
                <div className="relative w-[320px] bg-white dark:bg-neutral-900 rounded shadow-lg p-4 space-y-4 z-50 border">
                  <h3 className="text-sm font-semibold">Delete Evacuation Center</h3>
                  <p className="text-xs text-muted-foreground">Are you sure you want to remove <span className="font-medium">{deleteTarget.name || 'this center'}</span>? This action cannot be undone.</p>
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      className="px-3 py-1 rounded border bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      onClick={() => setDeleteTarget(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={async () => {
                        try { await removeCenter(deleteTarget.id) } catch (e) { console.warn('Delete failed', e) } finally { setDeleteTarget(null) }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

          {planModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => !publishing && setPlanModalOpen(false)} />
              <div className="relative w-[720px] max-w-[95vw] bg-white dark:bg-neutral-900 rounded shadow-lg p-6 space-y-6 z-50 border">
                <h3 className="text-sm font-semibold">Publish LGU Plan</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Plan Text</label>
                      <textarea
                        rows={10}
                        value={planText}
                        onChange={e => setPlanText(e.target.value)}
                        className="w-full resize-none border rounded px-2 py-2 text-xs bg-white dark:bg-neutral-800"
                        placeholder="Describe routing, resource allocations, staging areas, timelines..."
                      />
                    </div>
                    <div className="text-xs bg-muted/50 rounded p-2 space-y-1">
                      <div className="font-semibold">Typhoon Details (auto-attached)</div>
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive text-white font-bold text-sm">⚠</div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">TYPHOON KRISTINE</span>
                            <span className="text-[11px] text-muted-foreground">Signal 3</span>
                            <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1"><span className="opacity-70">Wind</span> 185 km/h</span>
                              <span>NW @ 20kph</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs max-h-48 overflow-auto border rounded p-2 bg-muted/30 space-y-1">
                      <div className="font-semibold">Current Evacuation Centers</div>
                      {centers.length === 0 && <div className="opacity-70">None loaded.</div>}
                      {centers.map(c => (
                        <div key={c.id} className="flex justify-between">
                          <span className="truncate max-w-[150px]">{c.name || 'Center'}</span>
                          <span className="opacity-70">{c.capacity ?? '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Hotlines</span>
                        <div className="flex gap-2">
                          <input type="text" value={newHotlineLabel} onChange={e => setNewHotlineLabel(e.target.value)} placeholder="Label" className="border rounded px-2 py-1 text-[11px] bg-white dark:bg-neutral-800 w-28" />
                          <input type="text" value={newHotlineNumber} onChange={e => setNewHotlineNumber(e.target.value)} placeholder="Number" className="border rounded px-2 py-1 text-[11px] bg-white dark:bg-neutral-800 w-32" />
                          <button
                            onClick={() => {
                              if (newHotlineLabel.trim() && newHotlineNumber.trim()) {
                                setPlanHotlines(h => [...h, { label: newHotlineLabel.trim(), number: newHotlineNumber.trim() }])
                                setNewHotlineLabel('')
                                setNewHotlineNumber('')
                              }
                            }}
                            disabled={!newHotlineLabel.trim() || !newHotlineNumber.trim()}
                            className="text-[10px] px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
                          >Add</button>
                        </div>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-auto">
                        {planHotlines.length === 0 && <div className="text-[11px] opacity-60">No hotlines added.</div>}
                        {planHotlines.map((h,i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] bg-muted/40 rounded px-2 py-1">
                            <span className="truncate max-w-[160px]"><span className="font-semibold mr-2">{h.label}:</span>{h.number}</span>
                            <button onClick={() => setPlanHotlines(list => list.filter((_,idx) => idx!==i))} className="text-red-600 hover:text-red-700">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Checklist Items</span>
                        <div className="flex gap-2">
                          <input type="text" value={newChecklistText} onChange={e => setNewChecklistText(e.target.value)} placeholder="e.g. Prepare Go-Bag" className="border rounded px-2 py-1 text-[11px] bg-white dark:bg-neutral-800 w-40" />
                          <button
                            onClick={() => {
                              if (newChecklistText.trim()) {
                                setPlanChecklist(c => [...c, { id: Math.random().toString(36).slice(2,9), text: newChecklistText.trim() }])
                                setNewChecklistText('')
                              }
                            }}
                            disabled={!newChecklistText.trim()}
                            className="text-[10px] px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
                          >Add</button>
                        </div>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-auto">
                        {planChecklist.length === 0 && <div className="text-[11px] opacity-60">No checklist items.</div>}
                        {planChecklist.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-[11px] bg-muted/40 rounded px-2 py-1">
                            <span className="truncate max-w-[160px]">{item.text}</span>
                            <button onClick={() => setPlanChecklist(list => list.filter(i => i.id !== item.id))} className="text-red-600 hover:text-red-700">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    disabled={publishing}
                    className="px-3 py-1 rounded border bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50"
                    onClick={() => setPlanModalOpen(false)}
                  >Cancel</button>
                  <button
                    disabled={publishing || !planText.trim()}
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={async () => {
                      if (!planText.trim()) return
                      setPublishing(true)
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_HAZARD_API_URL || 'http://localhost:8000'}/plan`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            text: planText.trim(),
                            typhoon: { name: 'TYPHOON KRISTINE', signal: 3, wind_kmh: 185, movement: 'NW @ 20kph' },
                            hotlines: planHotlines,
                            checklist: planChecklist.map(i => ({ ...i, completed: false }))
                          })
                        })
                        if (!res.ok) throw new Error('Failed to publish')
                        setPlanText('')
                        setPlanHotlines([])
                        setPlanChecklist([])
                        setPlanModalOpen(false)
                      } catch (e) { console.error(e) } finally { setPublishing(false) }
                    }}
                  >{publishing ? 'Publishing…' : 'Publish Plan'}</button>
                </div>
              </div>
            </div>
          )}

          {viewPlanOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setViewPlanOpen(false)} />
              <div className="relative w-[720px] max-w-[95vw] bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-5 space-y-5 z-50 border">
                <h3 className="text-sm font-semibold">Current Plan</h3>
                {loadingCurrentPlan && <div className="text-xs">Loading current plan…</div>}
                {!loadingCurrentPlan && !currentPlan && <div className="text-xs text-muted-foreground">No plan published.</div>}
                {currentPlan && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive text-white font-bold text-sm">⚠</div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{(currentPlan.typhoon?.name || 'Typhoon').toUpperCase()}</span>
                            <span className="text-[11px] text-muted-foreground">Signal {currentPlan.typhoon?.signal}</span>
                            <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1"><span className="opacity-70">Wind</span> {currentPlan.typhoon?.wind_kmh} km/h</span>
                              <span>{currentPlan.typhoon?.movement}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Plan Text</label>
                        <textarea rows={10} value={planText} onChange={(e) => setPlanText(e.target.value)} className="w-full resize-none border rounded px-2 py-2 text-xs bg-white dark:bg-neutral-800" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">Hotlines</span>
                          <div className="flex gap-2">
                            <input type="text" value={newHotlineLabel} onChange={e => setNewHotlineLabel(e.target.value)} placeholder="Label" className="border rounded px-2 py-1 text-[11px] bg-white dark:bg-neutral-800 w-28" />
                            <input type="text" value={newHotlineNumber} onChange={e => setNewHotlineNumber(e.target.value)} placeholder="Number" className="border rounded px-2 py-1 text-[11px] bg-white dark:bg-neutral-800 w-32" />
                            <button onClick={() => { if (newHotlineLabel.trim() && newHotlineNumber.trim()) { setPlanHotlines(h => [...h, { label: newHotlineLabel.trim(), number: newHotlineNumber.trim() }]); setNewHotlineLabel(''); setNewHotlineNumber('') } }} disabled={!newHotlineLabel.trim() || !newHotlineNumber.trim()} className="text-[10px] px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50">Add</button>
                          </div>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-auto">
                          {planHotlines.length === 0 && <div className="text-[11px] opacity-60">No hotlines added.</div>}
                          {planHotlines.map((h,i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] bg-muted/40 rounded px-2 py-1">
                              <span className="truncate max-w-[160px]">{h.label}: {h.number}</span>
                              <button onClick={() => setPlanHotlines(list => list.filter((_,idx) => idx!==i))} className="text-red-600 hover:text-red-700">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">Checklist Items</span>
                          <div className="flex gap-2">
                            <input type="text" value={newChecklistText} onChange={e => setNewChecklistText(e.target.value)} placeholder="e.g. Prepare Go-Bag" className="border rounded px-2 py-1 text-[11px] bg-white dark:bg-neutral-800 w-40" />
                            <button onClick={() => { if (newChecklistText.trim()) { setPlanChecklist(c => [...c, { id: Math.random().toString(36).slice(2,9), text: newChecklistText.trim(), completed: false }]); setNewChecklistText('') } }} disabled={!newChecklistText.trim()} className="text-[10px] px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50">Add</button>
                          </div>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-auto">
                          {planChecklist.length === 0 && <div className="text-[11px] opacity-60">No checklist items.</div>}
                          {planChecklist.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-[11px] bg-muted/40 rounded px-2 py-1">
                              <span className="truncate max-w-[160px]">{item.text}</span>
                              <button onClick={() => setPlanChecklist(list => list.filter(i => i.id !== item.id))} className="text-red-600 hover:text-red-700">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 text-xs">
                  <button className="px-3 py-1 rounded border bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700" onClick={() => setViewPlanOpen(false)}>Close</button>
                  {currentPlan && (
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      onClick={async () => {
                        try {
                          const body = {
                            text: planText.trim(),
                            typhoon: currentPlan?.typhoon || { name: 'TYPHOON KRISTINE', signal: 3, wind_kmh: 185, movement: 'NW @ 20kph' },
                            hotlines: planHotlines,
                            checklist: planChecklist.map(i => ({ id: i.id, text: i.text, completed: !!i.completed })),
                          }
                          const res = await fetch(`${process.env.NEXT_PUBLIC_HAZARD_API_URL || 'http://localhost:8000'}/plan`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                          if (!res.ok) throw new Error('Failed to save plan')
                          const saved = await res.json()
                          setCurrentPlan(saved.plan || body)
                          setViewPlanOpen(false)
                        } catch (e) { console.error(e) }
                      }}
                    >Save</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Floating Controls */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md shadow-md">
              <span className="text-lg font-bold">+</span>
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md shadow-md">
              <span className="text-lg font-bold">-</span>
            </Button>
            <Button
              onClick={() => setIsAIOpen(!isAIOpen)}
              className="h-10 w-10 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-4">
            <LegendPanel showFlood={true} showLandslide={true} />
          </div>
        </main>
      </div>
    </div>
  )
}
