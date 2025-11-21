import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    value: string | number;
    label: string;
    iconColor?: string;
    iconBgColor?: string;
}

export default function StatCard({
    icon: Icon,
    value,
    label,
    iconColor = "text-blue-400",
    iconBgColor = "bg-blue-500/20"
}: StatCardProps) {
    return (
        <div className="glass-card p-4 flex flex-col items-center justify-center h-full min-h-[140px]">
            <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <span className="text-3xl font-bold text-white mb-1">{value}</span>
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</span>
        </div>
    );
}
