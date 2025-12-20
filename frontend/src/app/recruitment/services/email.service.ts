import emailjs from '@emailjs/browser';

class EmailService {
    private serviceId: string;
    private publicKey: string;
    private customTemplateId: string;
    private rejectionTemplateId: string;

    constructor() {
        this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
        this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
        this.customTemplateId = process.env.NEXT_PUBLIC_EMAILJS_CUSTOM_ID || '';
        this.rejectionTemplateId = process.env.NEXT_PUBLIC_EMAILJS_REJECTION_TEMPLATE_ID || '';
    }

    async sendCustomEmail(email: string, subject: string, message: string): Promise<boolean> {
        try {
            const result = await emailjs.send(
                this.serviceId,
                this.customTemplateId,
                {
                    email: email,
                    subject: subject,
                    message: message,
                },
                this.publicKey
            );

            console.log('Email sent successfully:', result);
            return true;
        } catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }

    async sendRejectionEmail(email: string, name: string, job: string): Promise<boolean> {
        try {
            const result = await emailjs.send(
                this.serviceId,
                this.rejectionTemplateId,
                {
                    email: email,
                    name: name,
                    job: job,
                },
                this.publicKey
            );

            console.log('Rejection email sent successfully:', result);
            return true;
        } catch (error) {
            console.error('Failed to send rejection email:', error);
            return false;
        }
    }

    async sendOfferLetter(
        email: string,
        name: string,
        position: string,
        salary: string,
        startDate: string,
        signingUrl?: string
    ): Promise<boolean> {
        const subject = `Job Offer - ${position}`;
        let message = `Dear ${name},

Congratulations! We are pleased to offer you the position of ${position}.

Your starting salary will be ${salary} and your start date is ${startDate}.`;

        if (signingUrl) {
            message += `

Please review and sign your offer letter by clicking the link below:
${signingUrl}`;
        }

        message += `

We are excited to have you join our team and look forward to working with you.

Best regards,
HR Department`;

        return this.sendCustomEmail(email, subject, message);
    }
}

export const emailService = new EmailService();
export default EmailService;
