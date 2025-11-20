"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Waves, Mountain } from "lucide-react";

interface Props {
  showFlood: boolean;
  showLandslide: boolean;
}

export const LegendPanel: React.FC<Props> = ({ showFlood, showLandslide }) => {
  return (
    <Card className="w-64 border-none bg-card/90 shadow-lg backdrop-blur-sm">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-medium">Hazard Intensity Index</CardTitle>
        <CardDescription className="text-[10px]">Real-time sensor data & predictive modeling</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="space-y-4">
          {showFlood && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5">
                  <Waves className="h-3 w-3 text-blue-500" /> Flood Susceptibility
                </span>
                <span className="text-muted-foreground">High</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white dark:bg-black border border-black/5 dark:border-white/5 overflow-hidden">
                <div className="h-full w-full bg-linear-to-r from-blue-600/10 to-blue-600" />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Low (0.5m)</span>
                <span>Critical (2m+)</span>
              </div>
            </div>
          )}

          {showLandslide && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5">
                  <Mountain className="h-3 w-3 text-orange-500" /> Landslide Risk
                </span>
                <span className="text-muted-foreground">Severe</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white dark:bg-black border border-black/5 dark:border-white/5 overflow-hidden">
                <div className="h-full w-full bg-linear-to-r from-orange-600/10 to-orange-600" />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Stable</span>
                <span>Unstable</span>
              </div>
            </div>
          )}

          {!showFlood && !showLandslide && (
            <div className="flex h-12 items-center justify-center text-[10px] text-muted-foreground italic">No layers active</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
