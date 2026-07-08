'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Smile,
    HeartHandshake,
    Award,
    Compass
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import ConsultationModal from '@/components/faqs/consultation-modal';
import ServiceCard from '@/components/services/service-card';
import Hero from '@/components/public/Hero';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { LucideIcon } from 'lucide-react';

const supabase = createClient();

type Service = {
    created_at: string;
    description: string;
    highlighted: boolean;
    id: number;
    is_available: boolean;
    name: string;
    price: number;
    price_note: string | null;
    subtitle: string;
    tags: string[];
    type: Database["public"]["Enums"]["service_type"];
    updated_at: string;
};

const iconMap: Record<string, LucideIcon> = {
    'SRRV Classic': ShieldCheck,
    'SRRV Smile': Smile,
    'SRRV Human Touch': HeartHandshake,
    'SRRV Courtesy': Award,
};

export default function Services() {
    const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

    const [plans, setPlans] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/register');
    };

    useEffect(() => {
        async function fetchServices() {
            const { data, error } = await supabase.from('service_plans').select('*');

            if (error) {
                console.error('Error fetching services:', error);
            } else if (data) {
                setPlans(data as Service[]);
            }
            setLoading(false);
            console.log('Fetched data:', data);
        }

        fetchServices();
    }, []);

        return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">

            {/* Hero Section */}
            <Hero title="Our Retirement Services" description="Explore our tailored visa pathways and concierge programs designed to make your transition to retiring in the Philippines entirely seamless."/>

            {/* Services Grid & CTA */}
            <section className="max-w-6xl mx-auto w-full px-6 py-16 flex-grow">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {loading ? (
                        /* Skeleton Loading State */
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
                                {/* Icon & Title Skeleton */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                {/* Description Skeleton */}
                                <div className="space-y-2 mb-6 flex-grow">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                </div>
                                {/* Tags Skeleton */}
                                <div className="flex gap-2 mb-6">
                                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                                </div>
                                {/* Price & Button Skeleton */}
                                <div className="mt-auto border-t border-gray-100 pt-4">
                                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))
                    ) : plans.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No services available at the moment.
                        </div>
                    ) : (
                        plans.map((service) => {
                            const IconComponent = iconMap[service.name] || Compass;

                            return (
                                <ServiceCard
                                    key={service.id}
                                    id={service.id}
                                    name={service.name}
                                    subtitle={service.subtitle}
                                    description={service.description}
                                    price={service.price}
                                    price_note={service.price_note}
                                    tags={service.tags}
                                    icon={<IconComponent className="w-6 h-6 text-[#9E1B32]" />}
                                    onConsultClick={() => setIsConsultModalOpen(true)}
                                />
                            );
                        })
                    )}
                </div>

                {/* Dynamic CTA Banner */}
                <div className="mt-16 bg-[#9E1B32] rounded-xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                    <div className="text-white max-w-lg">
                        <h3 className="text-2xl font-serif mb-2">Unsure which track fits your needs?</h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                            Our relocation consultants will evaluate your eligibility profiles and match you with the optimal program strategy.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={handleGetStarted}
                            className="px-6 py-3 bg-white text-[#9E1B32] text-sm font-semibold rounded shadow-sm hover:bg-gray-50 transition whitespace-nowrap"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => setIsConsultModalOpen(true)}
                            className="px-6 py-3 border border-white/40 text-white text-sm font-semibold rounded hover:bg-white/10 transition whitespace-nowrap"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>

            </section>

            {/* Global Interactive Elements */}
            <ConsultationModal
                isOpen={isConsultModalOpen}
                onClose={() => setIsConsultModalOpen(false)}
            />
            <Footer />
        </div>
    );
}