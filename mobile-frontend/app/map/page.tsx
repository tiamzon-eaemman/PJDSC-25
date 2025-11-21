'use client';

import dynamic from 'next/dynamic';
import NavigationBar from "@/components/NavigationBar";
import { TriangleAlert, Search, Layers, Info } from 'lucide-react';
import { useState } from 'react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-[#050B14] text-gray-500">Loading Map...</div>
});

export default function MapPage() {
    const handleTabChange = (tabId: string) => {
        const routes: Record<string, string> = {
            alerts: "/",
            map: "/map",
            hotlines: "/info",
        };
        const target = routes[tabId] ?? "/";
        if (typeof window !== "undefined" && window.location.pathname !== target) {
            window.location.href = target;
        }
    };

    return (
        <div className="h-screen bg-[#050B14] text-white relative flex flex-col overflow-hidden">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-6 pointer-events-none">
                <div className="flex justify-between items-start mb-4 pointer-events-auto">
                    <div>
                        <h1 className="text-2xl font-black text-[#FF7A00] tracking-tight shadow-black drop-shadow-md">SAGIP</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase shadow-black drop-shadow-md">SYSTEM ONLINE</span>
                        </div>
                    </div>
                    <button className="relative p-2 rounded-full bg-[#131C2D]/90 backdrop-blur-md border border-white/10 shadow-lg">
                        <TriangleAlert className="w-5 h-5 text-gray-400" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#131C2D]"></div>
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative z-0">
                <MapComponent />
            </div>

            {/* Navigation Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-[1000]">
                <NavigationBar
                    activeTab="map"
                    onTabChange={handleTabChange}
                />
            </div>
        </div>
    );
}
