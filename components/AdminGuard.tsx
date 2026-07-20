'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Buscar o perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('role_id')
        .eq('id', session.user.id)
        .single();

      if (!profile?.role_id) {
        router.push('/');
        return;
      }

      // Verificar se a role é 'admin'
      const { data: role } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', profile.role_id)
        .single();

      if (role?.name === 'admin') {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f8' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <Loader2 size={40} color="var(--primary-color)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#666', fontWeight: 500 }}>Verificando permissões...</p>
        </div>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .animate-spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
