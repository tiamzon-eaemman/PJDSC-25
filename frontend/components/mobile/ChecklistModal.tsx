import { X, List, Circle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface ChecklistModalProps {
  isOpen: boolean
  onClose: () => void
  items?: Array<{ id: string; text: string; completed?: boolean }>
  onChange?: (items: Array<{ id: string; text: string; completed?: boolean }>) => void
}

export default function ChecklistModal({ isOpen, onClose, items = [], onChange }: ChecklistModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(items.filter(i => i.completed).map(i => i.id)))

  if (!isOpen) return null

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
    onChange?.(items.map(i => ({ ...i, completed: newChecked.has(i.id) })))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0E1624] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Safety Checklist</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {items.map(item => {
            const isChecked = checkedItems.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left group ${isChecked ? 'bg-blue-500/10 border-blue-500/50' : 'bg-[#131C2D] border-white/5 hover:border-white/10'}`}
              >
                <div className={`shrink-0 transition-colors ${isChecked ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  {isChecked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-medium ${isChecked ? 'text-white' : 'text-gray-300'}`}>{item.text}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
