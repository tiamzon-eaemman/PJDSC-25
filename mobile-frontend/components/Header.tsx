import { Bell, MapPin } from 'lucide-react';

export default function Header() {
    return (
        <div className="flex justify-between items-start pt-6 pb-4 px-1">
            <div>
                <div className="flex items-center gap-1">
                    <h1 className="text-2xl font-black tracking-tight text-white">
                        SAGIP<span className="text-red-600">.PH</span>
                    </h1>
                </div>
            </div>

            <button className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a0a]"></div>
            </button>
        </div>
    );
}
