
'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { customInitApp } from '@/firebase/admin';
import { sendTransactionalEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

// Initialize Firebase Admin SDK
customInitApp();

export async function setUserRoleClaim(userId: string, role: string): Promise<{ success: boolean; message: string; }> {
  const auth = getAuth();
  const firestore = getFirestore();
  try {
    // 1. Set custom user claims for security/permissions
    await auth.setCustomUserClaims(userId, { role });

    // 2. Update the user's document in Firestore for display purposes
    const userDocRef = firestore.collection('users').doc(userId);
    await userDocRef.update({ role: role });

    return { success: true, message: `Successfully set role to ${role} for user ${userId}` };
  } catch (error: any) {
    console.error('Error setting custom claims and updating user document:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

const ResetRequestSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

export async function handleRequestPasswordReset(
  prevState: any,
  formData: FormData
) {
  const validatedFields = ResetRequestSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.email?.[0] || 'Invalid input.',
      success: false,
    };
  }

  const { email } = validatedFields.data;

  try {
    const auth = getAuth();
    const user = await auth.getUserByEmail(email);

    if (!user) {
      // Still return success to prevent user enumeration
      return {
        message: "If an account exists for this email, a reset link has been sent.",
        success: true,
      };
    }

    const firestore = getFirestore();
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    const tokenDocRef = firestore.collection('passwordResetTokens').doc(token);
    await tokenDocRef.set({
      userId: user.uid,
      token: token,
      expires: expires,
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Tradinta Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                  <td align="center" style="padding: 20px 0;">
                      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                          <tr>
                              <td align="center" style="padding: 40px 20px; border-bottom: 1px solid #eeeeee;">
                                  <img src="https://i.postimg.cc/NGkTK7Jc/Gemini-Generated-Image-e6p14ne6p14ne6p1-removebg-preview.png" alt="Tradinta Logo" width="150">
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 40px 30px;">
                                  <h1 style="color: #333333; font-size: 24px;">Password Reset Request</h1>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">Hello ${user.displayName || 'there'},</p>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your Tradinta account. To proceed, please click the button below:</p>
                                  <p style="text-align: center; margin: 30px 0;">
                                      <a href="${resetLink}" style="background-color: #1D4ED8; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Your Password</a>
                                  </p>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">This link is valid for one hour. If you did not request a password reset, you can safely ignore this email. Your account security has not been compromised.</p>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 30px;">Thanks,<br>The Tradinta Team</p>
                              </td>
                          </tr>
                           <tr>
                              <td style="padding: 20px 30px; font-size: 12px; color: #999999; text-align: center; border-top: 1px solid #eeeeee;">
                                  <p>If you're having trouble with the button above, copy and paste this URL into your web browser:</p>
                                  <p><a href="${resetLink}" style="color: #1D4ED8; text-decoration: none;">${resetLink}</a></p>
                                  <p style="margin-top: 20px;">© ${new Date().getFullYear()} Tradinta. All rights reserved.</p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;

    await sendTransactionalEmail({
      to: email,
      subject: 'Reset Your Tradinta Password',
      htmlContent: emailHtml,
    });

    return {
      message: "If an account with that email exists, a password reset link has been sent to it.",
      success: true,
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    if (error.code === 'auth/user-not-found') {
        // To prevent user enumeration, we don't tell the user they don't exist.
        return {
            message: "If an account with that email exists, a password reset link has been sent to it.",
            success: true,
        };
    }
     // Catch specific errors from sendTransactionalEmail
    if (error.message && error.message.includes('ZeptoMail API Error')) {
      return {
        message: 'Could not send reset email. ' + error.message,
        success: false,
      };
    }
    return {
      message: error.message || 'An unexpected error occurred. Please try again.',
      success: false,
    };
  }
}


export async function handleAdminRequestPasswordReset(email: string): Promise<{ success: boolean; message: string; }> {
  try {
    const auth = getAuth();
    const user = await auth.getUserByEmail(email);

    if (!user) {
      return {
        message: "This user does not exist.",
        success: false,
      };
    }

    const firestore = getFirestore();
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    const tokenDocRef = firestore.collection('passwordResetTokens').doc(token);
    await tokenDocRef.set({
      userId: user.uid,
      token: token,
      expires: expires,
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Tradinta Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                  <td align="center" style="padding: 20px 0;">
                      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                          <tr>
                              <td align="center" style="padding: 40px 20px; border-bottom: 1px solid #eeeeee;">
                                  <img src="https://i.postimg.cc/NGkTK7Jc/Gemini-Generated-Image-e6p14ne6p14ne6p1-removebg-preview.png" alt="Tradinta Logo" width="150">
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 40px 30px;">
                                  <h1 style="color: #333333; font-size: 24px;">Administrator Password Reset</h1>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">Hello ${user.displayName || 'there'},</p>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">An administrator has initiated a password reset for your Tradinta account. To proceed and create a new password, please click the button below:</p>
                                  <p style="text-align: center; margin: 30px 0;">
                                      <a href="${resetLink}" style="background-color: #1D4ED8; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Your Password</a>
                                  </p>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">This link is valid for one hour. If you did not expect this, please contact our support team immediately.</p>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 30px;">Thanks,<br>The Tradinta Team</p>
                              </td>
                          </tr>
                           <tr>
                              <td style="padding: 20px 30px; font-size: 12px; color: #999999; text-align: center; border-top: 1px solid #eeeeee;">
                                  <p>If you're having trouble with the button above, copy and paste this URL into your web browser:</p>
                                  <p><a href="${resetLink}" style="color: #1D4ED8; text-decoration: none;">${resetLink}</a></p>
                                  <p style="margin-top: 20px;">© ${new Date().getFullYear()} Tradinta. All rights reserved.</p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;

    await sendTransactionalEmail({
      to: email,
      subject: 'Administrator Initiated Password Reset for your Tradinta Account',
      htmlContent: emailHtml,
    });

    return {
      message: `A password reset link has been sent to ${email}.`,
      success: true,
    };
  } catch (error: any) {
    console.error('Admin password reset request error:', error);
    if (error.code === 'auth/user-not-found') {
        return {
            message: "User not found.",
            success: false,
        };
    }
    if (error.message && error.message.includes('ZeptoMail API Error')) {
      return {
        message: 'Could not send reset email. ' + error.message,
        success: false,
      };
    }
    return {
      message: error.message || 'An unexpected error occurred. Please try again.',
      success: false,
    };
  }
}

export async function verifyResetToken(token: string): Promise<{ success: boolean; message: string }> {
    try {
        const firestore = getFirestore();
        const tokenDoc = await firestore.collection('passwordResetTokens').doc(token).get();

        if (!tokenDoc.exists) {
            return { success: false, message: 'This reset link is invalid.' };
        }

        const data = tokenDoc.data();
        if (data?.expires.toDate() < new Date()) {
            await tokenDoc.ref.delete();
            return { success: false, message: 'This reset link has expired. Please request a new one.' };
        }
        
        return { success: true, message: 'Token is valid.' };

    } catch (error) {
        console.error('Token verification error:', error);
        return { success: false, message: 'An error occurred while verifying the link.' };
    }
}


const ResetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
  token: z.string().min(1, 'Token is missing.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});


export async function handleResetPassword(
  prevState: any,
  formData: FormData
) {
    const validatedFields = ResetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return { message: errors.password?.[0] || errors.confirmPassword?.[0] || errors.token?.[0] || 'Invalid input.', success: false };
    }

    const { password, token } = validatedFields.data;

    try {
        const firestore = getFirestore();
        const tokenDocRef = firestore.collection('passwordResetTokens').doc(token);
        const tokenDoc = await tokenDocRef.get();

        if (!tokenDoc.exists) {
            return { message: 'This reset link is invalid.', success: false };
        }

        const tokenData = tokenDoc.data();
        if (tokenData?.expires.toDate() < new Date()) {
            await tokenDocRef.delete();
            return { message: 'This reset link has expired. Please request a new one.', success: false };
        }

        const userId = tokenData.userId;
        const auth = getAuth();
        await auth.updateUser(userId, { password });

        // Invalidate the token
        await tokenDocRef.delete();

        return { message: 'Your password has been successfully reset. You can now log in.', success: true };

    } catch (error: any) {
        console.error('Password reset failed:', error);
        return { message: error.message || 'An unexpected error occurred. Please try again.', success: false };
    }
}

export async function sendVerificationEmail(userId: string, email: string, name: string): Promise<void> {
  const firestore = getFirestore();

  try {
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    const tokenDocRef = firestore.collection('emailVerificationTokens').doc(token);
    await tokenDocRef.set({
      userId: userId,
      token: token,
      expires: expires,
    });

    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Tradinta! Please Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                  <td align="center" style="padding: 20px 0;">
                      <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                          <tr>
                              <td align="center" style="padding: 40px 20px; border-bottom: 1px solid #eeeeee;">
                                  <img src="https://i.postimg.cc/NGkTK7Jc/Gemini-Generated-Image-e6p14ne6p14ne6p1-removebg-preview.png" alt="Tradinta Logo" width="150">
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 40px 30px;">
                                  <h1 style="color: #333333; font-size: 24px;">Welcome to Tradinta, ${name}!</h1>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">Thank you for signing up. To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
                                  <p style="text-align: center; margin: 30px 0;">
                                      <a href="${verificationLink}" style="background-color: #1D4ED8; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify My Email Address</a>
                                  </p>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">This link is valid for 24 hours. If you did not sign up for a Tradinta account, you can safely ignore this email.</p>
                                  <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 30px;">Thanks,<br>The Tradinta Team</p>
                              </td>
                          </tr>
                           <tr>
                              <td style="padding: 20px 30px; font-size: 12px; color: #999999; text-align: center; border-top: 1px solid #eeeeee;">
                                  <p>If you're having trouble with the button above, copy and paste this URL into your web browser:</p>
                                  <p><a href="${verificationLink}" style="color: #1D4ED8; text-decoration: none;">${verificationLink}</a></p>
                                  <p style="margin-top: 20px;">© ${new Date().getFullYear()} Tradinta. All rights reserved.</p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;

    await sendTransactionalEmail({
      to: email,
      subject: 'Verify Your Email Address for Tradinta',
      htmlContent: emailHtml,
    });
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    // We don't want to block the sign-up flow if the email fails.
    // The user can request a new verification email later.
  }
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; message: string }> {
    try {
        const firestore = getFirestore();
        const auth = getAuth();
        const tokenDocRef = firestore.collection('emailVerificationTokens').doc(token);
        const tokenDoc = await tokenDocRef.get();

        if (!tokenDoc.exists) {
            return { success: false, message: 'This verification link is invalid or has already been used.' };
        }

        const data = tokenDoc.data();
        if (data?.expires.toDate() < new Date()) {
            await tokenDocRef.delete();
            return { success: false, message: 'This verification link has expired. Please request a new one.' };
        }

        const userId = data.userId;
        const user = await auth.getUser(userId); // Get user record
        
        // Mark email as verified in Firebase Auth
        await auth.updateUser(userId, { emailVerified: true });
        
        // Mark email as verified in Firestore user document
        const userDocRef = firestore.collection('users').doc(userId);
        await userDocRef.update({ emailVerified: true });

        // Invalidate the token
        await tokenDocRef.delete();

        // Send welcome email
        const welcomeHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Tradinta!</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="padding: 20px 0;">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                                <tr>
                                    <td align="center" style="padding: 40px 20px; border-bottom: 1px solid #eeeeee;">
                                        <img src="https://i.postimg.cc/NGkTK7Jc/Gemini-Generated-Image-e6p14ne6p14ne6p1-removebg-preview.png" alt="Tradinta Logo" width="150">
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h1 style="color: #333333; font-size: 24px;">Welcome to the Tradinta Network, ${user.displayName || 'Partner'}!</h1>
                                        <p style="color: #555555; font-size: 16px; line-height: 1.5;">Your account is now active. You are officially part of Africa’s premier B2B manufacturing marketplace. Here’s how to get started:</p>
                                        
                                        <h2 style="color: #333333; font-size: 20px; margin-top: 30px;">Your Quick Start Guide</h2>
                                        <ul style="color: #555555; font-size: 16px; line-height: 1.5; padding-left: 20px;">
                                            <li style="margin-bottom: 10px;"><strong>For Manufacturers:</strong> Complete your shop profile to get verified and start listing products. A complete profile attracts more buyers.</li>
                                            <li style="margin-bottom: 10px;"><strong>For Buyers:</strong> Start browsing thousands of products and use the "Request Quotation" feature to get the best factory prices.</li>
                                            <li style="margin-bottom: 10px;"><strong>For Growth Partners:</strong> Check your dashboard for active campaigns and share your unique referral links to start earning.</li>
                                        </ul>

                                        <p style="text-align: center; margin: 30px 0;">
                                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #1D4ED8; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to My Dashboard</a>
                                        </p>
                                        <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-top: 30px;">If you have any questions, visit our Help Center or contact our support team.</p>
                                        <p style="color: #555555; font-size: 16px; line-height: 1.5;">Best,<br>The Tradinta Team</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 30px; font-size: 12px; color: #999999; text-align: center; border-top: 1px solid #eeeeee;">
                                        <p>© ${new Date().getFullYear()} Tradinta. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        // We don't want to block the user's flow, so we send the email but don't await it.
        // We also wrap in a try/catch to prevent any email sending errors from failing the verification process.
        try {
          if (user.email) {
            sendTransactionalEmail({
              to: user.email,
              subject: 'Welcome to Tradinta! Your Account is Active.',
              htmlContent: welcomeHtml,
            });
          }
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
        }
        
        return { success: true, message: 'Your email has been successfully verified!' };

    } catch (error) {
        console.error('Email token verification error:', error);
        return { success: false, message: 'An error occurred while verifying your email.' };
    }
}

    