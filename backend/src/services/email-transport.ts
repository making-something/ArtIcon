import nodemailer from 'nodemailer';

// Check if AWS SES SMTP credentials are configured
const isAwsConfigured = !!(
  process.env.AWS_SES_SMTP_HOST &&
  process.env.AWS_SES_SMTP_USERNAME &&
  process.env.AWS_SES_SMTP_PASSWORD &&
  process.env.AWS_SES_FROM_EMAIL
);

let transporter: nodemailer.Transporter;
let fromEmail: string;

if (isAwsConfigured) {
  console.log('✅ AWS SES SMTP configured - initializing email service');

  // Configure nodemailer to use AWS SES SMTP
  transporter = nodemailer.createTransport({
    host: process.env.AWS_SES_SMTP_HOST!,
    port: parseInt(process.env.AWS_SES_SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.AWS_SES_SMTP_USERNAME!,
      pass: process.env.AWS_SES_SMTP_PASSWORD!,
    },
  });

  fromEmail = process.env.AWS_SES_FROM_EMAIL!;

  console.log(`✅ SES SMTP client initialized`);
  console.log(`📧 SMTP Host: ${process.env.AWS_SES_SMTP_HOST}`);
  console.log(`📧 From email: ${fromEmail}`);
  console.log(`📮 Email service ready to send via AWS SES SMTP`);
} else {
  // Create a mock transporter that logs emails instead of sending them
  console.warn('⚠️  AWS SES SMTP credentials not configured. Email notifications will be logged only.');
  console.warn('   Required environment variables:');
  console.warn('   - AWS_SES_SMTP_HOST');
  console.warn('   - AWS_SES_SMTP_USERNAME');
  console.warn('   - AWS_SES_SMTP_PASSWORD');
  console.warn('   - AWS_SES_FROM_EMAIL');
  console.warn('   Optional: AWS_SES_SMTP_PORT (default: 587)');

  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });

  fromEmail = 'noreply@articon.local';
}

export { transporter, fromEmail, isAwsConfigured };
