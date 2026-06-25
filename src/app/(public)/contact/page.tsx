'use client';

import { Footer } from '@/components/layout/Footer';
import ContactInfoSection from '@/components/contact/contact-info-section';
import ContactModal from '@/components/contact/contact-modal';
import Hero from '@/components/public/Hero';

export default function Contact() {

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            {/* Hero Section */}
            <Hero title={'Get in Touch'} description={'Whether you are ready to start your retirement journey in the Philippines or simply have a few questions about the process, our experts are here to assist you.'} />

            {/* Main Content Section */}
            <section className="flex-grow max-w-6xl mx-auto w-full px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                {/* Left Column: Contact Information */}
                <ContactInfoSection />

                {/* Right Column: Contact Form */}
                <ContactModal />

            </section>

            <Footer />
        </div>
    );
}