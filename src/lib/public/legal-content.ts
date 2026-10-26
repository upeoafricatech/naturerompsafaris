import { BRAND_CONTACT_DEFAULTS, BRAND_LEGAL_NAME } from '@/config/brand';
import { localePath } from '@/lib/public/locale-path';

export type LegalSection = {
  id: string;
  listAfterParagraphIndex?: number;
  listItems?: string[];
  paragraphs: string[];
  title: string;
};

export type LegalPageDefinition = {
  description: string;
  eyebrow?: string;
  intro?: string | string[];
  lastUpdated: string;
  sections: LegalSection[];
  slug: string;
  title: string;
};

export type LegalFooterLink = {
  href: string;
  label: string;
};

const company = BRAND_LEGAL_NAME;
const tradingName = BRAND_CONTACT_DEFAULTS.companyName;
const email = BRAND_CONTACT_DEFAULTS.email;
const address = BRAND_CONTACT_DEFAULTS.addressShort;
const legalParties = `${company} ("${tradingName}", "we", "us")`;

export const LEGAL_PAGES: LegalPageDefinition[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    eyebrow: 'Legal',
    description:
      'How Nature Romp Safaris Ltd collects, uses, stores, and protects personal data in line with GDPR and international privacy standards.',
    lastUpdated: '2026-09-14',
    sections: [
      {
        id: 'introduction',
        title: '1. Introduction',
        paragraphs: [
          `${legalParties} respects your privacy and is committed to protecting personal data. This Privacy Policy explains how we process information when you visit our website, enquire about a safari, book travel services, or communicate with us.`,
          'This policy is designed to meet the transparency requirements of the EU General Data Protection Regulation (GDPR), the UK GDPR, and comparable international privacy frameworks.'
        ]
      },
      {
        id: 'controller',
        title: '2. Data Controller',
        paragraphs: [
          `Data controller: ${company}`,
          `Registered address: ${address}`,
          `Email: ${email}`,
          'For privacy-related requests, contact us using the details above with the subject line "Privacy Request".'
        ]
      },
      {
        id: 'data-we-collect',
        title: '3. Personal Data We Collect',
        paragraphs: ['We may collect the following categories of personal data:'],
        listItems: [
          'Identity and contact data (name, email, phone, nationality, passport details where required for bookings)',
          'Booking and travel data (dates, destinations, group size, preferences, dietary or accessibility requirements)',
          'Payment-related data (billing details; card data is processed by our payment providers. We do not store full card numbers)',
          'Technical data (IP address, browser type, device identifiers, cookies. See our [Cookie Policy](/cookie-policy))',
          'Communications (emails, calls, WhatsApp messages, enquiry forms, feedback and reviews)',
          'Marketing preferences (newsletter opt-in where applicable)'
        ]
      },
      {
        id: 'lawful-basis',
        title: '4. Lawful Bases for Processing',
        paragraphs: [
          'We process personal data only where a lawful basis applies under GDPR Article 6:'
        ],
        listItems: [
          'Contract: to prepare quotes, confirm bookings, and deliver safari services',
          'Legitimate interests: to respond to enquiries, improve our website, prevent fraud, and operate our business securely',
          'Consent: for optional marketing communications and non-essential cookies where required',
          'Legal obligation: for tax, accounting, tourism licensing, and regulatory record-keeping'
        ]
      },
      {
        id: 'sharing',
        title: '5. Sharing Personal Data',
        paragraphs: [
          'We share data only as necessary to deliver your safari or comply with law. Recipients may include lodges, airlines, park authorities, ground handlers, payment processors, IT providers, and professional advisers. All processors are required to protect data under contractual safeguards.',
          'We do not sell personal data.'
        ]
      },
      {
        id: 'international-transfers',
        title: '6. International Transfers',
        paragraphs: [
          'Your data may be processed in Kenya, the European Economic Area, the United Kingdom, the United States, or other countries where our service providers operate. Where transfers occur outside jurisdictions with adequacy decisions, we implement appropriate safeguards such as Standard Contractual Clauses or equivalent mechanisms.'
        ]
      },
      {
        id: 'retention',
        title: '7. Data Retention',
        paragraphs: [
          'We retain personal data only as long as necessary for the purposes described in this policy, including legal, tax, and dispute-resolution requirements. Enquiry records are typically retained for up to 24 months unless a booking proceeds; booking records are retained in accordance with applicable commercial and regulatory obligations.'
        ]
      },
      {
        id: 'your-rights',
        title: '8. Your Rights',
        paragraphs: ['Depending on your location, you may have the right to:'],
        listItems: [
          'Access a copy of your personal data',
          'Rectify inaccurate or incomplete data',
          'Erase data in certain circumstances ("right to be forgotten")',
          'Restrict or object to processing in certain circumstances',
          'Data portability where processing is based on consent or contract and automated',
          'Withdraw consent at any time for consent-based processing',
          'Lodge a complaint with a supervisory authority (e.g. ODPC in Kenya, ICO in the UK, or your local EU authority)'
        ]
      },
      {
        id: 'security',
        title: '9. Security',
        paragraphs: [
          'We implement appropriate technical and organisational measures to protect personal data against unauthorised access, loss, or misuse. No method of transmission over the internet is completely secure; we encourage you to use strong passwords and protect your devices.'
        ]
      },
      {
        id: 'children',
        title: '10. Children',
        paragraphs: [
          'Our services are not directed at children under 16. We do not knowingly collect personal data from children without appropriate parental or guardian consent.'
        ]
      },
      {
        id: 'changes',
        title: '11. Changes to This Policy',
        paragraphs: [
          'We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page indicates the latest revision. Material changes will be communicated where required by law.'
        ]
      }
    ]
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    eyebrow: 'Legal',
    description:
      'How Nature Romp Safaris Ltd uses cookies and similar technologies to improve your browsing experience and understand website performance.',
    lastUpdated: '2026-09-14',
    intro: [
      `This Cookie Policy explains how ${legalParties} may use cookies and similar technologies on our website to improve user experience, understand website performance, and support our online services.`,
      'By using our website, you agree to the use of cookies as described in this policy, unless you disable them through your browser settings.'
    ],
    sections: [
      {
        id: 'what-are-cookies',
        title: '1. What Are Cookies?',
        paragraphs: [
          'Cookies are small text files placed on your device when you visit a website. They help the website remember certain information about your visit, such as your preferences, browsing activity, or how you interact with different pages.',
          'Cookies can help improve website performance, make pages easier to use, and provide insights into how visitors find and use our website.'
        ]
      },
      {
        id: 'how-we-use-cookies',
        title: '2. How Nature Romp Safaris Uses Cookies',
        listAfterParagraphIndex: 0,
        paragraphs: [
          'Nature Romp Safaris may use cookies to:',
          'Cookies do not give us access to your computer, mobile device, or personal files.'
        ],
        listItems: [
          'Make the website function properly',
          'Improve website speed, performance, and user experience',
          'Understand how visitors use our website',
          'Identify which pages, safari packages, destinations, or blog articles are most useful to visitors',
          'Improve our website content and inquiry process',
          'Support contact forms, inquiry forms, and basic website functionality',
          'Measure the effectiveness of our online content or marketing activities'
        ]
      },
      {
        id: 'types-of-cookies',
        title: '3. Types of Cookies We May Use',
        paragraphs: [
          '**Essential Cookies**',
          'These cookies are necessary for the website to work properly. They support basic functions such as page navigation, form submission, security, and access to key website features.',
          'Without these cookies, some parts of the website may not function correctly.',
          '**Performance and Analytics Cookies**',
          'These cookies help us understand how visitors interact with our website. For example, they may show us which pages are visited most often, how long visitors stay on the website, and whether users experience errors.',
          'This information helps Nature Romp Safaris improve the website and create better safari content for visitors.',
          '**Functionality Cookies**',
          'Functionality cookies allow the website to remember certain preferences or actions, such as form entries, region preferences, or previous interactions.',
          'These cookies help make your browsing experience smoother and more convenient.',
          '**Marketing and Advertising Cookies**',
          'Nature Romp Safaris may use marketing cookies or similar tracking technologies to understand the effectiveness of online campaigns or show relevant safari-related content to users who have visited our website.',
          'These cookies may be set by Nature Romp Safaris or by trusted third-party platforms, such as advertising, analytics, or social media tools.'
        ]
      },
      {
        id: 'third-party-cookies',
        title: '4. Third-Party Cookies',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'Some cookies on our website may be placed by third-party services that help us manage, measure, or improve our website.',
          'These may include services such as:',
          'Third-party providers may collect information according to their own privacy and cookie policies. Nature Romp Safaris does not control how third-party cookies are used once they are set by those external platforms.'
        ],
        listItems: [
          'Website analytics tools',
          'Search engine tools',
          'Social media platforms',
          'Embedded maps',
          'Video platforms',
          'Advertising or remarketing platforms'
        ]
      },
      {
        id: 'cookies-and-personal-information',
        title: '5. Cookies and Personal Information',
        paragraphs: [
          'Cookies may collect general technical information such as browser type, device type, IP address, pages visited, time spent on the website, and referral source.',
          'Where cookies are linked to personal information submitted through an inquiry form, such information will be handled in accordance with our [Privacy Policy](/privacy-policy).',
          'Nature Romp Safaris does not use cookies to collect payment card details, bank details, or sensitive financial information through the website.'
        ]
      },
      {
        id: 'managing-cookies',
        title: '6. Managing or Disabling Cookies',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'You can choose to accept, reject, or delete cookies through your browser settings.',
          'Most browsers allow you to:',
          'Please note that disabling certain cookies may affect how the website functions. Some features, such as inquiry forms, page preferences, or embedded content, may not work properly if cookies are disabled.'
        ],
        listItems: [
          'View which cookies are stored',
          'Delete existing cookies',
          'Block all cookies',
          'Block third-party cookies',
          'Receive alerts before cookies are placed on your device'
        ]
      },
      {
        id: 'cookie-consent',
        title: '7. Cookie Consent',
        paragraphs: [
          'Where required, Nature Romp Safaris may display a cookie notice or consent banner when you visit the website. This allows you to accept, reject, or manage certain cookie categories depending on the website setup.',
          'Essential cookies may still be used because they are necessary for the website to operate correctly.'
        ]
      },
      {
        id: 'updates',
        title: '8. Updates to This Cookie Policy',
        paragraphs: [
          'Nature Romp Safaris may update this Cookie Policy from time to time to reflect changes in website features, technology, legal requirements, or how cookies are used.',
          'Any updates will be posted on this page with the revised effective date.'
        ]
      },
      {
        id: 'contact-us',
        title: '9. Contact Us',
        paragraphs: [
          'For questions about this Cookie Policy or how Nature Romp Safaris uses cookies, please [contact us](/contact) through the official contact details provided on our website.'
        ]
      }
    ]
  },
  {
    slug: 'terms-conditions',
    title: 'Terms & Conditions',
    eyebrow: 'Tour Booking Terms',
    description:
      'Booking, payment, cancellation, insurance, and on-safari terms for tours with Nature Romp Safaris Ltd — written to be clear and fair.',
    lastUpdated: '2026-10-26',
    intro: [
      `These Tour Booking Terms & Payment Conditions set out how bookings, payments, cancellations, and on-safari arrangements work when you travel with ${legalParties}.`,
      'They are written to be clear and fair. Please read them together with our [Privacy Policy](/privacy-policy), [Cookie Policy](/cookie-policy), [Payment Terms](/payment-terms), and [Service Level Agreement](/service-level-agreement).'
    ],
    sections: [
      {
        id: 'cancellation-charges',
        title: '1. Safari Tour Cancellation Charges',
        listAfterParagraphIndex: 0,
        paragraphs: [
          'Once hotels, safari lodges, camps, domestic flights, or other services are booked on your behalf, our suppliers may charge us a fee if the booking is later cancelled. We always try to keep these charges to a minimum. The following cancellation charges apply equally to Kenya and Tanzania safaris and are calculated as a percentage of the total safari price:',
          'In addition to the above, a 5% administrative fee is applied to every cancellation to cover transaction costs.',
          'Where a refund is due, it will be completed within 60 days from the date we receive your official cancellation notice.'
        ],
        listItems: [
          '**60 days or more** before the safari start date: no cancellation charge.',
          '**35 to 59 days** before the safari start date: 20% of the total price.',
          '**15 to 34 days** before the safari start date: 40% of the total price.',
          '**4 to 14 days** before the safari start date: 60% of the total price.',
          '**3 days or less** before the safari start date: no refund (100% cancellation charge).'
        ]
      },
      {
        id: 'payment-terms',
        title: '2. Payment Terms',
        listAfterParagraphIndex: 0,
        paragraphs: [
          'To confirm your booking, a deposit is required. The amount depends on the type of safari you choose:',
          'Unless we agree otherwise in writing, the balance is payable on arrival or before your safari starts.'
        ],
        listItems: [
          '**Budget safari:** 15% deposit, with the balance paid on arrival or before the safari starts.',
          '**Mid-range / lodge safari:** 30% deposit to secure your accommodation.',
          '**Private safari:** 20% deposit to arrange transport, accommodation, and park entry fees in advance.',
          '**Kenya–Tanzania safaris:** 20% for budget safaris and 30% for mid-range or lodge safaris.'
        ]
      },
      {
        id: 'accommodation',
        title: '3. Accommodation',
        paragraphs: [
          'We do not own any hotels or lodges. We book the accommodation listed in your itinerary and, if a property is unavailable, we will offer a similar alternative of comparable standard — always with your approval.'
        ]
      },
      {
        id: 'if-something-goes-wrong',
        title: '4. If Something Goes Wrong During Your Safari',
        paragraphs: [
          'We do everything we can to give you an enjoyable, trouble-free safari, but occasionally even the best-laid plans can go wrong.',
          'If a problem arises during your safari, please tell us straight away: contact your tour planning manager by email or WhatsApp, speak to the lodge or camp manager if it relates to your accommodation, and let your driver-guide know. This gives us the chance to put things right on the spot so the issue does not spoil your trip.',
          'If the matter cannot be resolved immediately, please send the details of your complaint to us in writing within 20 days of returning from your safari.',
          'It is a condition of this agreement that you report any problem while you are still on safari. If this simple step is not followed, we may be unable to accept responsibility, as we will have been denied the opportunity to investigate and resolve the issue on site.'
        ]
      },
      {
        id: 'seasonal-factors',
        title: '5. Seasonal Factors and Resort Facilities',
        paragraphs: [
          'Some things are outside our control. Early and late in the season, certain tourist facilities may not operate. Likewise, swimming pools sometimes need to be cleaned or emptied, and routine maintenance may affect the availability of certain amenities.'
        ]
      },
      {
        id: 'public-holidays',
        title: '6. Public Holidays and Religious Festivals',
        paragraphs: [
          'Public holidays and religious festivals throughout the year (particularly Ramadan) may affect the atmosphere of a destination and the availability or reliability of shops, banks, and other facilities.'
        ]
      },
      {
        id: 'wild-animals',
        title: '7. Wild Animals',
        paragraphs: [
          'Please be aware that any African safari may bring you into close contact with wild animals. Attacks are rare, but no safari into the African wilderness can guarantee that such an incident will never occur.',
          `Neither ${tradingName}, nor its employees, nor its suppliers can be held responsible for any injury or incident on safari. Please note that many safari camps are unfenced and animals may move through the camps at any time of the day or night.`
        ]
      },
      {
        id: 'travel-insurance',
        title: '8. Travel Insurance',
        paragraphs: [
          'It is important that every member of your party has adequate, comprehensive travel insurance covering cancellation and curtailment, as well as medical expenses, emergency travel, personal accident, personal baggage, and loss of money.',
          `Insurance should be arranged at the time of confirmation and deposit payment so that you are covered for cancellation from the moment you book. Taking out insurance is your responsibility and the cost is for your own account; ${company} cannot be held liable in any way should you fail to do so.`,
          'If you are travelling to East Africa from overseas, please provide us with your insurer’s name, your policy number, and the insurance company’s emergency contact number in case of any emergency while you are travelling.'
        ]
      },
      {
        id: 'luggage',
        title: '9. Luggage',
        listAfterParagraphIndex: 0,
        paragraphs: ['Please travel light so there is room for everyone’s luggage:'],
        listItems: [
          'Pack as lightly as you comfortably can to leave space for fellow travellers’ bags.',
          'Group travellers should bring soft suitcases or backpacks where possible.'
        ]
      },
      {
        id: 'visas-passports',
        title: '10. Visas and Passports',
        listAfterParagraphIndex: 0,
        paragraphs: ['Please make sure your travel documents are in order before you travel:'],
        listItems: [
          'Ensure your passport is valid for at least six months from your date of travel.',
          'Apply for your Kenya Electronic Travel Authorisation (ETA) online in advance.',
          'Tanzania visas can be applied for online or on arrival; a single-entry visa is recommended for most visitors.'
        ]
      },
      {
        id: 'photography',
        title: '11. Photography',
        paragraphs: [
          'Photographs our guides take during your safari may be used in our marketing materials without a further request for permission or payment.'
        ]
      },
      {
        id: 'itinerary-changes',
        title: '12. Itinerary Changes',
        paragraphs: [
          'We may adjust your itinerary where unexpected events make it necessary. If we do, all of the destinations included in your booking will still be covered.'
        ]
      },
      {
        id: 'guide-changes',
        title: '13. Guide Changes',
        paragraphs: [
          'If your guide is unable to continue, we will assign another qualified guide and let you know. On group safaris, guide arrangements may also change if the size of the group reduces.'
        ]
      },
      {
        id: 'vehicle-changes',
        title: '14. Safari Vehicle Changes',
        paragraphs: [
          'We may change your safari vehicle for operational reasons. If this happens, we will introduce you to your new guide and explain the reason for the change.'
        ]
      },
      {
        id: 'cancellation-during-safari',
        title: '15. Cancellation During the Safari',
        paragraphs: [
          'If you cancel after your safari has started, no refund will be given. Where the reason is valid, we will still do our best to help and find a workable solution.'
        ]
      }
    ]
  },
  {
    slug: 'payment-terms',
    title: 'Payment Terms',
    eyebrow: 'Legal',
    description:
      'Deposits, payment schedules, currency, refunds, and billing conditions for Nature Romp Safaris Ltd bookings.',
    lastUpdated: '2026-09-14',
    intro: [
      `These Payment Terms apply to all safari, tour, accommodation, transport, group travel, incentive travel, and related travel arrangements booked with ${legalParties}.`,
      'By confirming a booking with us, the client agrees to the payment terms outlined below.'
    ],
    sections: [
      {
        id: 'booking-confirmation',
        title: '1. Booking Confirmation',
        paragraphs: [
          `A booking is considered confirmed once ${company} has issued a written confirmation and the required deposit has been received within the stated payment period.`,
          'All bookings are subject to availability at the time of confirmation. Accommodation, transport, flights, guides, park arrangements, and other services can only be secured once the required payment has been received.'
        ]
      },
      {
        id: 'payments-fits-private-tours',
        title: '2. Payments for FITs and Private Tours',
        paragraphs: [
          'FITs refer to Fully Inclusive Tours, individual safaris, private tours, family safaris, couples’ safaris, and other customized travel arrangements.',
          'For FITs and private tours, an advance payment of **20% of the total tour cost** is required within **7 days** of confirmation of the arrangements.',
          'The remaining balance is due **60 days before departure**.',
          'For bookings made within **60 days of departure**, the full tour cost is payable immediately upon confirmation.'
        ]
      },
      {
        id: 'payments-groups-incentive',
        title: '3. Payments for Groups and Incentive Travel',
        paragraphs: [
          'For group bookings and incentive travel arrangements, an advance payment of **25% of the total invoice amount** is required within **7 days** of confirmation.',
          'This deposit is used to secure rooms, transport, suppliers, activities, and other services required for the group.',
          'A further payment of **60%** is due **60 days before departure from the country of origin**.',
          'The remaining **15%** is payable before the group’s arrival.',
          'Any alternative payment arrangement for groups, incentive travel, or special bookings must be agreed in writing by both parties before confirmation.'
        ]
      },
      {
        id: 'payment-deadlines',
        title: '4. Payment Deadlines',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'Clients are responsible for ensuring that payments are made by the due dates stated on the invoice, quotation, or booking confirmation.',
          'Failure to make payment within the required period may result in:',
          'Nature Romp Safaris shall not be held responsible for any loss of availability, rate changes, or supplier cancellation caused by late payment.'
        ],
        listItems: [
          'Delay in confirming the booking',
          'Release of reserved rooms or services by suppliers',
          'Changes in availability',
          'Price adjustments',
          'Cancellation of the booking',
          'Additional supplier charges'
        ]
      },
      {
        id: 'invoices-quotations',
        title: '5. Invoices and Quotations',
        paragraphs: [
          'Nature Romp Safaris may issue a quotation before a booking is confirmed. A quotation does not guarantee availability until the required deposit has been received and the booking has been confirmed in writing.',
          'Invoices will show the amount payable, payment schedule, due dates, and any applicable booking details.',
          'All prices are based on the services, dates, destinations, accommodation, transport, and activities included in the confirmed itinerary.'
        ]
      },
      {
        id: 'currency-exchange-rates',
        title: '6. Currency and Exchange Rates',
        paragraphs: [
          'Tour prices may be quoted in United States Dollars, Kenya Shillings, or another agreed currency depending on the nature of the booking.',
          'Where payments are made in a currency different from the quoted currency, the final amount received by Nature Romp Safaris must match the invoiced amount after any exchange rate differences, bank charges, transaction fees, or transfer costs have been applied.',
          'Any shortfall resulting from exchange rate changes or transfer deductions shall be payable by the client.'
        ]
      },
      {
        id: 'bank-charges-transaction-fees',
        title: '7. Bank Charges and Transaction Fees',
        paragraphs: [
          'All bank charges, mobile money charges, transfer fees, card charges, intermediary bank fees, foreign exchange charges, and transaction costs are the responsibility of the client unless otherwise agreed in writing.',
          'The full invoiced amount must be received by Nature Romp Safaris.'
        ]
      },
      {
        id: 'accepted-payment-methods',
        title: '8. Accepted Payment Methods',
        paragraphs: [
          'Nature Romp Safaris will provide official payment instructions directly to the client during the booking process.',
          'Accepted payment methods may vary depending on the booking type, location of the client, currency, and operational requirements.',
          'Clients should only make payments using the official payment details shared by Nature Romp Safaris through recognized communication channels.',
          'For security reasons, clients are encouraged to confirm payment details directly with Nature Romp Safaris before making any payment.'
        ]
      },
      {
        id: 'online-payments',
        title: '9. Online Payments',
        paragraphs: [
          'Payments are not processed directly on the Nature Romp Safaris website.',
          'The website is used for safari inquiries, quotation requests, destination information, and communication with our team. After a client submits an inquiry, the Nature Romp Safaris team may contact the client to prepare a customized itinerary, confirm availability, issue a quotation, and share official payment instructions where applicable.',
          'Nature Romp Safaris does not collect or store debit card, credit card, bank account, or online payment details through the website.'
        ]
      },
      {
        id: 'supplier-deposits-non-refundable',
        title: '10. Supplier Deposits and Non-Refundable Costs',
        paragraphs: [
          'Certain suppliers, including lodges, camps, hotels, airlines, and activity providers, may require deposits or full payment to secure services.',
          'Some supplier deposits, domestic flights, park fees, permits, special activities, and peak-season accommodation bookings may be non-refundable once confirmed.',
          'Where such costs apply, they may affect refund amounts in the event of cancellation, date changes, itinerary amendments, or reduction in the number of travelers.'
        ]
      },
      {
        id: 'changes-after-payment',
        title: '11. Changes After Payment',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'Any changes requested after payment has been made are subject to availability and supplier conditions.',
          'Changes may include, but are not limited to:',
          'Where changes result in additional costs, the client shall be responsible for paying the difference before the revised arrangements are confirmed.',
          'Where changes reduce the overall cost, any refund or credit shall be subject to supplier terms, cancellation conditions, and costs already incurred.'
        ],
        listItems: [
          'Travel dates',
          'Number of travelers',
          'Accommodation',
          'Rooming arrangements',
          'Destinations',
          'Transport arrangements',
          'Domestic flights',
          'Activities or excursions'
        ]
      },
      {
        id: 'late-bookings',
        title: '12. Late Bookings',
        paragraphs: [
          'Bookings made close to the travel date may require immediate full payment to secure accommodation, transport, flights, permits, park arrangements, and other services.',
          'Nature Romp Safaris will advise the client of the payment requirements at the time of confirmation.'
        ]
      },
      {
        id: 'post-tour-billing',
        title: '13. Post-Tour Billing',
        paragraphs: [
          'Any post-tour billing must be authorized by mutual agreement between Nature Romp Safaris and the client.',
          'Post-tour charges may include additional services requested during the trip, extra mileage, itinerary extensions, upgraded accommodation, optional activities, personal expenses, or other costs not included in the original invoice.',
          'Such charges shall be payable within the period agreed between both parties.'
        ]
      },
      {
        id: 'receipts-proof-of-payment',
        title: '14. Receipts and Proof of Payment',
        paragraphs: [
          'Clients should share proof of payment with Nature Romp Safaris once payment has been made.',
          'A booking will only be treated as paid once the funds have been received and confirmed by Nature Romp Safaris.',
          'Payment receipts or acknowledgements may be issued after payment confirmation.'
        ]
      },
      {
        id: 'cancellations-refunds',
        title: '15. Cancellations and Refunds',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'Cancellation fees shall apply in accordance with the Nature Romp Safaris [Terms & Conditions](/terms-conditions).',
          'Refunds, where applicable, will be subject to:',
          'Cancellations must be submitted in writing and will take effect from the date received by Nature Romp Safaris.'
        ],
        listItems: [
          'The date of cancellation',
          'Supplier cancellation terms',
          'Non-refundable deposits or fees',
          'Bank charges and transaction costs',
          'Services already booked, paid for, or used',
          'Any administrative or operational costs incurred'
        ]
      },
      {
        id: 'acceptance-payment-terms',
        title: '16. Acceptance of Payment Terms',
        paragraphs: [
          'Payment of a deposit, partial payment, full payment, or confirmation of a booking constitutes acceptance of these Payment Terms by the client and all members of the traveling party.',
          'Clients are responsible for ensuring that all travelers included in the booking understand the payment requirements, cancellation conditions, and related booking terms.'
        ]
      }
    ]
  },
  {
    slug: 'service-level-agreement',
    title: 'Service Level Agreement',
    eyebrow: 'Legal',
    description:
      'Service standards, support commitments, and responsibilities when booking safaris, tours, and travel services with Nature Romp Safaris Ltd.',
    lastUpdated: '2026-09-14',
    intro: [
      `This Service Level Agreement outlines the level of service, support, communication, and responsibility clients can expect when booking a safari, tour, transfer, accommodation arrangement, or related travel service with ${legalParties}.`,
      'At Nature Romp Safaris, we are committed to providing reliable, professional, and well-coordinated safari experiences while recognizing that travel in natural environments may be affected by factors beyond our control.'
    ],
    sections: [
      {
        id: 'our-service-commitment',
        title: '1. Our Service Commitment',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'Nature Romp Safaris is committed to offering clients a professional, responsive, and personalized travel planning experience from the first inquiry to the completion of the safari.',
          'We aim to:'
        ],
        listItems: [
          'Respond to inquiries in a timely and helpful manner',
          'Prepare customized safari itineraries based on client preferences',
          'Provide clear quotations and booking information',
          'Confirm services with reliable suppliers and partners',
          'Offer accurate destination and travel guidance to the best of our knowledge',
          'Provide professional driver-guides, transport arrangements, and safari coordination',
          'Support clients before, during, and after their safari where reasonably possible'
        ]
      },
      {
        id: 'inquiry-and-communication-support',
        title: '2. Inquiry and Communication Support',
        paragraphs: [
          'When a client submits an inquiry through our website, email, phone, WhatsApp, or any other communication channel, the Nature Romp Safaris team will review the request and respond with relevant information, recommendations, or follow-up questions where necessary.',
          'Our team may contact the client to clarify travel dates, destination interests, number of travelers, accommodation preferences, budget range, and any special requirements.',
          'All safari proposals and quotations are prepared based on the information provided by the client and the availability of services at the time of planning.'
        ]
      },
      {
        id: 'customized-safari-planning',
        title: '3. Customized Safari Planning',
        listAfterParagraphIndex: 1,
        paragraphs: [
          "Nature Romp Safaris specializes in creating tailor-made safari experiences. We make every reasonable effort to design itineraries that reflect the client's travel interests, preferred destinations, comfort level, budget, and schedule.",
          'Safari planning may include recommendations on:',
          'All proposed itineraries remain subject to availability, seasonal conditions, supplier confirmation, park regulations, and payment requirements.'
        ],
        listItems: [
          'National parks, reserves, and conservancies',
          'Accommodation options',
          'Transport arrangements',
          'Game drives and activities',
          'Domestic flights where applicable',
          'Beach extensions and add-on experiences',
          'Family, private, group, or incentive travel arrangements'
        ]
      },
      {
        id: 'booking-coordination',
        title: '4. Booking Coordination',
        paragraphs: [
          'Once a booking is confirmed and the required payment has been received, Nature Romp Safaris will proceed to secure the agreed services with relevant suppliers.',
          'These may include accommodation providers, transport providers, domestic airlines, guides, park authorities, activity providers, and other service partners involved in the itinerary.',
          'Nature Romp Safaris will make reasonable efforts to ensure that all confirmed services are properly coordinated. However, certain services are provided by independent third parties, and their own terms, operational standards, cancellation policies, and service conditions may apply.'
        ]
      },
      {
        id: 'accuracy-of-information',
        title: '5. Accuracy of Information',
        paragraphs: [
          'Nature Romp Safaris aims to provide accurate and up-to-date information on its website, itineraries, quotations, and communication materials.',
          'However, travel information may change from time to time due to supplier updates, park regulations, seasonal conditions, government directives, flight schedule changes, conservation fee revisions, exchange rates, or other circumstances.',
          'While we make every effort to keep information accurate, Nature Romp Safaris does not guarantee that all website content, prices, availability, descriptions, or travel details will always be complete, current, or free from errors.',
          'Where an error or change is identified, we will make reasonable efforts to correct it and advise affected clients accordingly.'
        ]
      },
      {
        id: 'itinerary-changes-and-operational-adjustments',
        title: '6. Itinerary Changes and Operational Adjustments',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'Safari travel may be affected by conditions that require changes to routes, accommodation, activities, timing, or transport arrangements.',
          'Nature Romp Safaris reserves the right to make necessary adjustments before or during a safari where circumstances require. Such circumstances may include, but are not limited to:',
          'Where changes are necessary, Nature Romp Safaris will make reasonable efforts to provide suitable alternatives of comparable standard and value where possible.'
        ],
        listItems: [
          'Weather conditions',
          'Road conditions',
          'Wildlife movement',
          'Park or conservancy regulations',
          'Security concerns',
          'Accommodation availability',
          'Supplier changes',
          'Vehicle breakdown',
          'Flight delays or cancellations',
          'Government directives',
          'Medical or emergency situations',
          'Events beyond our reasonable control'
        ]
      },
      {
        id: 'wildlife-nature-and-safari-experience-disclaimer',
        title: '7. Wildlife, Nature, and Safari Experience Disclaimer',
        paragraphs: [
          'Safaris take place in natural and wildlife-rich environments. While Nature Romp Safaris and its guides make every reasonable effort to provide rewarding safari experiences, wildlife sightings cannot be guaranteed.',
          'Animal movement, weather, vegetation, migration patterns, park conditions, and natural behavior may affect what is seen during a safari.',
          'Clients acknowledge that safari experiences involve natural unpredictability and that no specific animal sighting, river crossing, migration moment, photography opportunity, or wildlife encounter can be promised.'
        ]
      },
      {
        id: 'client-safety-and-conduct',
        title: '8. Client Safety and Conduct',
        listAfterParagraphIndex: 2,
        paragraphs: [
          'The safety and comfort of our clients is important to Nature Romp Safaris. Clients are expected to follow guidance provided by driver-guides, tour leaders, accommodation staff, park rangers, and other authorized personnel during the safari.',
          'Clients are responsible for conducting themselves in a respectful and safe manner throughout the trip.',
          'This includes:',
          'Nature Romp Safaris reserves the right to refuse or discontinue service to any client whose conduct threatens the safety, comfort, or enjoyment of other travelers, staff, guides, suppliers, wildlife, or local communities.'
        ],
        listItems: [
          'Following park and conservancy rules',
          'Remaining inside the vehicle unless advised otherwise',
          'Keeping a safe distance from wildlife',
          'Respecting local communities, cultures, and customs',
          'Avoiding behavior that may endanger themselves or others',
          'Observing accommodation and activity provider rules',
          'Informing Nature Romp Safaris of any medical, mobility, dietary, or special requirements before travel'
        ]
      },
      {
        id: 'health-medical-and-travel-preparedness',
        title: '9. Health, Medical, and Travel Preparedness',
        paragraphs: [
          'Clients are responsible for ensuring that they are medically fit to travel and participate in the activities included in their itinerary.',
          'Nature Romp Safaris recommends that all travelers consult a qualified medical professional or travel clinic before visiting safari destinations, especially regarding vaccinations, malaria precautions, medication, allergies, mobility limitations, and any existing medical conditions.',
          'Clients are also responsible for carrying any personal medication, medical documents, vaccination certificates, or health-related travel documents required for their journey.',
          "Nature Romp Safaris shall not be held responsible for medical complications, denied entry, travel disruption, or additional costs arising from a client's failure to meet health or travel requirements."
        ]
      },
      {
        id: 'travel-documents-and-entry-requirements',
        title: '10. Travel Documents and Entry Requirements',
        paragraphs: [
          'Clients are responsible for ensuring that they have valid passports, visas, permits, vaccination certificates, insurance documents, and any other travel documents required for their trip.',
          'Passport, visa, immigration, health, and entry requirements may change without notice. Clients should confirm current requirements with relevant embassies, consulates, airlines, immigration authorities, or official government sources before travel.',
          'Nature Romp Safaris may provide general guidance where possible, but the responsibility for correct and valid travel documents remains with the client.'
        ]
      },
      {
        id: 'travel-insurance',
        title: '11. Travel Insurance',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'Nature Romp Safaris strongly recommends that all clients obtain comprehensive travel insurance before departure.',
          'Travel insurance should ideally cover:',
          'Nature Romp Safaris shall not be held responsible for costs, losses, or disruptions that could have been covered by suitable travel insurance.'
        ],
        listItems: [
          'Medical emergencies',
          'Emergency evacuation',
          'Trip cancellation or interruption',
          'Travel delays',
          'Lost or damaged luggage',
          'Personal accident',
          'Safari and adventure-related activities',
          'Supplier failure where applicable'
        ]
      },
      {
        id: 'third-party-services',
        title: '12. Third-Party Services',
        paragraphs: [
          'Some services included in a safari itinerary may be provided by independent third parties, including lodges, camps, hotels, airlines, transport companies, activity providers, park authorities, and conservation bodies.',
          'Nature Romp Safaris carefully selects suppliers and partners where possible, but we do not directly control the operations, staff, facilities, schedules, policies, or decisions of third-party providers.',
          'Nature Romp Safaris shall not be liable for delays, omissions, service failures, accidents, losses, damages, or additional costs caused by third-party providers, except where such liability is required by law.'
        ]
      },
      {
        id: 'force-majeure-and-events-beyond-our-control',
        title: '13. Force Majeure and Events Beyond Our Control',
        listAfterParagraphIndex: 1,
        paragraphs: [
          'Nature Romp Safaris shall not be liable for failure to perform, delays, changes, losses, additional costs, or disruption caused by events beyond our reasonable control.',
          'Such events may include, but are not limited to:',
          'In such situations, Nature Romp Safaris will make reasonable efforts to assist clients, rearrange services where possible, or provide suitable guidance depending on the circumstances.'
        ],
        listItems: [
          'Extreme weather',
          'Floods, fires, or natural disasters',
          'Disease outbreaks or public health emergencies',
          'Border closures',
          'Political unrest or civil disturbances',
          'Government restrictions',
          'Park closures',
          'Airline disruptions',
          'Labor disputes',
          'Security incidents',
          'Road closures',
          'Mechanical failure',
          'Any other unforeseeable or unavoidable event'
        ]
      },
      {
        id: 'complaints-and-service-concerns',
        title: '14. Complaints and Service Concerns',
        paragraphs: [
          'If a client experiences any issue during their safari, they should notify the driver-guide, tour leader, or Nature Romp Safaris team as soon as possible so that reasonable efforts can be made to resolve the matter during the trip.',
          'Complaints raised only after the completion of the safari may be more difficult to investigate or resolve, especially where Nature Romp Safaris was not given an opportunity to address the concern during travel.',
          'Any post-tour complaint should be submitted in writing with relevant details. Please [contact us](/contact) through the official contact details provided on our website.'
        ]
      },
      {
        id: 'limitations-of-responsibility',
        title: '15. Limitations of Responsibility',
        paragraphs: [
          'Nature Romp Safaris will make reasonable efforts to deliver the services agreed in the confirmed itinerary. However, clients acknowledge that safari travel involves natural, operational, logistical, and third-party factors that may affect the final experience.',
          'Nature Romp Safaris shall not be responsible for loss, inconvenience, injury, delay, damage, additional expense, disappointment, or disruption arising from circumstances beyond our reasonable control, client negligence, failure to follow instructions, third-party actions, or natural safari conditions.',
          'Nothing in this Service Level Agreement is intended to exclude liability where such exclusion is not permitted by applicable law.'
        ]
      },
      {
        id: 'client-responsibility',
        title: '16. Client Responsibility',
        listAfterParagraphIndex: 0,
        paragraphs: ['By booking with Nature Romp Safaris, the client agrees to:'],
        listItems: [
          'Provide accurate personal and travel information',
          'Make payments within the required timelines',
          'Read and understand the itinerary, quotation, [Terms and Conditions](/terms-conditions), [Payment Terms](/payment-terms), and relevant policies',
          'Ensure all travel documents are valid and complete',
          'Arrange appropriate travel insurance',
          'Disclose any special needs, medical conditions, dietary requirements, or mobility concerns before travel',
          'Follow safety instructions and local regulations during the safari',
          'Respect wildlife, communities, staff, guides, and other travelers'
        ]
      },
      {
        id: 'acceptance-of-this-service-level-agreement',
        title: '17. Acceptance of This Service Level Agreement',
        paragraphs: [
          'Confirmation of a booking, payment of a deposit, partial payment, or full payment constitutes acceptance of this Service Level Agreement by the client and all members of the traveling party.',
          'Clients are responsible for ensuring that all travelers included in their booking understand and accept the service expectations, responsibilities, and limitations outlined in this agreement.'
        ]
      }
    ]
  }
];

export function getLegalPage(slug: string): LegalPageDefinition | undefined {
  return LEGAL_PAGES.find((page) => page.slug === slug);
}

export function getLegalSlugs(): string[] {
  return LEGAL_PAGES.map((page) => page.slug);
}

export function buildLegalFooterLinks(locale: string): LegalFooterLink[] {
  return LEGAL_PAGES.map((page) => ({
    href: localePath(locale, `/${page.slug}`),
    label: page.title
  }));
}
