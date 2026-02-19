'use server';

import { authService } from '@/lib/services/auth.service';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Handle user registration
 */
export async function registerAction(data: any) {
  try {
    // Validate required fields
    if (!data.email || !data.password || !data.fullName) {
      return { 
        success: false, 
        message: 'Please fill in all required fields' 
      };
    }

    if (data.password !== data.confirmPassword) {
      return { 
        success: false, 
        message: 'Passwords do not match' 
      };
    }

    if (!data.agreeTerms) {
      return { 
        success: false, 
        message: 'You must agree to the Terms of Service' 
      };
    }

    const { token } = await authService.register({
      name: data.fullName,
      email: data.email,
      password: data.password,
      role: 'user', // Default role for new registrations
      isActive: true
    });

    // Store token in cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: error.message || 'Registration failed. Please try again.' 
    };
  }
}

/**
 * Handle user login
 */
export async function loginAction(data: any) {
  try {
    if (!data.email || !data.password) {
      return { 
        success: false, 
        message: 'Please provide both email and password' 
      };
    }

    const { token } = await authService.login({
      email: data.email,
      password: data.password
    });

    // Store token in cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error.message || 'Invalid email or password' 
    };
  }
}
