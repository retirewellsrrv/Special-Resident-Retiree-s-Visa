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
                                    onConsultClick={() => router.push('/consult')}
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
                            onClick={() => router.push('/consult')}
                            className="px-6 py-3 border border-white/40 text-white text-sm font-semibold rounded hover:bg-white/10 transition whitespace-nowrap"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>

            </section>

            {/* Section 2: The Visa Deposit Framework */}
            <section className="max-w-6xl mx-auto w-full px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif text-[#0F172A] mb-4">The Visa Deposit Framework</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        The deposit requirement depends entirely on your age and whether you have a guaranteed lifetime pension.
                    </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#0F172A] text-white">
                                <th className="px-5 py-4 text-left font-semibold">Category</th>
                                <th className="px-5 py-4 text-left font-semibold">Age Bracket</th>
                                <th className="px-5 py-4 text-left font-semibold">With Qualifying Pension*</th>
                                <th className="px-5 py-4 text-left font-semibold">Without Pension</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[
                                ['SRRV Classic', '50+ years old', '$15,000', '$30,000'],
                                ['SRRV Classic', '40–49 years old', '$25,000', '$50,000'],
                                ['SRRV Courtesy (Former Filipinos)', '40+ years old', '$1,500 to $3,000', '$1,500 to $3,000'],
                                ['SRRV Courtesy (Foreign Diplomats/Military)', '40+ years old', '$1,500 to $3,000', '$1,500 to $6,000'],
                            ].map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-5 py-4 text-gray-700 whitespace-nowrap">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="mt-4 text-xs text-gray-500 italic">
                    *Qualifying Pension: Must be a lifetime monthly benefit of at least $800 for single applicants, or $1,000 for couples.
                </p>
            </section>

            {/* Section 3: Mandatory Government & Processing Fees */}
            <section className="max-w-6xl mx-auto w-full px-6 py-16 border-t border-gray-200">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-serif text-[#0F172A] mb-4">Mandatory Government &amp; Processing Fees</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        The following fees are required by the Philippine Retirement Authority (PRA) for processing your SRRV application.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-8">
                    {/* PRA Processing Fee */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-xl font-serif text-[#0F172A] mb-4">PRA Processing Fee (One-Time Payment)</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-700">Principal Applicant</span>
                                <span className="font-semibold text-[#0F172A]">$1,500</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-700">Dependent (Spouse or Child)</span>
                                <span className="font-semibold text-[#0F172A]">$300 per person</span>
                            </div>
                        </div>
                    </div>

                    {/* PRA Annual Fee */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-xl font-serif text-[#0F172A] mb-4">PRA Annual Fee</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-700">Principal + up to 2 dependents</span>
                                <span className="font-semibold text-[#0F172A]">$360 per year</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-700">Additional dependents (beyond first two)</span>
                                <span className="font-semibold text-[#0F172A]">$100 per year</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advisory Callout */}
                <div className="max-w-3xl mx-auto mt-10 bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
                    <span className="text-2xl shrink-0 mt-0.5">🛠️</span>
                    <div>
                        <h4 className="font-bold text-[#0F172A] mb-1">Let Retire Well Review Your Case</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Before you wire a single dollar, the team at Retire Well pre-vets your financial and pension documents
                            to ensure they meet strict Philippine Retirement Authority (PRA) standards, protecting you from costly
                            processing delays.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}