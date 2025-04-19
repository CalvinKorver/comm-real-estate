import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, topic, message, recipient } = body;

    if (!email || !topic || !message || !recipient) {
      console.error('Validation error: Missing required fields', { email, topic, message, recipient });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: true,
      logger: true
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (transporterError) {
      console.error('Error verifying transporter configuration:', transporterError);
      return NextResponse.json(
        { success: false, message: 'Email service configuration error' },
        { status: 500 }
      );
    }

    // Send the email
    try {
      await transporter.sendMail({
        from: recipient,
        to: email,
        subject: `Support Request: ${topic}`,
        text: `From: ${email}\n\nTopic: ${topic}\n\nMessage: ${message}`,
        html: `
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Topic:</strong> ${topic}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });
    } catch (sendMailError) {
      console.error('Error sending email:', sendMailError);
      return NextResponse.json(
        { success: false, message: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', { email, topic, recipient });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}