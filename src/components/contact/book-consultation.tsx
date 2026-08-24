'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import ContactModal from '@/components/contact/contact-modal';

export default function BookConsultation() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-md border border-gray-100 w-full text-center">
        <div className="w-16 h-16 mx-auto bg-[#E2E8F0] rounded-2xl flex items-center justify-center mb-6">
          <CalendarDays className="w-8 h-8 text-[#9E1B32]" />
        </div>
        <h3 className="text-2xl font-serif text-[#0F172A] mb-3">Book a Consultation</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto mb-8">
          Schedule a call or meeting with our visa experts. Choose your preferred date and how you&apos;d like to connect.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#7A1527] text-white font-bold text-sm py-3.5 px-8 rounded-xl shadow-md hover:bg-[#63101E] transition-colors"
        >
          <CalendarDays className="w-4 h-4" />
          <span>Schedule Now</span>
        </button>
      </div>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
