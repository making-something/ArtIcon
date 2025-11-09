import emailService from './src/services/email.service';

async function testEmail() {
  console.log('📧 Testing email service...');

  try {
    const result = await emailService.sendEmail({
      to: 'dhairyaadroja3391@gmail.com',
      subject: '🧪 Articon Platform - Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎨 Articon Hackathon Platform</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Service Test</p>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">✅ Email Service Working!</h2>

            <p style="color: #666; line-height: 1.6;">
              This is a test email from the Articon Hackathon platform email service.
              If you're receiving this, it means our email system is properly configured
              and ready to send notifications to participants.
            </p>

            <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">📋 Test Details</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Service:</strong> AWS SES / Nodemailer</li>
                <li><strong>Template:</strong> HTML Email</li>
                <li><strong>Sent at:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Status:</strong> ✅ Operational</li>
              </ul>
            </div>

            <p style="color: #666; margin-bottom: 0;">
              This email was sent as part of the platform testing process.
              No action is required.
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2025 Articon Hackathon Platform. All rights reserved.</p>
            <p>This is an automated test message.</p>
          </div>
        </div>
      `,
      text: `
        Articon Hackathon Platform - Email Service Test

        ✅ Email Service Working!

        This is a test email from the Articon Hackathon platform email service.
        If you're receiving this, it means our email system is properly configured
        and ready to send notifications to participants.

        Test Details:
        - Service: AWS SES / Nodemailer
        - Template: Plain Text
        - Sent at: ${new Date().toLocaleString()}
        - Status: ✅ Operational

        This email was sent as part of the platform testing process.
        No action is required.

        © 2025 Articon Hackathon Platform. All rights reserved.
      `
    });

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log('📨 Check your inbox at dhairyaadroja3391@gmail.com');
    } else {
      console.log('❌ Email failed to send:');
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

testEmail();