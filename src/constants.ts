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
  signatureDataUrl: '/signature_transparent.png',
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
