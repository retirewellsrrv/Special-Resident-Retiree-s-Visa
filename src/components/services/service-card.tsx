import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ReactNode } from "react";

export interface CardInfo {
    id: number;
    title: string;
    tagline: string;
    icon: ReactNode;
    deposit?: string;
    description: string;
    features?: string[]; 
}

// Extend CardInfo to include the specific click handler for the card
interface ServiceCardProps extends CardInfo {
    onConsultClick: () => void;
}

export default function ServiceCard({ 
    id, 
    title, 
    tagline, 
    icon, 
    deposit, 
    description, 
    features,
    onConsultClick 
}: ServiceCardProps) {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
            <div>
            {/* Header Row */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 shrink-0 bg-[#E2E8F0] rounded-xl flex items-center justify-center">
                {icon}
                </div>
                <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Option 0{id}</span>
                <h3 className="text-xl font-serif text-gray-900 group-hover:text-[#9E1B32] transition-colors">
                    {title}
                </h3>
                </div>
            </div>

            <p className="text-sm font-semibold text-slate-500 italic mb-4">{tagline}</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{description}</p>

            {/* Bullet Points */}
            <ul className="space-y-2.5 mb-8">
                {features?.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                </li>
                ))}
            </ul>
            </div>

            {/* Card Footer Info */}
            <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between">
            <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required Deposit</span>
                <span className="text-sm font-bold text-[#0F172A]">{deposit ?? 'N/A'}</span>
            </div>
            <button 
                onClick={onConsultClick}
                className="p-2 rounded-xl bg-gray-50 hover:bg-[#E2E8F0] text-[#9E1B32] transition"
                aria-label={`Inquire about ${title}`}
            >
                <ArrowRight className="w-4 h-4" />
            </button>
            </div>
        </div>
    );
}