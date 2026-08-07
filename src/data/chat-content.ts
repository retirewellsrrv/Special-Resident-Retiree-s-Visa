// Central content for the "Budji" chat assistant.
// Keep answers in sync with the public FAQ page (src/app/(public)/faqs/page.tsx).
// CTA hrefs must point to existing routes only.

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  relatedIds: string[];
  cta?: { label: string; href: string };
}

export interface Category {
  name: string;
  questionIds: string[];
}

export const categories: Category[] = [
  { name: 'General Information', questionIds: ['what-is-srrv', 'who-qualifies', 'benefits', 'company-info', 'trust-signals'] },
  { name: 'Financials & Deposits', questionIds: ['options-deposit', 'bank-deposit', 'deposit-refund', 'family', 'pra-fees'] },
  { name: 'Services & Support', questionIds: ['services-offered', 'consultation', 'registration-process', 'contact-info', 'concierge'] },
  { name: 'Logistics & Paperwork', questionIds: ['documents', 'document-expiry', 'nbi-clearance', 'apostille', 'travel-during', 'own-land'] },
  { name: 'Application Process', questionIds: ['processing', 'full-process', 'application-stages', 'application-form', 'application-tracking', 'oath-affirmation'] },
];

export const questions: QAPair[] = [
  {
    id: 'what-is-srrv',
    question: 'What is the SRRV?',
    answer:
      "The Special Resident Retiree's Visa (SRRV) is a special non-immigrant visa issued by the Philippine Bureau of Immigration through the Philippine Retirement Authority (PRA). It entitles the holder to multiple-entry privileges with the right to stay permanently or indefinitely in the Philippines.",
    relatedIds: ['who-qualifies', 'benefits'],
    cta: { label: 'View Services', href: '/services' },
  },
  {
    id: 'who-qualifies',
    question: 'Who qualifies for the SRRV?',
    answer:
      'Foreign nationals and former Filipino citizens who are at least 50 years of age, meet the character requirements, and can fulfill the required financial time deposit in a PRA-accredited bank qualify for the program. For the SRRV Classic reduced deposit option, you need a monthly pension of at least $800 (individual) or $1,000 (couple).',
    relatedIds: ['what-is-srrv', 'options-deposit'],
    cta: { label: 'Check Eligibility', href: '/services' },
  },
  {
    id: 'benefits',
    question: 'What benefits do I get with an SRRV?',
    answer:
      'Beyond permanent residency, SRRV holders enjoy:\n\n\u2022 Exemption from Travel Tax (if not out of PH for over 1 year)\n\u2022 Streamlined BI compliance \u2014 no regular exit/re-entry clearances\n\u2022 One-time tax-free importation of household goods worth up to $7,000\n\u2022 Children can study without a Special Study Permit\n\u2022 You can work or start a business with an Alien Employment Permit (AEP)',
    relatedIds: ['what-is-srrv', 'own-land'],
  },
  {
    id: 'company-info',
    question: 'Is Retire Well SRRV a government agency?',
    answer:
      'No. Retire Well SRRV is an independent marketing and consulting firm specializing in the SRRV program. We provide private concierge services \u2014 preparing your application and escorting you through official government channels to ensure a smooth, error-free process.\n\nOur mission is to simplify your path to SRRV retirement in the Philippines. We are guided by four core values: Integrity (no hidden costs), Excellence (up-to-date on PRA regulations), Client-Centric approach, and Efficiency in every step.',
    relatedIds: ['what-is-srrv', 'services-offered'],
    cta: { label: 'About Us', href: '/about' },
  },
  {
    id: 'trust-signals',
    question: 'What is Retire Well\u2019s track record?',
    answer:
      'Retire Well SRRV has:\n\n\u2022 99% visa approval rate\n\u2022 10+ years of expertise in SRRV processing\n\u2022 500+ retirees successfully assisted\n\u2022 24/7 support access for clients\n\u2022 Dedicated concierge service from start to finish',
    relatedIds: ['company-info', 'services-offered'],
  },
  {
    id: 'options-deposit',
    question: 'What are the SRRV options and deposit amounts?',
    answer:
      'For retirees aged 50+, PRA offers:\n\n\u2022 SRRV Smile: $20,000 deposit \u2014 kept untouched in a PRA-accredited bank.\n\u2022 SRRV Classic: $10,000 deposit (with pension of $800+/mo individual or $1,000+/mo couple) or $20,000 (without pension). This deposit can be converted into approved investments like a condominium or long-term lease.\n\nAdditional service plans include SRRV Human Touch and SRRV Courtesy, with varying deposit structures.',
    relatedIds: ['bank-deposit', 'deposit-refund'],
    cta: { label: 'Compare Plans', href: '/packages' },
  },
  {
    id: 'bank-deposit',
    question: 'How does the bank deposit work?',
    answer:
      'The money remains entirely yours. The deposit must be sent via bank-to-bank inward remittance directly into a PRA-accredited bank account under your name. The funds are held as a time deposit. With SRRV Classic, you can later convert the deposit into approved investments like purchasing a condominium or funding a long-term housing lease.',
    relatedIds: ['options-deposit', 'deposit-refund'],
  },
  {
    id: 'deposit-refund',
    question: 'Can I get my deposit back if I leave the program?',
    answer:
      'Yes. The SRRV program guarantees full repatriation of your dollar time deposit if you cancel your visa and withdraw, provided all local administrative obligations and clearances are cleared.',
    relatedIds: ['bank-deposit', 'options-deposit'],
  },
  {
    id: 'family',
    question: 'Can I bring my family?',
    answer:
      'Yes. The base visa deposit covers the principal retiree and up to two dependents (spouse or unmarried children under 21). An additional deposit of $15,000 is required for each extra dependent beyond the first two (except for former Filipinos).',
    relatedIds: ['options-deposit', 'documents'],
  },
  {
    id: 'pra-fees',
    question: 'What are the PRA government fees?',
    answer:
      'The PRA government fees are:\n\n\u2022 Principal applicant: $1,400\n\u2022 Each dependent: $300\n\nThese fees are paid directly at the PRA office when you submit your application in person.',
    relatedIds: ['options-deposit', 'processing'],
    cta: { label: 'Start Application', href: '/register' },
  },
  {
    id: 'services-offered',
    question: 'What services does Retire Well offer?',
    answer:
      'Retire Well SRRV provides three core services:\n\n\u2022 SRRV Application Support \u2014 expert guidance through the entire visa process, ensuring all documentation meets PRA standards.\n\u2022 Marketing Consulting \u2014 strategic growth solutions for retirement-focused businesses.\n\u2022 Relocation Concierge \u2014 personalized assistance finding your home, navigating local real estate, and setting up utilities.\n\nService plans include SRRV Smile, Classic, Human Touch, and Courtesy \u2014 each designed for different retiree needs.',
    relatedIds: ['company-info', 'contact-info'],
    cta: { label: 'View Services', href: '/services' },
  },
  {
    id: 'consultation',
    question: 'Can I book a consultation before I apply?',
    answer:
      'Yes. Retire Well offers consultations to evaluate your eligibility, review your documents, and recommend the SRRV track that best fits your goals. Once you create an account, you can submit a consultation request through your portal and choose your preferred meeting time and communication mode (Zoom, Google Meet, WhatsApp, phone call, or face-to-face). A Senior Concierge Officer confirms your schedule once your consultation is settled.',
    relatedIds: ['contact-info', 'concierge', 'services-offered'],
    cta: { label: 'Contact Us', href: '/contact' },
  },
  {
    id: 'registration-process',
    question: 'How do I register for the SRRV portal?',
    answer:
      'Registering is a 4-step process:\n\n1. Register & verify your email\n2. Submit your application details\n3. Upload the required documents\n4. Track your application status\n\nOnce registered, you can monitor your progress through your personal dashboard.',
    relatedIds: ['application-form', 'application-stages'],
    cta: { label: 'Register Now', href: '/register' },
  },
  {
    id: 'contact-info',
    question: 'How can I contact Retire Well?',
    answer:
      'You can reach us through:\n\n\u2022 Phone: +63 2 888 1234\n\u2022 Email: consult@retirewell.ph\n\u2022 Office: 123 Ayala Avenue, Makati City, Metro Manila, Philippines 1226\n\u2022 Hours: Monday \u2013 Friday, 9:00 AM \u2013 6:00 PM (PST)\n\nAlternatively, fill out the contact form on our website and we will get back to you promptly.',
    relatedIds: ['services-offered', 'concierge'],
    cta: { label: 'Contact Us', href: '/contact' },
  },
  {
    id: 'concierge',
    question: 'Who will assist me with my application?',
    answer:
      'Each applicant is assigned a dedicated Senior Concierge Officer who guides you from start to finish. For example:\n\n\u2022 Maria Santos, Senior Concierge Officer\n\u2022 Email: maria.santos@pra.gov.ph\n\u2022 Phone: +63 (2) 8888-1234\n\u2022 Location: PRA Main Office, Makati City\n\nYour concierge coordinates appointments, escorts you to PRA and local clinics, and ensures your application moves smoothly through every stage.',
    relatedIds: ['contact-info', 'services-offered'],
    cta: { label: 'Get Started', href: '/register' },
  },
  {
    id: 'documents',
    question: 'What documents are required?',
    answer:
      'Required documents include:\n\n1. Valid passport (at least 6 months validity)\n2. PRA Application Forms (completed and signed)\n3. Birth certificate (Apostilled)\n4. Marriage certificate if applicable (Apostilled)\n5. NBI or police clearance from country of origin (Apostilled)\n6. Medical certificate (DOH Medical Form)\n7. Bank certificate showing the time deposit\n8. 12 passport-sized photos (2" x 2")\n\nIn our online portal you will upload the full checklist: Passport, 2\u00d72 ID Photo, PRA Application Form, Medical Clearance Certificate, Police Clearance, Bureau of Immigration Clearance Certificate (BICC), Bank Certification, Proof of Payment, and (where applicable) Proof of Pension and Proof of Relationship for dependents. Each document is reviewed by our team and tracked on your dashboard.',
    relatedIds: ['document-expiry', 'apostille'],
    cta: { label: 'Get Document Help', href: '/contact' },
  },
  {
    id: 'document-expiry',
    question: 'How long are my documents valid?',
    answer:
      'Police clearances (e.g., FBI background check for US citizens) and medical certificates must be issued within 6 months of your formal application submission to the PRA. If your documents are older than 6 months, you will need to obtain updated versions before applying.',
    relatedIds: ['documents', 'nbi-clearance'],
  },
  {
    id: 'nbi-clearance',
    question: 'When do I need an NBI clearance?',
    answer:
      'An NBI clearance is required if you have stayed in the Philippines for more than 30 days prior to submitting your application. Otherwise, a police clearance from your home country (Apostilled) is sufficient.',
    relatedIds: ['documents', 'document-expiry'],
  },
  {
    id: 'apostille',
    question: 'What does Apostille mean for my documents?',
    answer:
      'All official documents issued abroad must be legally authenticated for the Philippine government to accept them. If your country is a member of the Apostille Convention, get them "Apostilled" by your government. If not, they must be authenticated by the Philippine Embassy or Consulate in your country of origin.',
    relatedIds: ['documents', 'processing'],
  },
  {
    id: 'travel-during',
    question: 'Can I travel while my application is being processed?',
    answer:
      'No. During the final processing stage, your original physical passport is surrendered to the PRA and the Bureau of Immigration for visa stamping. Because you will not have your passport, you cannot clear international borders until the visa is finalized and returned to you.',
    relatedIds: ['processing', 'full-process'],
  },
  {
    id: 'own-land',
    question: 'Can I own land as an SRRV holder?',
    answer:
      'Under Philippine law, foreign nationals cannot own land outright. However, as an SRRV holder, you can legally purchase and fully own a condominium unit in your name, or enter into a secure, long-term lease agreement for land or a house.',
    relatedIds: ['benefits', 'what-is-srrv'],
  },
  {
    id: 'processing',
    question: 'How long does processing take?',
    answer:
      'Final PRA processing takes about 7 to 10 working days once all original documents are submitted and the inward bank remittance is confirmed. Documents like police clearances and medical certificates must be issued within 6 months of your application submission.',
    relatedIds: ['documents', 'full-process'],
    cta: { label: 'Start Your Application', href: '/register' },
  },
  {
    id: 'full-process',
    question: 'What is the step-by-step application process?',
    answer:
      'The SRRV application has two phases:\n\nPhase 1 \u2014 Pre-Arrival (Home Country):\n1. Choose your SRRV track (Smile or Classic)\n2. Gather & legalize documents (1\u20132 months)\n3. Wire your visa deposit to a PRA-accredited bank\n\nPhase 2 \u2014 On-the-Ground (Philippines):\n4. Arrive on tourist visa & pre-evaluation at PRA\n5. Complete medical clearances at DOH-accredited clinics\n6. Submit application, pay government fees ($1,400/$300), and capture biometrics at PRA\n7. Immigration endorsement & stamping (7\u201310 working days)\n8. Attend Oath of Affirmation ceremony \u2014 receive your stamped passport, PRA ID, and SRRV Certification',
    relatedIds: ['processing', 'application-stages'],
    cta: { label: 'Start Your Journey', href: '/register' },
  },
  {
    id: 'application-stages',
    question: 'What happens after I submit my application?',
    answer:
      'After submission, your application progresses through 4 stages in your dashboard:\n\n1. Initiation \u2014 documents received and under initial review\n2. Deposit \u2014 payment confirmed and verified\n3. Verification \u2014 PRA processing your application\n4. Issuance \u2014 visa approved and ready for release\n\nYou can track your current stage through your personal applicant portal at any time.',
    relatedIds: ['full-process', 'application-form'],
  },
  {
    id: 'application-form',
    question: 'What does the application form include?',
    answer:
      'The online application form has 6 steps:\n\n1. Personal Details \u2014 name, DOB, sex, nationality, marital status\n2. Contact Information \u2014 email, phone, address, PH address, emergency contact\n3. Service Selection \u2014 choose your SRRV plan\n4. Document Checklist \u2014 upload passport, visa, NBI, pension, medical\n5. Review Application \u2014 confirm all details\n6. Under Review \u2014 application submitted\n\nYour application reference code will be in the format: SRRV-[timestamp]-[random].',
    relatedIds: ['registration-process', 'application-stages'],
    cta: { label: 'Apply Now', href: '/register' },
  },
  {
    id: 'application-tracking',
    question: 'How do I track my application after submitting?',
    answer:
      'Register and sign in to your applicant dashboard to track everything in real time. Your application moves through 4 stages \u2014 Initiation, Deposit, Verification, and Issuance \u2014 and each required document shows its verification status. You also receive in-portal notifications whenever a payment is confirmed or your application status changes.',
    relatedIds: ['application-stages', 'registration-process'],
    cta: { label: 'Get Started', href: '/register' },
  },
  {
    id: 'oath-affirmation',
    question: 'What is the Oath of Affirmation?',
    answer:
      'The Oath of Affirmation is the final step of the SRRV process. You attend a brief official ceremony at the PRA where you take your oath as a permanent resident. You are then handed:\n\n\u2022 Your stamped passport\n\u2022 Your official PRA Membership ID card\n\u2022 Your SRRV Certification\n\nYou are now officially a permanent resident of the Philippines!',
    relatedIds: ['full-process', 'application-stages'],
  },
];

export const questionMap = new Map(questions.map((q) => [q.id, q]));
