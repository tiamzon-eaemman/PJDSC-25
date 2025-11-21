'use client';

import { useState } from 'react';
import NavigationBar from '@/components/NavigationBar';
import ActiveAdvisoryCard from '@/components/ActiveAdvisoryCard';
import HazardSummaryCard from '@/components/HazardSummaryCard';
import EvacuationCenterCard from '@/components/EvacuationCenterCard';
import QuickActionCard from '@/components/QuickActionCard';
import ChecklistModal from '@/components/ChecklistModal';
import SettingsModal from '@/components/SettingsModal';
import PushInit from '@/components/PushInit';
import { Building2, Phone, ListTodo, TriangleAlert, Wrench, RefreshCw } from 'lucide-react';
import { useEvacCenters, useCurrentPlan } from '@/hooks/useApi';

export default function Home() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { centers, loading: centersLoading, error: centersError, reload: reloadCenters } = useEvacCenters(30000);
  const { plan, loading: planLoading, reload: reloadPlan } = useCurrentPlan();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'map') {
      window.location.href = '/map';
    } else if (tabId === 'hotlines') {
      window.location.href = '/info';
    } else {
      setActiveTab(tabId);
    }
  };

  const handleRefresh = () => {
    reloadCenters();
    reloadPlan();
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white pb-32 relative font-sans">
      <PushInit />
      <ChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        items={plan?.checklist || []}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Header */}
      <div className="pt-8 pb-4 px-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-[#FF7A00] tracking-tight">SAGIP</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">SYSTEM ONLINE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              title="Refresh Data"
              onClick={handleRefresh}
              className="relative p-2 rounded-full bg-[#131C2D] border border-white/5 hover:bg-white/5"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${centersLoading || planLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              title="Settings (dev only)"
              onClick={() => setIsSettingsOpen(true)}
              className="relative p-2 rounded-full bg-[#131C2D] border border-white/5 hover:bg-white/5"
            >
              <Wrench className="w-5 h-5 text-gray-400" />
            </button>
            <button className="relative p-2 rounded-full bg-[#131C2D] border border-white/5">
            <TriangleAlert className="w-5 h-5 text-gray-400" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#131C2D]"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Main Alert */}
        <ActiveAdvisoryCard
          typhoon={plan?.typhoon}
          issuedAt={plan?.updated_at || ''}
        />

        {/* Hazard Summary */}
        <HazardSummaryCard
          summary={plan?.text || 'No published plan narrative available.'}
          updatedAt={plan?.updated_at}
          title="Plan"
        />

        {/* Evacuation Status */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-white text-sm">Evacuation Status</h3>
          </div>

          <div className="space-y-3">
            {centersLoading && (
              <div className="text-xs text-gray-400">Loading evacuation centers...</div>
            )}
            {centersError && (
              <div className="text-xs text-red-400">{centersError}</div>
            )}
            {!centersLoading && centers.length === 0 && !centersError && (
              <div className="text-xs text-gray-400">No centers available.</div>
            )}
            {centers.map(c => (
              <EvacuationCenterCard
                key={c.id}
                id={c.id}
                name={c.name}
                status={!c.active ? 'CLOSED' : ((c.current || 0) >= (c.capacity || 0) ? 'FULL' : 'OPEN')}
                currentOccupancy={c.current || 0}
                maxCapacity={c.capacity || 0}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <QuickActionCard
            icon={ListTodo}
            label="Checklist"
            onClick={() => setIsChecklistOpen(true)}
          />
          <QuickActionCard
            icon={Phone}
            label="Hotlines"
            onClick={() => window.location.href = '/info'}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <NavigationBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}
