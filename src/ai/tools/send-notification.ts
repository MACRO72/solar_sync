import { sendBrevoEmail } from '@/lib/brevo';

export async function sendEmailInternal(params: { subject: string; message: string; recipientEmail: string }) {
  return await sendBrevoEmail({
    subject: params.subject,
    textContent: params.message,
    recipientEmail: params.recipientEmail,
    senderName: 'SolarSync Security'
  });
}
