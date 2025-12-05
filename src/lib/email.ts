import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordResetEmailParams {
  to: string;
  resetToken: string;
  username: string;
}

export async function sendPasswordResetEmail({
  to,
  resetToken,
  username,
}: SendPasswordResetEmailParams) {
  const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  try {
    // TODO: PRODUCTION SETUP - Update 'from' email after verifying your domain in Resend
    // Current: onboarding@resend.dev (works for testing, limited to verified emails)
    // Production: 'MMA Picks <noreply@yourdomain.com>' (requires domain verification)
    // Add email rate limiting
    const { data, error } = await resend.emails.send({
      from: 'MMA Picks <onboarding@resend.dev>',
      to: [to],
      subject: 'Reset Your Password - MMA Picks',
      html: getPasswordResetEmailHTML(username, resetLink),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

function getPasswordResetEmailHTML(username: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #1e293b; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">MMA Picks</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #f1f5f9; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                Hi <strong style="color: #f1f5f9;">${username}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your MMA Picks account. Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 6px; background-color: #dc2626;">
                    <a href="${resetLink}" 
                       style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 20px; padding: 12px; background-color: #0f172a; border-radius: 4px; color: #94a3b8; font-size: 14px; word-break: break-all;">
                ${resetLink}
              </p>
              
              <p style="margin: 20px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                <strong>This link will expire in 1 hour.</strong>
              </p>
              
              <p style="margin: 20px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.6; text-align: center;">
                This is an automated email from MMA Picks. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

interface SendVerificationEmailParams {
  to: string;
  token: string;
  username: string;
}

export async function sendVerificationEmail({
  to,
  token,
  username,
}: SendVerificationEmailParams) {
  const verifyLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-token/${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'MMA Picks <onboarding@resend.dev>',
      to: [to],
      subject: 'Verify Your Email - MMA Picks',
      html: getVerificationEmailHTML(username, verifyLink),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

function getVerificationEmailHTML(username: string, verifyLink: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #1e293b; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">MMA Picks</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 20px; color: #f1f5f9; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
                
                <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                  Hi <strong style="color: #f1f5f9;">${username}</strong>,
                </p>
                
                <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                  Thanks for signing up for MMA Picks! Please verify your email address to get started.
                </p>
                
                <!-- Button -->
                <table role="presentation" style="margin: 30px 0;">
                  <tr>
                    <td style="border-radius: 6px; background-color: #dc2626;">
                      <a href="${verifyLink}" 
                         style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                        Verify Email
                      </a>
                    </td>
                  </tr>
                </table>
                
                <p style="margin: 20px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                  Or copy and paste this link into your browser:
                </p>
                
                <p style="margin: 0 0 20px; padding: 12px; background-color: #0f172a; border-radius: 4px; color: #94a3b8; font-size: 14px; word-break: break-all;">
                  ${verifyLink}
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.6; text-align: center;">
                  This is an automated email from MMA Picks. Please do not reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `.trim();
}
