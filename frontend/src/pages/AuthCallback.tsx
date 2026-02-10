import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import type { VetProfile } from '@/types/api';

const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasSupabase) {
      navigate('/login');
      return;
    }

    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          navigate('/login?error=auth_failed');
          return;
        }

        api.setToken(session.access_token);
        const vet = await api.getProfile() as VetProfile;

        if (!vet.profileCompleted) {
          navigate('/onboarding/profile');
          return;
        }
        if (vet.status === 'PENDING_APPROVAL') {
          navigate('/onboarding/pending');
          return;
        }
        if (vet.status === 'REJECTED') {
          navigate('/account/rejected');
          return;
        }
        if (vet.status === 'SUSPENDED') {
          navigate('/account/suspended');
          return;
        }

        const redirect = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
        navigate(redirect, { replace: true });
      } catch (err) {
        const params = new URLSearchParams({ error: 'something_went_wrong' });
        if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string') {
          params.set('message', (err as { message: string }).message);
        }
        navigate(`/login?${params.toString()}`);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full" />
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
