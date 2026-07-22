'use client';

import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/public/Hero';

const sections = [
  {
    title: 'Acceptance of Terms',
    items: [
      'By accessing or using the Retire Well SRRV website and services, you agree to be bound by these Terms of Service',
      'If you do not agree with any part of these terms, you must discontinue use of our services immediately',
      'We reserve the right to update these terms at any time, with notice provided via our website or email',
    ],
  },
  {
    title: 'Services Description',
    items: [
      'Retire Well SRRV provides online marketing, consulting, and concierge services for the Philippine Retirement Authority\'s (PRA) Special Resident Retiree\'s Visa (SRRV) program',
      'Our services include application guidance, document preparation assistance, PRA appointment coordination, and relocation concierge support',
      'We are an independent consulting firm and are not a government agency. We do not guarantee visa approval, as final approval rests solely with the PRA',
      'Service fees are separate from and in addition to any government fees, deposits, or bonds required by the PRA',
    ],
  },
  {
    title: 'User Accounts and Registration',
    items: [
      'You must provide accurate, complete, and current information when creating an account on our portal',
      'You are responsible for safeguarding your account credentials and for all activities under your account',
      'We reserve the right to suspend or terminate accounts that provide false information or violate these terms',
      'Account registration requires you to be at least 18 years of age',
    ],
  },
  {
    title: 'Payments and Fees',
    items: [
      'Consultation and service fees are processed through Xendit, our third-party payment processor',
      'All fees are quoted in US Dollars (USD) unless otherwise stated',
      'Payments are due at the time of service engagement unless alternative arrangements are agreed upon in writing',
      'Refund requests are evaluated on a case-by-case basis and processed in accordance with our Refund Policy',
      'The required time deposit for the SRRV program is held in a PRA-accredited bank and is not collected by Retire Well SRRV',
    ],
  },
  {
    title: 'User Obligations',
    items: [
      'You agree to provide truthful and accurate information in all forms, applications, and communications',
      'You are responsible for obtaining and maintaining all necessary documents required for your SRRV application',
      'You agree not to use our services for any unlawful purpose or in violation of Philippine laws and regulations',
      'You agree to cooperate with our team in a timely manner to ensure smooth processing of your application',
    ],
  },
  {
    title: 'Intellectual Property',
    items: [
      'All content on our website, including text, graphics, logos, and software, is the property of Retire Well SRRV',
      'You may not reproduce, distribute, modify, or create derivative works without our prior written consent',
      'Our name, logo, and brand assets may not be used without explicit permission',
    ],
  },
  {
    title: 'Limitation of Liability',
    items: [
      'Retire Well SRRV acts as a consulting and concierge service and is not liable for decisions made by the PRA, Bureau of Immigration, or other government agencies',
      'We are not responsible for delays caused by incomplete documentation, inaccurate information provided by the client, or unforeseen government processing delays',
      'Our liability is limited to the total fees paid for the specific service giving rise to the claim',
      'We are not liable for any indirect, incidental, or consequential damages arising from the use of our services',
    ],
  },
  {
    title: 'Privacy and Data Protection',
    items: [
      'Your use of our services is governed by our Privacy Policy, which explains how we collect, use, and protect your personal information',
      'By using our services, you consent to the collection and processing of your data as described in our Privacy Policy',
      'We implement appropriate security measures to protect your data but cannot guarantee absolute security',
    ],
  },
  {
    title: 'Termination',
    items: [
      'Either party may terminate the service agreement with written notice as specified in your service contract',
      'We reserve the right to refuse service to anyone at any time for violation of these terms',
      'Upon termination, you remain responsible for any fees incurred prior to termination',
    ],
  },
  {
    title: 'Governing Law',
    items: [
      'These terms are governed by the laws of the Republic of the Philippines',
      'Any disputes arising from these terms shall be resolved through amicable negotiation before seeking legal remedies',
      'If a dispute cannot be resolved through negotiation, it shall be submitted to the appropriate courts of Manila, Philippines',
    ],
  },
  {
    title: 'Contact',
    items: [
      'For questions about these terms, please contact us at legal@retirewell.ph',
      'Phone: +63 2 888 1234',
      'Retire Well SRRV, Manila, Philippines',
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
      <Hero
        title="Terms of Service"
        description="The terms and conditions governing your use of Retire Well SRRV consulting services and website."
      />

      <section className="flex-grow max-w-4xl mx-auto w-full px-6 py-16">
        <div className="space-y-12">
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600 leading-relaxed text-lg">
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the Retire Well SRRV
              website, portal, and consulting services. By using our services, you agree to these Terms.
              Please read them carefully.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-2xl font-serif text-[#0F172A] mb-4">{section.title}</h2>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9E1B32]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
