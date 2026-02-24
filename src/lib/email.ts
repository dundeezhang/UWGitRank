import nodemailer from 'nodemailer'
import crypto from 'crypto'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

export function generateOtp(): string {
    return crypto.randomInt(100_000, 999_999).toString()
}

export async function sendOtpEmail(to: string, code: string) {
    await transporter.sendMail({
        from: `"GitRank" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Your GitRank Verification Code',
        html: `
<div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 450px; margin: auto; padding: 40px 20px; background-color: #ffffff;">
  <div style="height: 4px; background-color: #FFD54F; margin-bottom: 30px; border-radius: 2px;"></div>

  <h1 style="color: #000000; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px;">
    GITRANK <span style="color: #FFD54F;">VERIFY</span>
  </h1>

  <div style="background-color: #000000; border-radius: 4px; padding: 24px; text-align: center; margin: 32px 0;">
    <span style="font-family: 'Space Mono', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #FFD54F;">
      ${code}
    </span>
  </div>

  <p style="color: #71717a; font-size: 12px; line-height: 1.5; border-top: 1px solid #f4f4f5; padding-top: 20px;">
    This code expires in 10 minutes. <br />
    If you did not request this code, please ignore this email.
  </p>

  <p style="color: #a1a1aa; font-size: 11px; margin-top: 10px; font-style: italic;">
    GitRank 2026
  </p>
</div>`,
    })
}
