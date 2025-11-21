import { CloudRain, Wind, CloudLightning } from 'lucide-react';

export default function StatusCard() {
    return (
        <div className="status-card-gradient rounded-[32px] p-6 text-white relative overflow-hidden shadow-lg shadow-red-900/20">
            {/* Background glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider mb-4">
                    CURRENT STATUS
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-black leading-tight mb-1">SIGNAL</h2>
                        <h2 className="text-4xl font-black leading-tight mb-6">NO. 2</h2>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-yellow-400">
                        <CloudLightning className="w-6 h-6" />
                    </div>
                </div>

                <p className="text-white/90 text-sm leading-relaxed mb-8 max-w-[90%]">
                    Tropical Storm &quot;Ignis&quot; approaching. Heavy rainfall expected.
                </p>

                <div className="flex items-center gap-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-white/70" />
                        <span className="font-semibold text-sm">65 km/h Winds</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CloudRain className="w-5 h-5 text-blue-300" />
                        <span className="font-semibold text-sm">Heavy Rain</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
