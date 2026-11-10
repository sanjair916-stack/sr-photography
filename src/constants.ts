import { PhotographyService, StudioProfile, Quotation } from './types';

export const DEFAULT_SERVICES: PhotographyService[] = [
  { id: 'srv-wedding-photo', name: 'Wedding Photography', price: 35000 },
  { id: 'srv-wedding-video', name: 'Wedding Videography', price: 40000 },
  { id: 'srv-candid-photo', name: 'Candid Photography', price: 25000 },
  { id: 'srv-trad-photo', name: 'Traditional Photography', price: 18000 },
  { id: 'srv-prewedding', name: 'Pre-Wedding Shoot', price: 22000 },
  { id: 'srv-engagement', name: 'Engagement Photography', price: 15000 },
  { id: 'srv-reception', name: 'Reception Photography', price: 20000 },
  { id: 'srv-birthday', name: 'Birthday Photography', price: 10000 },
  { id: 'srv-baby', name: 'Baby Photography', price: 12000 },
  { id: 'srv-maternity', name: 'Maternity Photography', price: 15000 },
  { id: 'srv-outdoor', name: 'Outdoor Photography', price: 18000 },
  { id: 'srv-drone', name: 'Drone Photography', price: 15000 },
  { id: 'srv-cinematic', name: 'Cinematic Video', price: 30000 },
  { id: 'srv-album', name: 'Album Design & 40-Page Photobook', price: 12000 },
];

export const EVENT_TYPES = [
  'Wedding Ceremony',
  'Pre-Wedding Shoot',
  'Engagement & Ring Ceremony',
  'Reception & Sangeet',
  'Birthday & Milestone Celebration',
  'Baby Shower & Toddler Shoot',
  'Maternity Session',
  'Outdoor & Destination Portrait',
  'Corporate & Commercial Event',
  'Housewarming / Traditional Function',
  'Other Event'
];

export const DEFAULT_STUDIO_PROFILE: StudioProfile = {
  businessName: 'SR PHOTOGRAPHY',
  tagline: 'Timeless Luxury Wedding & Lifestyle Visuals',
  phone: '+91 98401 23456',
  whatsapp: '+91 98401 23456',
  email: 'contact@srphotography.in',
  website: 'www.srphotography.in',
  address: 'Studio 4B, Grand Horizon Avenue, Near Central Park, Chennai, Tamil Nadu 600028',
  gstin: '33AABCS8891D1ZV',
  termsAndConditions: [
    'A 50% advance payment is required to reserve the event date and block our photography crew.',
    '40% payment is due on or before the date of the primary event.',
    'Remaining 10% balance must be settled prior to the release of high-resolution digital master files and album printing.',
    'Curated RAW preview photos will be uploaded to a secure cloud gallery within 3-5 working days.',
    'Custom album design will be submitted for client review; print production takes 12-15 days after design approval.',
    'Travel and crew lodging outside local studio territory to be arranged or reimbursed by the client.'
  ],
  logoDataUrl: '/assets/aistudio/SR_PHOTOGRAPHY_LOGO.jpg_ab1b3994.jpeg',
  signatureDataUrl: 'data:image/png;base64,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',
  defaultServices: DEFAULT_SERVICES
};

export const INITIAL_SEED_QUOTATIONS: Quotation[] = [
  {
    id: 'SRP-2026-0001',
    createdAt: '2026-11-01T10:30:00.000Z',
    updatedAt: '2026-11-01T10:30:00.000Z',
    customer: {
      name: 'Aditya & Sneha Verma',
      mobile: '+91 98402 11223',
      whatsapp: '+91 98402 11223',
      email: 'aditya.verma@gmail.com',
      eventDate: '2026-12-14',
      eventLocation: 'Leela Palace Grand Ballroom, Chennai',
      eventType: 'Wedding Ceremony'
    },
    services: [
      { id: 'srv-wedding-photo', name: 'Wedding Photography', price: 35000 },
      { id: 'srv-candid-photo', name: 'Candid Photography', price: 25000 },
      { id: 'srv-cinematic', name: 'Cinematic Video', price: 30000 },
      { id: 'srv-drone', name: 'Drone Photography', price: 15000 },
      { id: 'srv-album', name: 'Album Design & 40-Page Photobook', price: 12000 }
    ],
    financials: {
      subtotal: 117000,
      discountType: 'percentage',
      discountValue: 10,
      discountAmount: 11700,
      finalTotal: 105300,
      advancePaid: 50000,
      remainingBalance: 55300
    },
    status: 'Confirmed Booking',
    paymentStatus: 'Partially Paid',
    notes: 'Bride requested golden hour pre-wedding couple portraits on beach lawn before sunset.'
  },
  {
    id: 'SRP-2026-0002',
    createdAt: '2026-11-04T14:15:00.000Z',
    updatedAt: '2026-11-04T14:15:00.000Z',
    customer: {
      name: 'Dr. Rajesh & Pooja Menon',
      mobile: '+91 98840 99881',
      whatsapp: '+91 98840 99881',
      email: 'dr.menon.cardio@gmail.com',
      eventDate: '2026-11-28',
      eventLocation: 'Taj Fisherman’s Cove Resort, ECR',
      eventType: 'Engagement & Ring Ceremony'
    },
    services: [
      { id: 'srv-engagement', name: 'Engagement Photography', price: 15000 },
      { id: 'srv-candid-photo', name: 'Candid Photography', price: 25000 },
      { id: 'srv-drone', name: 'Drone Photography', price: 15000 }
    ],
    financials: {
      subtotal: 55000,
      discountType: 'rupees',
      discountValue: 5000,
      discountAmount: 5000,
      finalTotal: 50000,
      advancePaid: 25000,
      remainingBalance: 25000
    },
    status: 'Quotation',
    paymentStatus: 'Partially Paid',
    notes: 'Quotation delivered via WhatsApp. Client reviewing package inclusions.'
  },
  {
    id: 'SRP-2026-0003',
    createdAt: '2026-11-06T09:00:00.000Z',
    updatedAt: '2026-11-06T09:00:00.000Z',
    customer: {
      name: 'Kavitha & Arvind Raman',
      mobile: '+91 97910 44556',
      whatsapp: '+91 97910 44556',
      email: 'kavitha.raman@outlook.com',
      eventDate: '2026-10-20',
      eventLocation: 'ITC Grand Chola Banquet, Chennai',
      eventType: 'Reception & Sangeet'
    },
    services: [
      { id: 'srv-reception', name: 'Reception Photography', price: 20000 },
      { id: 'srv-trad-photo', name: 'Traditional Photography', price: 18000 },
      { id: 'srv-album', name: 'Album Design & 40-Page Photobook', price: 12000 }
    ],
    financials: {
      subtotal: 50000,
      discountType: 'rupees',
      discountValue: 0,
      discountAmount: 0,
      finalTotal: 50000,
      advancePaid: 50000,
      remainingBalance: 0
    },
    status: 'Completed',
    paymentStatus: 'Fully Paid',
    notes: 'Event successfully concluded. Both albums and master pendrive delivered.'
  }
];
