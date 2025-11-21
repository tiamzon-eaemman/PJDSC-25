"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  center: any;
  selected?: boolean;
  onEdit?: (center: any) => void;
  onRemove?: (center: any) => void;
}

export const EvacuationCenterItem: React.FC<Props> = ({ center, selected = false, onEdit, onRemove }) => {
  // capacity may be a number or a string like "10/50". Normalize to compute occupancy ratio.
  let occupancyRatio = 0
  const occupied = center.occupancy ?? center.current ?? center.occupied ?? 0
  try {
    if (!center) occupancyRatio = 0
    else if (typeof center.capacity === 'number') occupancyRatio = Math.min(1, Math.max(0, (Number(occupied) || 0) / Math.max(1, center.capacity)))
    else if (typeof center.capacity === 'string' && center.capacity.includes('/')) {
      const [num, den] = center.capacity.split('/').map((s: string) => Number(s.replace(/[^0-9.]/g, '')))
      occupancyRatio = !Number.isNaN(num) && !Number.isNaN(den) && den > 0 ? Math.min(1, Math.max(0, num / den)) : 0
    } else if (typeof center.capacity === 'string') {
      const n = Number(center.capacity)
      occupancyRatio = !Number.isNaN(n) && n > 0 ? 0 : 0
    }
  } catch (e) {
    occupancyRatio = 0
  }

  const occupancyPct = Math.round(occupancyRatio * 100)
  const isClosed = center.active === false
  const statusVariant = isClosed ? 'destructive' : (occupancyPct >= 90 ? 'destructive' : occupancyPct >= 70 ? 'secondary' : 'outline')

  return (
    <div
      className={cn(
        'group flex flex-col gap-2 rounded-xl border p-4 text-left transition-all bg-card/90 backdrop-blur shadow-sm hover:shadow-md',
        selected ? 'ring-2 ring-primary/40' : 'hover:border-primary/30',
        isClosed ? 'opacity-70 bg-muted/50' : ''
      )}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight">{center.name || 'Evac Center'}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {center.distance ?? '—'}
          </span>
        </div>
        <Badge variant={statusVariant} className={cn('text-[10px] px-2 py-0.5', statusVariant === 'outline' ? 'border-primary/30 text-primary' : '')}>
          {occupancyPct}%
        </Badge>
      </div>
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="opacity-70">Capacity</span>
        <span className={cn(occupancyPct > 90 ? 'text-destructive' : 'text-foreground')}>{typeof center.capacity === 'number' ? center.capacity : center.capacity ?? '-'}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn('h-full rounded-full transition-all', occupancyPct > 90 ? 'bg-destructive' : occupancyPct > 70 ? 'bg-orange-500' : 'bg-primary')}
            style={{ width: `${occupancyPct}%` }}
          />
          <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-gradient-to-r from-white/40 to-transparent" />
        </div>
        <span className="text-[10px] w-10 text-right font-medium">{occupancyPct}%</span>
      </div>
      <div className="flex justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => onEdit(center)}>
            Edit
          </button>
        )}
        {onRemove && (
          <button className="px-2 py-1 text-[10px] bg-red-600 text-white rounded hover:bg-red-700" onClick={() => onRemove(center)}>
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
