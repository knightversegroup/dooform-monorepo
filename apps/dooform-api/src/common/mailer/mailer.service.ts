import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  private transporter: nodemailer.Transporter | null = null
  private readonly from: string

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')
    const port = parseInt(this.config.get<string>('SMTP_PORT', '587'), 10)
    const user = this.config.get<string>('SMTP_USER')
    const pass = this.config.get<string>('SMTP_PASS')
    this.from = this.config.get<string>('SMTP_FROM', 'Dooform <noreply@dooform.local>')

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
      this.logger.log(`SMTP transport configured: ${host}:${port}`)
    } else {
      this.logger.warn('SMTP not configured — emails will be logged to console.')
    }
  }

  async sendPasswordResetEmail(email: string, link: string): Promise<void> {
    const subject = 'Reset your Dooform password'
    const html = `
      <p>You requested a password reset.</p>
      <p>Click the link below to set a new password:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `
    await this.send(email, subject, html)
  }

  async sendComplianceAlert(email: string, subject: string, body: string): Promise<void> {
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;">
        <h2 style="color:#b45309;">Compliance alert</h2>
        <pre style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:6px;border:1px solid #e5e7eb;">${body.replace(
          /[<>&]/g,
          (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] ?? c,
        )}</pre>
      </div>
    `
    await this.send(email, subject, html)
  }

  async sendOrganizationInvite(email: string, code: string, link: string): Promise<void> {
    const subject = `You've been invited to a Dooform organization`
    const html = `
      <p>You've been invited to join an organization on Dooform.</p>
      <p>Use this invite code: <strong>${code}</strong></p>
      <p>Or sign up directly: <a href="${link}">${link}</a></p>
    `
    await this.send(email, subject, html)
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}\n${html}`)
      return
    }
    await this.transporter.sendMail({ from: this.from, to, subject, html })
  }
}
