import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static async createTestAccount() {
    try {
      // Generate test SMTP service account
      const testAccount = await nodemailer.createTestAccount();

      // Create reusable transporter
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('Ethereal Email credentials:', {
        user: testAccount.user,
        pass: testAccount.pass
      });

      return testAccount;
    } catch (error) {
      console.error('Failed to create test account:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    if (!this.transporter) {
      await this.createTestAccount();
    }
    //Might need to env the testing url too.
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"Take Home Challenge" <THC@thc.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send reset email');
    }
  }
}

