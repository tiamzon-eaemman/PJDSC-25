import { TriangleAlert, Wind, ArrowUpRight, Gauge } from 'lucide-react';
import { TyphoonDetails } from '@/lib/types';

interface ActiveAdvisoryProps {
    typhoon?: TyphoonDetails;
    issuedAt: string;
}

function signalColor(signal?: number) {
    if (!signal) return 'bg-gray-500 text-gray-100';
    if (signal >= 5) return 'bg-purple-600 text-white';
    if (signal === 4) return 'bg-red-600 text-white';
    if (signal === 3) return 'bg-orange-500 text-white';
    if (signal === 2) return 'bg-yellow-500 text-yellow-950';
    return 'bg-emerald-500 text-emerald-950';
}

export default function ActiveAdvisoryCard({ typhoon, issuedAt }: ActiveAdvisoryProps) {
    const title = typhoon ? typhoon.name.toUpperCase() : 'NO ACTIVE ADVISORY';
    return (
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#FF5F1F] to-[#D9381E] p-6 text-white shadow-lg shadow-orange-900/20">
            <TriangleAlert className="absolute -right-4 -top-4 w-40 h-40 text-white/10 rotate-12" />
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        ACTIVE ADVISORY
                    </div>
                    {typhoon && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${signalColor(typhoon.signal)}`}>
                            SIGNAL #{typhoon.signal}
                        </span>
                    )}
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-tight">
                    {title}
                </h2>
                {issuedAt && <p className="text-white/70 text-[11px] font-mono">Issued: {issuedAt}</p>}
                {typhoon && (
                    <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="flex flex-col gap-1 bg-white/10 rounded-lg p-2">
                            <div className="flex items-center gap-1 text-white/80 font-semibold"><Wind className="w-3 h-3" />Wind</div>
                            <div className="text-sm font-bold">{typhoon.wind_kmh} km/h</div>
                        </div>
                        <div className="flex flex-col gap-1 bg-white/10 rounded-lg p-2">
                            <div className="flex items-center gap-1 text-white/80 font-semibold"><ArrowUpRight className="w-3 h-3" />Movement</div>
                            <div className="text-sm font-bold">{typhoon.movement}</div>
                        </div>
                        <div className="flex flex-col gap-1 bg-white/10 rounded-lg p-2">
                            <div className="flex items-center gap-1 text-white/80 font-semibold"><Gauge className="w-3 h-3" />Intensity</div>
                            <div className="text-sm font-bold">
                                {typhoon.signal >= 5 ? 'SUPER TYPHOON' : typhoon.signal >= 4 ? 'SEVERE' : typhoon.signal >= 3 ? 'INTENSE' : typhoon.signal >= 2 ? 'MODERATE' : 'LOW'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
