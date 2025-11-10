import nodemailer from 'nodemailer';
import { SESv2Client } from '@aws-sdk/client-sesv2';

// Check if AWS credentials are configured
const isAwsConfigured = !!(
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_SES_FROM_EMAIL
);

let transporter: nodemailer.Transporter;
let fromEmail: string;
let sesClient: SESv2Client | null = null;

if (isAwsConfigured) {
  console.log('✅ AWS SES configured - initializing email service');

  // Create SES client
  sesClient = new SESv2Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // Configure nodemailer to use AWS SES
  transporter = nodemailer.createTransport({
    host: `email.${process.env.AWS_REGION}.amazonaws.com`,
    port: 465,
    secure: true,
    auth: {
      user: process.env.AWS_ACCESS_KEY_ID!,
      pass: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  fromEmail = process.env.AWS_SES_FROM_EMAIL!;

  console.log(`✅ SES client initialized in region: ${process.env.AWS_REGION}`);
  console.log(`📧 From email: ${fromEmail}`);
} else {
  // Create a mock transporter that logs emails instead of sending them
  console.warn('⚠️  AWS SES credentials not configured. Email notifications will be logged only.');
  console.warn('   Required environment variables:');
  console.warn('   - AWS_REGION');
  console.warn('   - AWS_ACCESS_KEY_ID');
  console.warn('   - AWS_SECRET_ACCESS_KEY');
  console.warn('   - AWS_SES_FROM_EMAIL');

  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });

  fromEmail = 'noreply@articon.local';
}

export { transporter, fromEmail, isAwsConfigured, sesClient };
