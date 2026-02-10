import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

const errorMessages: Record<string, string> = {
  auth_failed: 'Sign-in was cancelled or the session could not be established. Please try again.',
  something_went_wrong: 'Google sign-in succeeded but we could not complete setup. See below for details.',
};

export default function LoginPage() {
  const { signIn, isAuthenticated, isApproved } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  useEffect(() => {
    if (!hasSupabase && isAuthenticated && isApproved) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect, { replace: true });
    }
  }, [hasSupabase, isAuthenticated, isApproved, navigate, searchParams]);

  const handleSignIn = async () => {
    await signIn();
    if (!hasSupabase) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent via-background to-primary-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">VR</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to VetReg</h1>
          <p className="text-muted-foreground mb-8">Manage your veterinary practice efficiently</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-left">
              <p className="text-sm font-medium text-destructive">
                {errorMessages[error] ?? 'Something went wrong.'}
              </p>
              {message && (
                <p className="text-xs text-muted-foreground mt-2 break-all">{message}</p>
              )}
              {error === 'something_went_wrong' && (
                <ul className="text-xs text-muted-foreground mt-3 list-disc list-inside space-y-1">
                  <li>Ensure the backend is running (e.g. <code className="bg-muted px-1 rounded">npm run start:dev</code> in backend).</li>
                  <li>In <code className="bg-muted px-1 rounded">backend/.env</code>, set <code className="bg-muted px-1 rounded">FRONTEND_URL</code> to your app origin (e.g. <code className="bg-muted px-1 rounded">http://localhost:8080</code>).</li>
                  <li>Confirm <code className="bg-muted px-1 rounded">SUPABASE_JWT_SECRET</code> in backend matches the JWT secret in Supabase (Project → Settings → API).</li>
                </ul>
              )}
            </div>
          )}

          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-card border-2 border-border rounded-xl font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
