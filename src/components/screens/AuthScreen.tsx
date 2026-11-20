import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  UserPlus,
  X,
} from 'lucide-react';
import { ScreenId, UserProfile } from '../../types/food';
import {
  fetchSmtpStatus,
  SmtpStatusResult,
  WelcomeEmailDispatchResult,
} from '../../services/cloudSyncService';

const NUTRISICENTIA_LOGO_URL = '/assets/aistudio/WA_1795017645854_f49b3ef0.jpeg';

type AuthTab = 'login' | 'signup' | 'recover';

interface AuthScreenProps {
  profile: UserProfile;
  isSignedIn: boolean;
  authEmail?: string | null;
  emailVerified?: boolean;
  onNavigate: (screen: ScreenId) => void;
  onSignInEmail: (email: string, password: string) => Promise<void>;
  onSignUpEmail: (params: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ welcomeEmail: WelcomeEmailDispatchResult; verificationSent: boolean }>;
  onSendPasswordReset: (email: string) => Promise<void>;
  onSignInGoogle: () => Promise<void>;
  onResendWelcomeEmail?: (force?: boolean) => Promise<WelcomeEmailDispatchResult>;
  onResendVerification?: () => Promise<void>;
  onRefreshVerification?: () => Promise<boolean>;
  onSignOut: () => Promise<void>;
}

