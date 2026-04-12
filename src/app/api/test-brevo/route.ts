import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName  = process.env.BREVO_SENDER_NAME;

  if (!brevoApiKey) {
    return NextResponse.json({ error: 'BREVO_API_KEY missing from Next.js env' }, { status: 500 });
  }

  const payload = {
    sender: { name: senderName || 'SolarSync Security', email: senderEmail || 'MISSING' },
    to: [{ email: 'nrjytube9@gmail.com' }],
    subject: '[Next.js Runtime Test] Brevo diagnostic',
    textContent: 'This email was sent from the /api/test-brevo endpoint inside the Next.js server runtime.',
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      senderEmail,
      senderName,
      apiKeyPrefix: brevoApiKey.substring(0, 20) + '...',
      brevoResponse: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
