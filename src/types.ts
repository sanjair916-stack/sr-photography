export interface PhotographyService {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
  isCustom?: boolean;
}

export interface QuotationCustomer {
  name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  eventDate: string;
  eventLocation: string;
  eventType: string;
}

export interface QuotationFinancials {
  subtotal: number;
  discountType: 'rupees' | 'percentage';
  discountValue: number;
  discountAmount: number;
  finalTotal: number;
  advancePaid: number;
  remainingBalance: number;
}

export type BookingStatus = 'Quotation' | 'Confirmed Booking' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Advance Pending' | 'Partially Paid' | 'Fully Paid';

export interface Quotation {
  id: string; // e.g. "SRP-2026-0001"
  createdAt: string;
  updatedAt: string;
  customer: QuotationCustomer;
  services: {
    id: string;
    name: string;
    price: number;
  }[];
  financials: QuotationFinancials;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface StudioBankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export interface StudioProfile {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  gstin?: string;
  bankDetails?: StudioBankDetails;
  termsAndConditions: string[];
  logoDataUrl?: string;
  signatureDataUrl?: string;
  defaultServices?: PhotographyService[];
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string;
}
