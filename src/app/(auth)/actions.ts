
'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '@/firebase/admin';
import { sendTransactionalEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

// Initialize Firebase Admin SDK
customInitApp();

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

    await sendTransactionalEmail({
      to: email,
      subject: 'Reset Your Tradinta Password',
      htmlContent: `
        <h1>Password Reset Request</h1>
        <p>Hello ${user.displayName || 'there'},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="background-color:#29ABE2; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Thanks,<br/>The Tradinta Team</p>
      `,
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
     // Catch errors from sendTransactionalEmail
    if (error.message && error.message.includes('ZeptoMail API Error')) {
      return {
        message: error.message,
        success: false,
      };
    }
    return {
      message: 'An unexpected error occurred. Please try again.',
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
        return { message: 'An unexpected error occurred. Please try again.', success: false };
    }
}
