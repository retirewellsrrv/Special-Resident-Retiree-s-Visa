'use client';

import { Footer } from '@/components/layout/Footer';
import ContactInfoSection from '@/components/contact/contact-info-section';
import Hero from '@/components/public/Hero';

export default function Contact() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            <Hero title={'Get in Touch'} description={'Whether you are ready to start your retirement journey in the Philippines or simply have a few questions about the process, our experts are here to assist you.'} />

            <section className="flex-grow max-w-6xl mx-auto w-full px-8 md:px-12 py-16">
                <ContactInfoSection />
            </section>

            <Footer />
        </div>
    );
}