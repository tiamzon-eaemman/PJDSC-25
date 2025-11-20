"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  center: any;
  selected: boolean;
  onClick: (id: number) => void;
}

export const EvacuationCenterItem: React.FC<Props> = ({ center, selected, onClick }) => {
  const occupancyRatio =
    Number.parseInt(center.capacity.split("/")[0]) / Number.parseInt(center.capacity.split("/")[1]);

  return (
    <button
      onClick={() => onClick(center.id)}
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all hover:bg-accent",
        selected ? "bg-accent border-primary/50 ring-1 ring-primary/20" : "bg-card",
      )}
    >
      <div className="flex w-full items-start justify-between">
        <span className="font-semibold text-sm">{center.name}</span>
        <Badge
          variant={center.status === "Active" ? "default" : "secondary"}
          className={cn(
            "text-[10px] h-5",
            center.status === "Active" && "bg-emerald-600 hover:bg-emerald-700 text-white",
            center.status === "Closed" && "bg-slate-200 text-slate-800"
          )}
        >
          {center.status}
        </Badge>
      </div>
      <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{center.distance}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Cap:</span>
          <span className={cn("font-medium", occupancyRatio > 0.8 ? "text-destructive" : "text-foreground")}>
            {center.capacity}
          </span>
        </div>
      </div>
      <div className="mt-1 flex w-full items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full", occupancyRatio > 0.8 ? "bg-destructive" : "bg-primary")}
            style={{ width: `${occupancyRatio * 100}%` }}
          />
        </div>
      </div>
    </button>
  );
};
