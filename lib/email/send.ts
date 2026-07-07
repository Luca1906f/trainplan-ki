import nodemailer from "nodemailer";

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST/SMTP_USER/SMTP_PASSWORD sind nicht gesetzt");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `FitGit <${from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler beim Versand";
    return { ok: false, error: message };
  }
}
