import { Phone } from 'lucide-react';

interface ContactCardProps {
    name: string;
    number: string;
}

export default function ContactCard({ name, number }: ContactCardProps) {
    return (
        <div className="bg-[#131C2D] rounded-2xl p-5 border border-white/5 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-white text-sm mb-1">{name}</h3>
                <p className="text-gray-400 text-xs font-mono">{number}</p>
            </div>

            <a
                href={`tel:${number.replace(/-/g, '')}`}
                className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
            >
                <Phone className="w-5 h-5 text-white" />
            </a>
        </div>
    );
}
