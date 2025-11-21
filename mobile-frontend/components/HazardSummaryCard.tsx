import { ScrollText } from 'lucide-react';

interface HazardSummaryProps {
    summary: string;
    title?: string;
    updatedAt?: string;
}

export default function HazardSummaryCard({ summary, title = 'Plan', updatedAt }: HazardSummaryProps) {
    return (
        <div className="bg-[#131C2D] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <ScrollText className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-sm">{title}</h3>
                {updatedAt && (
                    <span className="ml-auto text-[10px] text-gray-500 font-mono" title="Last updated">{updatedAt}</span>
                )}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {summary}
            </p>
        </div>
    );
}
