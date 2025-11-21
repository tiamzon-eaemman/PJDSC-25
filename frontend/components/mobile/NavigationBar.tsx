import { TriangleAlert, Map, Info } from 'lucide-react'

interface NavigationBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function NavigationBar({ activeTab, onTabChange }: NavigationBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0E1624] rounded-t-[24px] shadow-lg border-t border-white/5" />
      <div className="relative flex justify-between items-end px-8 pb-6 pt-4 h-24">
        <button onClick={() => onTabChange('plan')} className="flex flex-col items-center gap-1 mb-1">
          <TriangleAlert className={`w-6 h-6 ${activeTab === 'plan' ? 'text-[#FF7A00]' : 'text-gray-500'}`} strokeWidth={2.5} />
          <span className={`text-[10px] font-medium ${activeTab === 'plan' ? 'text-[#FF7A00]' : 'text-gray-500'}`}>Plan</span>
        </button>
        <div className="relative -top-6">
          <button onClick={() => onTabChange('map')} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${activeTab === 'map' ? 'bg-[#2A3B55] text-white border-4 border-[#0a0a0a]' : 'bg-[#1F2937] text-gray-400 border-4 border-[#0a0a0a]'}`}> <Map className="w-7 h-7" /> </button>
        </div>
        <button onClick={() => onTabChange('guide')} className="flex flex-col items-center gap-1 mb-1">
          <Info className={`w-6 h-6 ${activeTab === 'guide' ? 'text-white' : 'text-gray-500'}`} strokeWidth={2.5} />
          <span className={`text-[10px] font-medium ${activeTab === 'guide' ? 'text-white' : 'text-gray-500'}`}>Guide</span>
        </button>
      </div>
    </div>
  )
}
