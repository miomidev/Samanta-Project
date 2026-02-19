'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/app/components/layout/AuthLayout';
import InputField from '@/app/components/ui/InputField';
import Button from '@/app/components/ui/Button';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add password reset logic here
    console.log('Reset password for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthLayout 
        title="Check Your Email" 
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <p className="text-slate-300">
            We've sent a password reset link to <span className="text-blue-400 font-medium">{email}</span>
          </p>
          
          <p className="text-sm text-slate-500">
            Didn't receive the email?{' '}
            <button 
              onClick={() => setIsSubmitted(false)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Try again
            </button>
          </p>

          <Link href="/login">
            <Button variant="outline" fullWidth>
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Forgot Password?" 
      subtitle="No worries, we'll send you reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Enter your email"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          error={error}
        />

        <Button type="submit" fullWidth>
          Send Reset Link
        </Button>

        <Link 
          href="/login" 
          className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Back to Login
        </Link>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;