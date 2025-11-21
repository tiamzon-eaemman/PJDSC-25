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
  try {
    if (!center) occupancyRatio = 0
    else if (typeof center.capacity === 'number') occupancyRatio = Math.min(1, Math.max(0, (Number(center.occupied ?? 0) || 0) / Math.max(1, center.capacity)))
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

  return (
    <div
      className={cn(
        'flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all bg-card',
        selected ? 'ring-1 ring-primary/20' : ''
      )}
    >
      <div className="flex w-full items-start justify-between">
        <span className="font-semibold text-sm">{center.name || 'Evac Center'}</span>
      </div>
      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{center.distance ?? ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Cap:</span>
          <span className={cn('font-medium', occupancyRatio > 0.8 ? 'text-destructive' : 'text-foreground')}>
            {typeof center.capacity === 'number' ? center.capacity : center.capacity ?? '-'}
          </span>
        </div>
      </div>
      <div className="mt-1 flex w-full items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn('h-full rounded-full', occupancyRatio > 0.8 ? 'bg-destructive' : 'bg-primary')}
            style={{ width: `${Math.round(occupancyRatio * 100)}%` }}
          />
        </div>
      </div>
      <div className="mt-2 w-full flex justify-end gap-2">
        {onEdit && (
          <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded" onClick={() => onEdit(center)}>
            Edit
          </button>
        )}
        {onRemove && (
          <button className="px-2 py-1 text-xs bg-red-500 text-white rounded" onClick={() => onRemove(center)}>
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
