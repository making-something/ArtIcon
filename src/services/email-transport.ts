import nodemailer from 'nodemailer';

// Check if AWS credentials are configured
const isAwsConfigured = !!(
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_SES_FROM_EMAIL
);

let transporter: nodemailer.Transporter;
let fromEmail: string;

if (isAwsConfigured) {
  // For now, use SMTP configuration or create a test account
  // To use AWS SES properly with nodemailer v7, you need @aws-sdk/client-sesv2
  // For development, we'll use a mock transporter
  console.warn('⚠️  AWS SES with nodemailer v7 requires @aws-sdk/client-sesv2');
  console.warn('⚠️  Email notifications will be logged only. Install @aws-sdk/client-sesv2 for production.');

  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });

  fromEmail = process.env.AWS_SES_FROM_EMAIL || 'noreply@yourdomain.com';
} else {
  // Create a mock transporter that logs emails instead of sending them
  console.warn('⚠️  AWS SES credentials not configured. Email notifications will be logged only.');

  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });

  fromEmail = 'noreply@localhost.local';
}

export { transporter, fromEmail, isAwsConfigured };
