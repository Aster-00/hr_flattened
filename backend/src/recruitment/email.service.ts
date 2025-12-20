import { Injectable, Logger } from '@nestjs/common';

interface EmailParams {
    email: string;
    name: string;
    subject: string;
    message: string;
    from_name?: string;
    [key: string]: any;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        this.logger.warn('EmailService is a placeholder - emails should be sent from the frontend using EmailJS');
    }

    async sendEmail(_templateId: string, params: EmailParams): Promise<boolean> {
        this.logger.log(`Email service called for ${params.email} - This should be handled by the frontend`);
        // Return true to not break existing flows, but emails won't actually be sent from backend
        return true;
    }

    async sendOfferLetter(
        candidateEmail: string,
        candidateName: string,
        position: string,
        salary: string,
        startDate: string,
    ): Promise<boolean> {
        const message = `Dear ${candidateName},

Congratulations! We are pleased to offer you the position of ${position}.

Your starting salary will be ${salary} and your start date is ${startDate}.

We are excited to have you join our team and look forward to working with you.

Best regards,
HR Department`;

        return this.sendEmail('offer_template', {
            email: candidateEmail,
            name: candidateName,
            subject: `Job Offer - ${position}`,
            message,
        });
    }

    async sendRejectionEmail(
        candidateEmail: string,
        candidateName: string,
        position: string,
    ): Promise<boolean> {
        const message = `Dear ${candidateName},

Thank you for your interest in the position of ${position} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your time and wish you success in your future endeavors.

Best regards,
HR Department`;

        return this.sendEmail('rejection_template', {
            email: candidateEmail,
            name: candidateName,
            subject: `Application Update - ${position}`,
            message,
        });
    }
}

export const emailService = new EmailService();
export default EmailService;
