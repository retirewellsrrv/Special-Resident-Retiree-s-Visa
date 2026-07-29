'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/public/Hero';

export default function Services() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/register');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">

            {/* Hero Section */}
            <Hero title="Our Retirement Services" description="Discover personalized SRRV solutions and dedicated concierge programs designed to simplify your retirement journey in the Philippines. From initial consultation to application support, we provide professional guidance every step of the way to help you transition with confidence and ease."/>

            <section className="max-w-6xl mx-auto w-full px-6 py-16 flex-grow">

                {/* What is SRRV? */}
                <div className="bg-[#9E1B32] rounded-2xl p-8 md:p-12 text-white mb-12 shadow-md">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                        What is the Special Resident Retiree&apos;s Visa (SRRV)?
                    </h2>
                    <div className="space-y-4 text-white/90 text-center leading-relaxed max-w-4xl mx-auto">
                        <p>
                            The Special Resident Retiree&apos;s Visa (SRRV) is a special non-immigrant visa program that allows eligible foreign nationals to live in the Philippines on a long-term basis. Designed for retirees and qualified individuals, the SRRV offers a convenient pathway for those who wish to make the Philippines their second home, enjoy retirement, or establish an investment base in the country.
                        </p>
                        <p>
                            The program is administered by the Philippine Retirement Authority (PRA) and offers several SRRV categories to accommodate different applicant profiles, including retirees with pensions, former Filipino citizens, and other qualified foreign nationals.
                        </p>
                        <p>
                            Effective September 2025, the minimum qualifying age for eligible SRRV applicants is 40 years old, subject to the applicable PRA guidelines and requirements.
                        </p>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
                    
                    {/* SRRV Classic */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col h-full text-center">
                        <h3 className="text-xl font-bold text-[#0F172A] mb-4">SRRV CLASSIC</h3>
                        <p className="text-sm text-gray-600 mb-8 uppercase leading-relaxed font-medium">
                            Ideal for both pensioners and non-pensioners, with the option to convert the required SRRV time deposit into eligible PRA-approved investments.
                        </p>
                        <div className="mt-auto space-y-6">
                            <div>
                                <h4 className="font-bold text-[#0F172A] mb-2">VISA DEPOSIT:</h4>
                                <div className="text-sm text-gray-700">
                                    <p className="font-bold mb-1">50 YEARS OLD AND ABOVE</p>
                                    <p>* PENSIONER: $15,000 USD</p>
                                    <p>* NON-PENSIONER: $30,000 USD</p>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-700">
                                    <p className="font-bold mb-1">40-49 YEARS OLD</p>
                                    <p>* PENSIONER: $25,000 USD</p>
                                    <p>* NON-PENSIONER: $50,000 USD</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SRRV Courtesy Foreign */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col h-full text-center">
                        <h3 className="text-xl font-bold text-[#0F172A] mb-4">SRRV COURTESY<br/>(FOREIGN NATIONALS)</h3>
                        <p className="text-sm text-gray-600 mb-8 uppercase leading-relaxed font-medium">
                            Designed for qualified foreign nationals, including former diplomats, retired military personnel, officials of international organizations, and individuals with outstanding achievements in business, academics, arts, culture, music, sports, or philanthropy.
                        </p>
                        <div className="mt-auto space-y-6">
                            <div>
                                <h4 className="font-bold text-[#0F172A] mb-2">VISA DEPOSIT:</h4>
                                <div className="text-sm text-gray-700">
                                    <p className="font-bold mb-1">50 YEARS OLD AND ABOVE</p>
                                    <p>PENSIONER OR NON-PENSIONER: $1,500 USD</p>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-700">
                                    <p className="font-bold mb-1">40-49 YEARS OLD</p>
                                    <p>* PENSIONER: $3,000 USD</p>
                                    <p>* NON-PENSIONER: $6,000 USD</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SRRV Courtesy Filipino */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col h-full text-center">
                        <h3 className="text-xl font-bold text-[#0F172A] mb-4">SRRV COURTESY<br/>(FORMER FILIPINOS)</h3>
                        <p className="text-sm text-gray-600 mb-8 uppercase leading-relaxed font-medium">
                            Designed for former Filipino citizens who have become naturalized in another country and have not reacquired Philippine citizenship.
                        </p>
                        <div className="mt-auto space-y-6">
                            <div>
                                <h4 className="font-bold text-[#0F172A] mb-2">VISA DEPOSIT:</h4>
                                <div className="text-sm text-gray-700">
                                    <p className="font-bold mb-1">50 YEARS OLD AND ABOVE</p>
                                    <p>PENSIONER OR NON-PENSIONER: $1,500 USD</p>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-700">
                                    <p className="font-bold mb-1">40-49 YEARS OLD</p>
                                    <p>PENSIONER OR NON-PENSIONER: $3,000 USD</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Fees Section */}
                <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        
                        {/* Processing Fee */}
                        <div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-6">PRA Processing / Service Fee <span className="text-base font-normal text-gray-500">(one time)</span></h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-700">Principal:</span>
                                    <span className="font-bold text-[#0F172A]">USD 1,500.00</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-700">Dependent:</span>
                                    <span className="font-bold text-[#0F172A]">USD 300.00 <span className="text-sm font-normal text-gray-500">each dependent</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Annual Fee */}
                        <div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-6">PRA Annual Fee</h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 text-[#9E1B32] text-sm">▶</div>
                                    <div>
                                        <p className="text-gray-900"><span className="font-bold">SRRV Classic</span> - USD 360.00</p>
                                        <p className="text-sm text-gray-500 italic">(Additional USD 100.00 for each Dependent in excess of two)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 text-[#9E1B32] text-sm">▶</div>
                                    <div>
                                        <p className="text-gray-900"><span className="font-bold">SRRV Courtesy for Foreign Nationals</span> - USD 100.00</p>
                                        <p className="text-sm text-gray-500 italic">(Additional USD 10.00 for each dependent in excess of two)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 text-[#9E1B32] text-sm">▶</div>
                                    <div>
                                        <p className="text-gray-900"><span className="font-bold">SRRV Courtesy for Former Filipinos</span> - USD 50.00</p>
                                        <p className="text-sm text-gray-500 italic">(Additional USD 10.00 for each Dependent in excess of two)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
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

            <Footer />
        </div>
    );
}