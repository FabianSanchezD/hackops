import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
const defaultFrom = process.env.SENDGRID_FROM_EMAIL;

if (!apiKey) {
  console.warn('[email] SENDGRID_API_KEY is not set. Email sending will fail.');
} else {
  sgMail.setApiKey(apiKey);
}

export async function sendEmail({ to, subject, text, html, from }) {
  if (!apiKey) {
    throw new Error('Missing SENDGRID_API_KEY');
  }
  if (!defaultFrom && !from) {
    const err = new Error('Missing SENDGRID_FROM_EMAIL and no from provided');
    err.status = 400;
    throw err;
  }
  if (!to) throw new Error('Missing recipient email');
  if (!subject) throw new Error('Missing subject');
  if (!text && !html) throw new Error('Provide text or html');

  const msg = {
    to,
    from: from || defaultFrom,
    subject,
    text: text || undefined,
    html: html || (text ? `<pre>${escapeHtml(text)}</pre>` : undefined),
  };

  try {
    const [resp] = await sgMail.send(msg);
    return { status: resp?.statusCode, headers: resp?.headers };
  } catch (error) {
    // Normalize SendGrid errors for easier diagnostics upstream
    const status = error?.code || error?.response?.statusCode || 500;
    const details = error?.response?.body?.errors || error?.response?.body || undefined;

    const err = new Error(
      details?.[0]?.message ||
        error?.message ||
        (status === 403
          ? 'Forbidden from SendGrid (likely unverified sender, missing Mail Send permission, or restricted API key).'
          : 'Failed to send email via SendGrid')
    );
    err.status = status;
    if (details) err.details = details;
    throw err;
  }
}

function escapeHtml(s = '') {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
