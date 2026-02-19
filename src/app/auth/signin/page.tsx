'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const isDev = process.env.NODE_ENV === 'development';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [devEmail, setDevEmail] = useState('dev@localhost');
  const [devPassword, setDevPassword] = useState('');
  const [emailLogin, setEmailLogin] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === '1') setRegistered(true);
  }, [searchParams]);

  async function handleSignIn(provider: string) {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl: '/' });
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!emailLogin.trim() || !emailPassword) return;
    setIsLoading('email-login');
    await signIn('email-login', {
      email: emailLogin.trim(),
      password: emailPassword,
      callbackUrl: '/',
    });
    setIsLoading(null);
  }

  async function handleDevSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!devEmail.trim() || !devPassword) return;
    setIsLoading('credentials');
    await signIn('credentials', {
      email: devEmail.trim(),
      password: devPassword,
      callbackUrl: '/',
    });
    setIsLoading(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center pattern-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Financi AI</h1>
          <p className="text-muted text-sm">Smart expense tracking with AI-powered insights</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-border/60 p-8">
          {registered && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-success-light text-success text-sm font-medium text-center">
              Account created. Sign in below.
            </div>
          )}
          <h2 className="text-lg font-semibold text-foreground text-center mb-6">Sign in to continue</h2>

          <div className="space-y-3">
            <button
              onClick={() => handleSignIn('google')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading === 'google' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted/30 border-t-primary" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </button>

            <button
              onClick={() => handleSignIn('github')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading === 'github' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted/30 border-t-primary" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              )}
              Continue with GitHub
            </button>
          </div>

          {/* Email + password login (MongoDB-backed) */}
          <form onSubmit={handleEmailLogin} className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Email sign in</p>
            <input
              type="email"
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 dark:bg-gray-800 dark:text-foreground"
              autoComplete="username"
              required
            />
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30 dark:bg-gray-800 dark:text-foreground"
              autoComplete="current-password"
              required
            />
            <button
              type="submit"
              disabled={isLoading !== null || !emailPassword || !emailLogin}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading === 'email-login' ? 'Signing in…' : 'Sign in with email'}
            </button>
            <p className="text-center">
              <Link href="/auth/forgot-password" className="text-xs text-muted hover:text-primary">Forgot password?</Link>
            </p>
          </form>

          {isDev && (
            <form onSubmit={handleDevSignIn} className="mt-6 pt-6 border-t border-border space-y-3">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Dev only</p>
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="dev@localhost"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30"
                autoComplete="username"
              />
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                placeholder="DEV_PASSWORD from .env"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-muted/30"
                autoComplete="current-password"
              />
              <button
                type="submit"
                disabled={isLoading !== null || !devPassword}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
              >
                {isLoading === 'credentials' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-current" />
                    Signing in…
                  </span>
                ) : (
                  'Sign in (dev)'
                )}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
          <div className="mt-6 text-center">
            <p className="text-xs text-muted">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="underline hover:no-underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:no-underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Free plan includes 50 expenses with manual entry.
          <br />
          <span className="text-primary font-medium">Upgrade to PRO</span> for unlimited expenses + AI features.
        </p>
      </div>
    </div>
  );
}
