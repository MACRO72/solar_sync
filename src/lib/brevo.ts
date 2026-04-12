/**
 * Standardized Brevo Email Service
 * Centralizes API key, sender configuration, and error handling.
 */

export type SendEmailParams = {
  subject: string;
  textContent: string;
  recipientEmail: string;
  recipientName?: string;
  senderEmail?: string;
  senderName?: string;
};

export async function sendBrevoEmail({
  subject,
  textContent,
  recipientEmail,
  recipientName,
  senderEmail = process.env.BREVO_SENDER_EMAIL || 'sacreotadexter@gmail.com',
  senderName = process.env.BREVO_SENDER_NAME || 'SolarSync Security'
}: SendEmailParams) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  
  if (!brevoApiKey) {
    console.error('❌ BREVO_API_KEY is missing from environment variables');
    throw new Error('Email service configuration error');
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: recipientEmail, name: recipientName || recipientEmail }],
    subject: subject,
    textContent: textContent,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #22D3EE;">SolarSync Notification</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #333;">${textContent.replace(/\n/g, '<br>')}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">This is an automated message from your SolarSync Monitoring System.</p>
      </div>
    `,
  };

  try {
    console.log(`[Brevo] Attempting to send email to: ${recipientEmail} with subject: ${subject}`);
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo API Response Error:', JSON.stringify(data, null, 2));
      throw new Error(`Brevo API rejected email: ${data.message || JSON.stringify(data)}`);
    }

    console.log(`✅ Email sent via Brevo to ${recipientEmail} (ID: ${data.messageId})`);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error('❌ Brevo Email Delivery Failure:', error.message);
    throw error;
  }
}
