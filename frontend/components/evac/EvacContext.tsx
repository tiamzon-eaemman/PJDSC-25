"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type EvacCenter = any

type EvacContextType = {
  centers: EvacCenter[]
  loading: boolean
  addCenter: (payload: Partial<EvacCenter>) => Promise<EvacCenter | null>
  updateCenter: (id: string | number, payload: Partial<EvacCenter>) => Promise<EvacCenter | null>
  removeCenter: (id: string | number) => Promise<boolean>
  refreshCenters: () => Promise<void>
  openEditModal: (center: EvacCenter | null) => void
  closeEditModal: () => void
  editModalOpen: boolean
  editModalCenter: EvacCenter | null
}

const EvacContext = createContext<EvacContextType | null>(null)

const apiBase = (process.env.NEXT_PUBLIC_HAZARD_API_URL as string) || 'http://localhost:8000'

export const EvacProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [centers, setCenters] = useState<EvacCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editModalCenter, setEditModalCenter] = useState<EvacCenter | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/evac_centers`)
        if (!res.ok) throw new Error('fetch failed')
        const j = await res.json()
        if (j && Array.isArray(j.items) && !cancelled) setCenters(j.items)
      } catch (err) {
        console.warn('Could not load evac centers', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const addCenter = async (payload: Partial<EvacCenter>) => {
    try {
      const res = await fetch(`${apiBase}/evac_centers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('create failed')
      const created = await res.json()
      setCenters((s) => [...s, created])
      // open modal for created center
      setEditModalCenter(created)
      setEditModalOpen(true)
      return created
    } catch (err) {
      console.error('Failed to create evac center', err)
      return null
    }
  }

  const updateCenter = async (id: string | number, payload: Partial<EvacCenter>) => {
    try {
      const res = await fetch(`${apiBase}/evac_centers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('update failed')
      const updated = await res.json()
      setCenters((s) => s.map((it) => (it.id === id ? updated : it)))
      return updated
    } catch (err) {
      console.error('Failed to update center', err)
      return null
    }
  }

  const removeCenter = async (id: string | number) => {
    try {
      const res = await fetch(`${apiBase}/evac_centers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      setCenters((s) => s.filter((it) => it.id !== id))
      return true
    } catch (err) {
      console.warn('Failed to delete center', err)
      // still remove locally
      setCenters((s) => s.filter((it) => it.id !== id))
      return false
    }
  }

  const openEditModal = (center: EvacCenter | null) => {
    setEditModalCenter(center)
    setEditModalOpen(!!center)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditModalCenter(null)
  }

  const refreshCenters = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/evac_centers`)
      if (!res.ok) throw new Error('refresh failed')
      const j = await res.json()
      if (j && Array.isArray(j.items)) setCenters(j.items)
    } catch (err) {
      console.warn('Could not refresh evac centers', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <EvacContext.Provider value={{ centers, loading, addCenter, updateCenter, removeCenter, refreshCenters, openEditModal, closeEditModal, editModalOpen, editModalCenter }}>
      {children}
    </EvacContext.Provider>
  )
}

export const useEvacContext = () => {
  const ctx = useContext(EvacContext)
  if (!ctx) throw new Error('useEvacContext must be used inside EvacProvider')
  return ctx
}

export default EvacContext
