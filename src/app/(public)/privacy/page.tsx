'use client';

import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/public/Hero';

const sections = [
  {
    title: 'Information We Collect',
    items: [
      'Personal identification information (name, email address, phone number, date of birth, nationality, and government-issued identification)',
      'Financial information required for SRRV eligibility assessment (time deposit amounts, pension statements)',
      'Supporting documents (passport copies, medical certificates, police clearance, photographs)',
      'Account credentials (email, password) when you register on our portal',
      'Communication records including emails, chat messages, and consultation notes',
    ],
  },
  {
    title: 'How We Collect Your Information',
    items: [
      'Directly from you when you fill out forms on our website, register for an account, or communicate with our team',
      'Through Google OAuth when you choose to sign in using your Google account',
      'Automatically through cookies and similar tracking technologies when you browse our site',
      'From third-party payment processors when you engage our paid services',
    ],
  },
  {
    title: 'How We Use Your Information',
    items: [
      'To process and manage your SRRV application through the Philippine Retirement Authority (PRA)',
      'To verify your identity and eligibility for the SRRV program',
      'To communicate with you regarding your application status, inquiries, and consultation schedules',
      'To improve our website, services, and user experience',
      'To comply with legal obligations and regulatory requirements of the Philippine government',
      'To detect and prevent fraudulent activities',
    ],
  },
  {
    title: 'Data Storage and Security',
    items: [
      'Your personal data is stored securely on Supabase, a SOC 2 compliant database platform with encrypted data storage',
      'All data transmission between your browser and our servers is encrypted using TLS/SSL protocols',
      'Access to your personal information is restricted to authorized personnel only, on a need-to-know basis',
      'We retain your personal data only as long as necessary to fulfill the purposes described in this policy, or as required by Philippine law',
    ],
  },
  {
    title: 'Data Sharing and Disclosure',
    items: [
      'We share your information with the Philippine Retirement Authority (PRA) and Bureau of Immigration as necessary for your visa application',
      'We may share information with PRA-accredited banks for deposit verification purposes',
      'We do not sell, trade, or rent your personal information to third parties',
      'We may disclose information if required by law, court order, or governmental regulation',
    ],
  },
  {
    title: 'Your Rights',
    items: [
      'The right to access the personal data we hold about you',
      'The right to request correction of inaccurate or incomplete data',
      'The right to request deletion of your personal data, subject to legal retention requirements',
      'The right to withdraw consent for data processing at any time',
      'The right to data portability in a commonly used electronic format',
      'To exercise these rights, please contact us at privacy@retirewell.ph',
    ],
  },
  {
    title: 'Cookies and Tracking',
    items: [
      'We use essential cookies to ensure the proper functioning of our website and portal',
      'Analytics cookies help us understand how visitors interact with our site to improve your experience',
      'You can control cookie preferences through your browser settings',
      'Disabling certain cookies may affect the functionality of our website',
    ],
  },
  {
    title: 'Third-Party Services',
    items: [
      'Supabase — cloud database and authentication provider',
      'Xendit — payment processing for service fees',
      'Google OAuth — optional social login functionality',
      'Vercel — web hosting and deployment platform',
      'Each third-party service has its own privacy policy governing the handling of your data',
    ],
  },
  {
    title: 'Changes to This Policy',
    items: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations',
      'Material changes will be notified through our website or via email',
      'Continued use of our services after changes constitutes acceptance of the updated policy',
      'This policy was last updated on July 14, 2026',
    ],
  },
  {
    title: 'Contact Us',
    items: [
      'Email: privacy@retirewell.ph',
      'Phone: +63 2 888 1234',
      'Address: Retire Well SRRV, Manila, Philippines',
      'For data protection inquiries, you may also contact the Philippine National Privacy Commission',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
      <Hero
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information when you use our SRRV consulting services."
      />

      <section className="flex-grow max-w-4xl mx-auto w-full px-6 py-16">
        <div className="space-y-12">
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600 leading-relaxed text-lg">
              Retire Well SRRV (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our website or use
              our SRRV visa consulting services.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg mt-4">
              By accessing our website or using our services, you acknowledge that you
              have read and understood this Privacy Policy.
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
