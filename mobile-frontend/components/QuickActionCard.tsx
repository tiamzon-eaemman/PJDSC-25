import { LucideIcon } from 'lucide-react';

interface QuickActionProps {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
}

export default function QuickActionCard({ icon: Icon, label, onClick }: QuickActionProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-[#131C2D] rounded-2xl border border-white/5 active:scale-95 transition-transform w-full aspect-[4/3]"
        >
            <div className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center text-emerald-500">
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </button>
    );
}