function mapFirebaseAuthError(err: unknown): string {
  const raw = err as { code?: string; message?: string };
  const code = raw?.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in or resetting your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Double-check your credentials or reset your password.';
    case 'auth/too-many-requests':
      return 'Too many attempts detected. Please wait a moment and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method → Email/Password). Use Google Sign-In or enable Email/Password in Firebase Console.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In popup was closed before finishing.';
    default:
      return raw?.message || 'Authentication request could not be completed. Please try again.';
  }
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  profile,
  isSignedIn,
  authEmail,
  emailVerified = false,
  onNavigate,
  onSignInEmail,
  onSignUpEmail,
  onSendPasswordReset,
  onSignInGoogle,
  onResendWelcomeEmail,
  onResendVerification,
  onRefreshVerification,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isBusy, setIsBusy] = useState(false);
  const [isSendingWelcome, setIsSendingWelcome] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [lastWelcomeResult, setLastWelcomeResult] = useState<WelcomeEmailDispatchResult | null>(
    null
  );
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatusResult | null>(null);

  useEffect(() => {
    void fetchSmtpStatus().then(setSmtpStatus);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsBusy(true);
    try {
      await onSignInEmail(email.trim(), password);
      setStatusMsg('Welcome back! Signed in to NutriScientia — Food Insight AI Virtual Lab.');
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsBusy(true);
    try {
      const result = await onSignUpEmail({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setLastWelcomeResult(result.welcomeEmail);
      const emailNotes: string[] = [];
      if (result.welcomeEmail.sent) {
        emailNotes.push(
          `Welcome email dispatched from ${smtpStatus?.sourceEmail || 'varunvadlakonda1577@gmail.com'}.`
        );
      } else if (result.welcomeEmail.code === 'SMTP_NOT_CONFIGURED') {
        const missing = result.welcomeEmail.missingFields?.join(', ') || 'SMTP_PASS';
        emailNotes.push(
          `Account active! Welcome message shown below (add ${missing} in server .env to also deliver via Gmail SMTP).`
        );
      }
      if (result.verificationSent) {
        emailNotes.push('Verification email sent.');
      }
      setStatusMsg(
        `Welcome to NutriScientia, ${name.trim()}! ${emailNotes.join(' ')}`.trim()
      );
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter the email address registered with your account.');
      return;
    }

    setIsBusy(true);
    try {
      await onSendPasswordReset(email.trim());
      setStatusMsg(
        `Password recovery instructions sent to ${email.trim()}. Check your inbox and spam folder.`
      );
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setIsBusy(true);
    try {
      await onSignInGoogle();
      setStatusMsg('Signed in with Google successfully.');
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="font-display font-bold text-sm text-slate-900 leading-tight">
            Account &amp; Access
          </h1>
          <p className="text-[11px] text-slate-500">NutriScientia · 6 Monkeys Inc.</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="min-h-[40px] px-2.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
        >
          Settings
        </button>
      </div>

      <div className="p-4 pb-8 space-y-4">
        {/* Brand Intro Card */}
        <div className="rounded-3xl bg-white border border-emerald-200/80 p-4 flex items-center gap-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-100 p-1 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={NUTRISICENTIA_LOGO_URL}
              alt="NutriScientia"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-sm text-slate-900">NutriScientia</div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              Food Insight AI Virtual Lab
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Powered by 6 Monkeys Inc.</div>
          </div>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 flex items-start justify-between gap-2 text-xs text-rose-800">
            <span className="font-medium leading-relaxed">{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 p-0.5 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {statusMsg && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-start justify-between gap-2 text-xs text-emerald-900">
            <span className="font-medium leading-relaxed">{statusMsg}</span>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="text-emerald-700 p-0.5 cursor-pointer"
              aria-label="Dismiss status"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isSignedIn ? (
          <div className="space-y-4">
            {/* Official In-App Welcome Message Card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white p-5 space-y-3 shadow-lg border border-emerald-700/60">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Official Welcome Message
                    </div>
                    <h2 className="font-display font-extrabold text-base leading-tight">
                      Welcome to NutriScientia, {profile.name || 'Explorer'}!
                    </h2>
                  </div>
                </div>
              </div>

              <p className="text-xs text-emerald-50/95 leading-relaxed">
                Your <strong>Food Insight AI Virtual Lab</strong> account is active. Scan meals for
                instant macro &amp; allergen audits, test pairings in <strong>FoodLab</strong>, and
                download 2-page PDF reports with food imagery and public evidence links.
              </p>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/15 text-[11px]">
                <span className="font-bold text-emerald-300">Powered by 6 Monkeys Inc.</span>
                {onResendWelcomeEmail && (
                  <button
                    type="button"
                    disabled={isSendingWelcome}
                    onClick={async () => {
                      setIsSendingWelcome(true);
                      setErrorMsg(null);
                      try {
                        const res = await onResendWelcomeEmail(true);
                        setLastWelcomeResult(res);
                        void fetchSmtpStatus().then(setSmtpStatus);
                        if (res.sent) {
                          setStatusMsg(
                            `Welcome email sent to ${authEmail || profile.email} from ${smtpStatus?.sourceEmail || 'varunvadlakonda1577@gmail.com'}!`
                          );
                        } else if (res.code === 'SMTP_NOT_CONFIGURED') {
                          const missing = res.missingFields?.join(', ') || 'SMTP_PASS';
                          setErrorMsg(
                            `In-app welcome is active. External email delivery requires ${missing} (Gmail App Password for ${smtpStatus?.sourceEmail || 'varunvadlakonda1577@gmail.com'}) in the server .env file.`
                          );
                        } else {
                          setErrorMsg(res.message || 'Could not deliver welcome email right now.');
                        }
                      } finally {
                        setIsSendingWelcome(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSendingWelcome ? 'Sending...' : 'Send Welcome Email'}</span>
                  </button>
                )}
              </div>

              {(lastWelcomeResult || smtpStatus) && (
                <div className="rounded-xl bg-black/25 px-3 py-2 text-[10px] text-emerald-100/90 leading-relaxed">
                  {lastWelcomeResult?.sent ? (
                    <span>
                      ✓ Welcome email delivered to {authEmail || profile.email} via{' '}
                      {smtpStatus?.sourceEmail || 'varunvadlakonda1577@gmail.com'}.
                    </span>
                  ) : smtpStatus?.configured ? (
                    <span>
                      SMTP Ready ({smtpStatus.sourceEmail} via {smtpStatus.host}:{smtpStatus.port}).
                      Tap &ldquo;Send Welcome Email&rdquo; anytime to deliver a copy to your inbox.
                    </span>
                  ) : (
                    <span>
                      Inbox email pending server setup: add{' '}
                      <strong>{smtpStatus?.missingFields?.join(', ') || 'SMTP_PASS'}</strong> in
                      server <code>.env</code> for{' '}
                      <strong>{smtpStatus?.sourceEmail || 'varunvadlakonda1577@gmail.com'}</strong>.
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm text-slate-900 truncate">
                    {profile.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{authEmail || profile.email}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Authentication</span>
                  <span className="font-bold text-emerald-700">Active Session</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Email Verification</span>
                  <span
                    className={`font-bold ${
                      emailVerified ? 'text-emerald-700' : 'text-amber-600'
                    }`}
                  >
                    {emailVerified ? 'Verified (Cloud Sync Active)' : 'Pending Verification'}
                  </span>
                </div>
              </div>

            {!emailVerified && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 space-y-2.5 text-xs text-amber-950">
                <p className="leading-relaxed">
                  Verify your email address using the link sent to your inbox to enable real-time
                  Firestore cloud backup across devices.
                </p>
                <div className="flex flex-wrap gap-2">
                  {onResendVerification && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={async () => {
                        setIsBusy(true);
                        setErrorMsg(null);
                        try {
                          await onResendVerification();
                          setStatusMsg('Verification email resent.');
                        } catch (err) {
                          setErrorMsg(mapFirebaseAuthError(err));
                        } finally {
                          setIsBusy(false);
                        }
                      }}
                      className="min-h-[38px] px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Resend Verification
                    </button>
                  )}
                  {onRefreshVerification && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={async () => {
                        setIsBusy(true);
                        setErrorMsg(null);
                        try {
                          const ok = await onRefreshVerification();
                          setStatusMsg(
                            ok
                              ? 'Email verified! Cloud sync is now active.'
                              : 'Email is not verified yet. Please click the link in your inbox first.'
                          );
                        } finally {
                          setIsBusy(false);
                        }
                      }}
                      className="min-h-[38px] px-3 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>I&apos;ve Verified</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                Open My Profile
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  setIsBusy(true);
                  try {
                    await onSignOut();
                    setStatusMsg('Signed out safely.');
                  } finally {
                    setIsBusy(false);
                  }
                }}
                className="min-h-[44px] rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-slate-200 p-4 space-y-4 shadow-xs">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                  setStatusMsg(null);
                }}
                className={`min-h-[38px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                  setStatusMsg(null);
                }}
                className={`min-h-[38px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('recover');
                  setErrorMsg(null);
                  setStatusMsg(null);
                }}
                className={`min-h-[38px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'recover'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Recover
              </button>
            </div>

            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="auth-login-email" className="text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full min-h-[44px] pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="auth-login-pass" className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('recover')}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-login-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full min-h-[44px] pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isBusy ? 'Signing In...' : 'Sign In with Email'}</span>
                </button>
              </form>
            )}

            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="auth-signup-name" className="text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-signup-name"
                      type="text"
                      value={name}
                      maxLength={80}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Alex Johnson"
                      required
                      className="w-full min-h-[44px] pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="auth-signup-email" className="text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-signup-email"
                      type="email"
                      value={email}
                      maxLength={160}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full min-h-[44px] pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="auth-signup-pass" className="text-xs font-semibold text-slate-700">
                    Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-signup-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      minLength={6}
                      className="w-full min-h-[44px] pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="auth-signup-confirm"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-signup-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      minLength={6}
                      className="w-full min-h-[44px] pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  First-time registration automatically dispatches a welcome email introducing
                  NutriScientia via server SMTP.
                </p>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isBusy ? 'Creating Account...' : 'Create NutriScientia Account'}</span>
                </button>
              </form>
            )}

            {activeTab === 'recover' && (
              <form onSubmit={handleRecoverSubmit} className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter the email address associated with your NutriScientia account and we will send
                  you a secure password reset link.
                </p>

                <div className="space-y-1">
                  <label htmlFor="auth-recover-email" className="text-xs font-semibold text-slate-700">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-recover-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full min-h-[44px] pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full min-h-[46px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isBusy ? 'Sending Link...' : 'Send Password Recovery Email'}</span>
                </button>
              </form>
            )}

            {/* Divider & Google Sign-In */}
            <div className="relative py-1 flex items-center">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or continue with
              </span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <button
              type="button"
              disabled={isBusy}
              onClick={handleGoogleClick}
              className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
