"use client"

import * as React from "react"
import {
  MapPin,
  Waves,
  Mountain,
  Menu,
  Search,
  Navigation,
  Wind,
  AlertTriangle,
  Send,
  RefreshCw,
  Bot,
  X,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EvacuationCenterItem } from "@/components/dashboard/EvacuationCenterItem"
import { LegendPanel } from "@/components/dashboard/LegendPanel"
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/map/map-component'), { ssr: false })

// Mock Data for Evacuation Centers
const evacuationCenters = [
  {
    id: 1,
    name: "Central Elementary School",
    capacity: "450/500",
    status: "Active",
    type: "School",
    distance: "1.2km",
    coordinates: [14.5995, 120.9842],
    priority: "High",
  },
  {
    id: 2,
    name: "Barangay Hall District 1",
    capacity: "120/200",
    status: "Active",
    type: "Gov Bldg",
    distance: "2.5km",
    coordinates: [14.6095, 120.9942],
    priority: "Medium",
  },
  {
    id: 3,
    name: "City Sports Complex",
    capacity: "800/2000",
    status: "Standby",
    type: "Gym",
    distance: "3.1km",
    coordinates: [14.5895, 120.9742],
    priority: "Low",
  },
  {
    id: 4,
    name: "Community Center Zone 4",
    capacity: "0/150",
    status: "Closed",
    type: "Community",
    distance: "4.0km",
    coordinates: [14.6195, 121.0042],
    priority: "Low",
  },
  {
    id: 5,
    name: "North High School",
    capacity: "300/1000",
    status: "Active",
    type: "School",
    distance: "5.2km",
    coordinates: [14.6295, 121.0142],
    priority: "Medium",
  },
]

export function SagipDashboard() {
  const [selectedCenter, setSelectedCenter] = React.useState<number | null>(null)
  const [showFlood, setShowFlood] = React.useState(true)
  const [showLandslide, setShowLandslide] = React.useState(true)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [isAIOpen, setIsAIOpen] = React.useState(false)

  const handleCenterClick = (id: number) => {
    setSelectedCenter(id)
    // In a real implementation, this would trigger a map flyTo
    console.log(`Moving map to center ${id}`)
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground transition-colors duration-300">
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

        <div className="hidden md:flex items-center gap-3">
          <Button className="gap-2 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700">
            <Send className="h-4 w-4" />
            Send Plan
          </Button>
          <Button className="gap-2 px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700">
            <RefreshCw className="h-4 w-4" />
            Update Data
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search areas..."
              className="w-64 rounded-full bg-secondary pl-9 md:w-80 lg:w-96"
            />
          </div>
          {/* Notification and Settings hidden until needed */}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Evacuation Areas */}
        <aside
          className={cn(
            "flex w-full flex-col border-r bg-card transition-all duration-300 md:w-80 lg:w-96",
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
                      <div className="flex items-center">
                        <div className="flex flex-col items-center text-center">
                          <span className="text-[11px] text-muted-foreground">Signal</span>
                          <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center text-white font-bold text-lg">
                            3
                          </div>
                        </div>
                      </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    185 km/h
                  </div>
                  <div>NW @ 20kph</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 pb-2">
            <h2 className="mb-1 font-semibold text-lg">Evacuation Centers</h2>
            <p className="text-xs text-muted-foreground">Real-time capacity and status monitoring</p>
          </div>
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter centers..." className="pl-8" />
            </div>
          </div>
          <ScrollArea className="flex-1 px-4">
            <div className="flex flex-col gap-2 pb-4">
              {evacuationCenters.map((center) => (
                <React.Fragment key={center.id}>
                  <EvacuationCenterItem
                    center={center}
                    selected={selectedCenter === center.id}
                    onClick={handleCenterClick}
                  />
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Total Capacity</span>
                <span className="font-bold text-xl">1,670</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Active Centers</span>
                <span className="font-bold text-xl">3/5</span>
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
                    <p>
                      Hello! I'm analyzing the current hazard data. I've detected critical water levels near Central
                      Elementary School.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-xs font-bold">You</span>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3 text-xs">
                    <p>Generate a routing plan for Zone 4.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-xs">
                    <p>
                      Processing... I recommend routing Zone 4 evacuees to North High School as it has 70% remaining
                      capacity and is outside the flood zone.
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="p-3 border-t bg-muted/20">
                <div className="relative">
                  <Input placeholder="Ask SAGIP AI..." className="pr-10 h-9 text-xs" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-primary"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </aside>

        {/* Main Content - Map Area */}
        <main className="relative flex-1 bg-muted/20">
          {/* Map Placeholder / Container */}
          <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
            <MapComponent centers={evacuationCenters} />
          </div>

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
            <LegendPanel showFlood={showFlood} showLandslide={showLandslide} />
          </div>
        </main>
      </div>
    </div>
  )
}
