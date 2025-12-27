import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/reset-password');
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
}
