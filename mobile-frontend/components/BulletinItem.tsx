import { LucideIcon } from 'lucide-react';

interface BulletinItemProps {
    icon: LucideIcon;
    title: string;
    description: string;
    time: string;
    type: 'warning' | 'advisory' | 'info';
}

export default function BulletinItem({ icon: Icon, title, description, time, type }: BulletinItemProps) {
    const getColors = () => {
        switch (type) {
            case 'warning':
                return {
                    bg: 'bg-orange-500/20',
                    icon: 'text-orange-500',
                    box: 'bg-orange-900/20'
                };
            case 'advisory':
                return {
                    bg: 'bg-blue-500/20',
                    icon: 'text-blue-400',
                    box: 'bg-blue-900/20'
                };
            default:
                return {
                    bg: 'bg-gray-500/20',
                    icon: 'text-gray-400',
                    box: 'bg-gray-900/20'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="glass-card p-4 flex items-start gap-4 mb-3">
            <div className={`w-12 h-12 rounded-xl ${colors.box} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-sm truncate pr-2">{title}</h3>
                    <span className="text-[10px] font-medium bg-white/10 px-1.5 py-0.5 rounded text-gray-300 whitespace-nowrap">
                        {time}
                    </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {description}
                </p>
            </div>
        </div>
    );
}
