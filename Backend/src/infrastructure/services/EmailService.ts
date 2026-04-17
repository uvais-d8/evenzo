import * as nodemailer from 'nodemailer';

import { logger } from './LoggerService';

import { IEmailService } from '../../application/interfaces/IEmailService';

export class EmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: { rejectUnauthorized: false },
        });
    }

    async sendOtp(email: string, otp: string): Promise<boolean> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Verification Code - Evenzo',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Evenzo Verification</h2>
          <p>Hello,</p>
          <p>Thank you for choosing Evenzo. Please use the following One-Time Password (OTP) to complete your verification:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 5px;">${otp}</span>
          </div>
          <p>This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2026 Evenzo. All rights reserved.</p>
        </div>
      `,
        };

        try {
            logger.info(`[EmailService] Sending OTP to ${email}`);
            await this.transporter.sendMail(mailOptions);
            logger.info(`[EmailService] OTP sent successfully to ${email}`);
            return true;
        } catch (error) {
            logger.error(`[EmailService] Failed to send OTP to ${email}`, { error });
            return false;
        }
    }
}
