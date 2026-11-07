import { Quotation, StudioProfile } from '../types';

export function formatRupees(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function generateWhatsAppMessage(quotation: Quotation, studio: StudioProfile): string {
  const { customer, financials, services, id } = quotation;
  
  const servicesText = services
    .map((s, idx) => `  ${idx + 1}. ${s.name} - ${formatRupees(s.price)}`)
    .join('\n');

  return `📸 *${studio.businessName.toUpperCase()} – OFFICIAL QUOTATION*
━━━━━━━━━━━━━━━━━━━━
Dear *${customer.name}*,
Thank you for reaching out to ${studio.businessName}! We are delighted to share the customized photography quotation for your upcoming *${customer.eventType}*.

📋 *Quotation Details:*
• *Quotation No:* ${id}
• *Event Date:* ${formatDate(customer.eventDate)}
• *Event Location:* ${customer.eventLocation || 'To be specified'}

✨ *Selected Services:*
${servicesText}

💰 *Financial Breakdown:*
• *Subtotal:* ${formatRupees(financials.subtotal)}
${financials.discountAmount > 0 ? `• *Special Discount:* -${formatRupees(financials.discountAmount)}\n` : ''}• *Final Package Total:* *${formatRupees(financials.finalTotal)}*
• *Advance Paid:* ${formatRupees(financials.advancePaid)}
• *Remaining Balance:* *${formatRupees(financials.remainingBalance)}*

📞 *Questions or Adjustments?*
Feel free to reply directly to this chat or call us at *${studio.phone}*.
We look forward to capturing your unforgettable moments!

Warm Regards,
*${studio.businessName}*
${studio.website ? `🌐 ${studio.website}` : ''}`;
}

export function cleanPhoneNumber(phone: string): string {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  // If 10 digits (Indian mobile), prefix with 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const sanitized = cleanPhoneNumber(phone);
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}
