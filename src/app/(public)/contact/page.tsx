'use client';

import { Footer } from '@/components/layout/Footer';
import ContactInfoSection from '@/components/contact/contact-info-section';
import ContactModal from '@/components/contact/contact-modal';

export default function Contact() {

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#F6F5F2] pt-24 pb-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Get in Touch</h1>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed">
          Whether you are ready to start your retirement journey in the Philippines or simply have a few questions about the process, our experts are here to assist you.
        </p>
      </section>

      {/* Main Content Section */}
      <section className="flex-grow max-w-6xl mx-auto w-full px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

        {/* Left Column: Contact Information */}
       <ContactInfoSection/>

        {/* Right Column: Contact Form */}
       <ContactModal  />

      </section>

      <Footer />
    </div>
  );
}