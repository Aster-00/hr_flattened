# EmailJS Integration Guide

This guide will help you set up EmailJS to send emails from your HR system.

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add an Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email account
5. Copy the **Service ID** (e.g., `service_abc123`)

## Step 3: Get Your Public Key

1. In the EmailJS dashboard, go to **Account** → **General**
2. Find your **Public Key** (e.g., `your_public_key_here`)
3. Copy this key

## Step 4: Create Email Templates

You need to create templates for different types of emails. Here are the templates you need:

### Template 1: Interview Invitation

1. Go to **Email Templates** → **Create New Template**
2. Name it "Interview Invitation"
3. Template content:

```
Subject: Interview Invitation - {{position}}

Dear {{to_name}},

We are pleased to invite you for an interview for the position of {{position}}.

Interview Details:
- Date: {{interview_date}}
- Time: {{interview_time}}
- Method: {{interview_method}}
- Link: {{interview_link}}

We look forward to speaking with you.

Best regards,
HR Team
```

4. Copy the **Template ID**

### Template 2: Offer Letter

```
Subject: Job Offer - {{position}}

Dear {{to_name}},

Congratulations! We are pleased to offer you the position of {{position}}.

Offer Details:
- Position: {{position}}
- Salary: {{salary}}
- Start Date: {{start_date}}

Please review the attached documents and let us know your decision.

Best regards,
HR Team
```

### Template 3: Application Confirmation

```
Subject: Application Received - {{position}}

Dear {{to_name}},

Thank you for applying for the position of {{position}} (Application ID: {{application_id}}).

We have received your application and will review it shortly. We will contact you if your qualifications match our requirements.

Best regards,
HR Team
```

### Template 4: Rejection Email

```
Subject: Application Update - {{position}}

Dear {{to_name}},

Thank you for your interest in the position of {{position}}.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate the time you invested in the application process and wish you success in your job search.

Best regards,
HR Team
```

### Template 5: Custom Email

```
Subject: {{subject}}

Dear {{to_name}},

{{message}}

Best regards,
HR Team
```

## Step 5: Update Environment Variables

Update your `.env` file with the values you copied:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here

NEXT_PUBLIC_EMAILJS_INTERVIEW_TEMPLATE_ID=template_abc123
NEXT_PUBLIC_EMAILJS_OFFER_TEMPLATE_ID=template_def456
NEXT_PUBLIC_EMAILJS_APPLICATION_TEMPLATE_ID=template_ghi789
NEXT_PUBLIC_EMAILJS_REJECTION_TEMPLATE_ID=template_jkl012
NEXT_PUBLIC_EMAILJS_CUSTOM_TEMPLATE_ID=template_mno345
```

## Step 6: Test Your Setup

1. Restart your Next.js development server
2. Import the test component in any page:

```tsx
import EmailExample from '@/components/EmailExample';

export default function TestPage() {
  return <EmailExample />;
}
```

3. Click the test buttons to send emails

## Step 7: Use in Your Application

### Basic Usage

```tsx
import emailService from '@/services/emailService';

// Send interview invitation
await emailService.sendInterviewInvitation(
  'candidate@example.com',
  'John Doe',
  'Software Engineer',
  '2025-12-20',
  '10:00 AM',
  'Online',
  'https://meet.google.com/xyz'
);

// Send offer letter
await emailService.sendOfferLetter(
  'candidate@example.com',
  'Jane Smith',
  'Senior Developer',
  '$120,000',
  '2026-01-15'
);

// Send custom email
await emailService.sendCustomEmail(
  'user@example.com',
  'User Name',
  'Custom Subject',
  'Your custom message here'
);
```

### Advanced Usage with Error Handling

```tsx
'use client';

import { useState } from 'react';
import emailService from '@/services/emailService';

export default function SendEmailComponent() {
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      await emailService.sendInterviewInvitation(
        'candidate@example.com',
        'John Doe',
        'Software Engineer',
        '2025-12-20',
        '10:00 AM',
        'Online',
        'https://meet.google.com/xyz'
      );
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSendEmail} disabled={loading}>
      {loading ? 'Sending...' : 'Send Interview Invitation'}
    </button>
  );
}
```

## EmailJS Free Plan Limits

- 200 emails per month
- 2 email services
- 1 email template per service

To send more emails, you'll need to upgrade to a paid plan.

## Troubleshooting

### "EmailJS configuration is missing"
- Make sure your `.env` file is updated with the correct values
- Restart your Next.js dev server after updating `.env`
- Ensure variable names start with `NEXT_PUBLIC_`

### Email not sending
- Check EmailJS dashboard for error logs
- Verify your email service is connected
- Make sure the template IDs are correct
- Check browser console for errors

### Template variables not working
- Ensure your template uses double curly braces: `{{variable_name}}`
- Variable names must match exactly (case-sensitive)
- Check that you're passing all required variables

## Security Notes

- EmailJS public key is safe to expose in frontend code
- Free tier has rate limits - implement user-facing rate limiting if needed
- Consider adding server-side validation before sending emails
- Don't send sensitive information in email templates

## Integration with Recruitment Module

To integrate with your recruitment service, you can call the email service whenever:
- A new application is submitted
- An interview is scheduled
- An offer is made
- An application is rejected

Example in a recruitment component:

```tsx
import emailService from '@/services/emailService';

const handleScheduleInterview = async (candidateData: any) => {
  // Schedule interview in backend
  const interview = await scheduleInterviewAPI(candidateData);

  // Send email notification
  await emailService.sendInterviewInvitation(
    candidateData.email,
    candidateData.name,
    candidateData.position,
    interview.date,
    interview.time,
    interview.method,
    interview.link
  );
};
```
