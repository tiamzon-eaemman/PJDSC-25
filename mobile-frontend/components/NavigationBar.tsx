import { TriangleAlert, Map, Phone } from 'lucide-react';

interface NavigationBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function NavigationBar({ activeTab, onTabChange }: NavigationBarProps) {
  return (
    <div className="relative">
      {/* Curved Background */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0E1624] rounded-t-[24px] shadow-lg border-t border-white/5"></div>

      <div className="relative flex justify-between items-end px-8 pb-6 pt-4 h-24">
        {/* Alerts Tab */}
        <button
          onClick={() => onTabChange('alerts')}
          className="flex flex-col items-center gap-1 mb-1"
        >
          <TriangleAlert
            className={`w-6 h-6 ${activeTab === 'alerts' ? 'text-[#FF7A00]' : 'text-gray-500'}`}
            strokeWidth={2.5}
          />
          <span className={`text-[10px] font-medium ${activeTab === 'alerts' ? 'text-[#FF7A00]' : 'text-gray-500'}`}>
            Alerts
          </span>
        </button>

        {/* Map Tab (Floating Center) */}
        <div className="relative -top-6">
          <button
            onClick={() => onTabChange('map')}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${activeTab === 'map'
                ? 'bg-[#2A3B55] text-white border-4 border-[#0a0a0a]'
                : 'bg-[#1F2937] text-gray-400 border-4 border-[#0a0a0a]'
              }`}
          >
            <Map className="w-7 h-7" />
          </button>
        </div>

        {/* Hotlines Tab */}
        <button
          onClick={() => onTabChange('hotlines')}
          className="flex flex-col items-center gap-1 mb-1"
        >
          <Phone
            className={`w-6 h-6 ${activeTab === 'hotlines' ? 'text-white' : 'text-gray-500'}`}
            strokeWidth={2.5}
          />
          <span className={`text-[10px] font-medium ${activeTab === 'hotlines' ? 'text-white' : 'text-gray-500'}`}>
            Hotlines
          </span>
        </button>
      </div>
    </div>
  );
}
