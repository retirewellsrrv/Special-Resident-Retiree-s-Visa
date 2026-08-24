import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ReactElement, ReactNode } from "react";

export default function ContactInfoSection() {
    return (
        <div className="lg:col-span-5 space-y-10">
        <div>
            <h2 className="text-3xl font-serif text-[#0F172A] mb-4">Contact Information</h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Reach out to us directly using the information below, or fill out the form to schedule a consultation. We aim to respond to all inquiries within 24 hours.
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <InfoCard icon={<Phone className="w-5 h-5"/>} title="Phone" primaryText="+63 2 888 1234" secondaryText={<>Available Mon-Fri, 9am - 6pm PHT</>} />

            <InfoCard icon={<Mail className="w-5 h-5"/>} title="Email" primaryText="consult@retirewell.ph"  secondaryText={<>For general inquiries and support</>}/>

            <InfoCard icon={<MapPin className="w-5 h-5" />} title="Office" primaryText="RetireWell Philippines" secondaryText={<>123 Ayala Avenue, Makati City <br /> Metro Manila, Philippines 1226</>} />

            <InfoCard icon={<Clock className="w-5 h-5" />} title="Business Hours" primaryText="Monday - Friday" secondaryText={<>9:00 AM - 6:00 PM (PST)</>} />
        </div>
    </div>
    );
}

interface InfoCardProps {
    icon: ReactNode;
    title: string;
    primaryText: string;
    secondaryText?: ReactElement;
}

function InfoCard({ icon, title, primaryText, secondaryText }: InfoCardProps) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#9E1B32]">
                {icon}
            </div>
            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {title}
                </h4>
                <p className="font-semibold text-[#0F172A]">
                    {primaryText}
                </p>
                {secondaryText && (
                    <p className="text-sm text-gray-500 mt-1">
                        {secondaryText}
                    </p>
                )}
            </div>
        </div>
    );
}