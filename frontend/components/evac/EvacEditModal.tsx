"use client"

import React, { useEffect, useState } from 'react'
import { useEvacContext } from './EvacContext'

export const EvacEditModal: React.FC = () => {
  const { editModalOpen, editModalCenter, closeEditModal, updateCenter, addCenter } = useEvacContext()
  const [form, setForm] = useState({ name: '', capacity: 0 })

  useEffect(() => {
    if (editModalCenter) {
      setForm({ name: editModalCenter.name || '', capacity: Number(editModalCenter.capacity ?? 0) })
    }
  }, [editModalCenter])

  if (!editModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={closeEditModal} />
      <div className="relative w-96 bg-white rounded shadow-lg p-4 z-50">
        <h3 className="font-semibold mb-2">Edit Evacuation Center</h3>
        <div className="flex flex-col gap-2">
          <label className="text-xs">Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="border rounded px-2 py-1" />
          <label className="text-xs">Capacity</label>
          <input value={String(form.capacity)} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} className="border rounded px-2 py-1" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={closeEditModal}>Cancel</button>
          <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={async () => {
            if (!editModalCenter) return
            try {
              // If center has an id, update. Otherwise create a new center.
              const hasId = editModalCenter && (editModalCenter.id || editModalCenter._id)
              if (hasId) {
                await updateCenter(editModalCenter.id || editModalCenter._id, { name: form.name, capacity: form.capacity })
              } else {
                await addCenter({ name: form.name, capacity: form.capacity, center: editModalCenter.center ?? editModalCenter.coordinates ?? null })
              }
            } catch (err) {
              console.error('Failed to save center', err)
            } finally {
              closeEditModal()
            }
          }}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default EvacEditModal
