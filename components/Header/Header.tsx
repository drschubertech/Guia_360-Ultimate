'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import styles from './Header.module.css';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Não renderiza o Header público nas rotas administrativas
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const checkAdmin = async (userId: string) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', userId).single();
      if (profile?.role_id) {
        const { data: role } = await supabase.from('user_roles').select('name').eq('id', profile.role_id).single();
        if (role?.name === 'admin') setIsAdmin(true);
        else setIsAdmin(false);
      }
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Busca a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
    });

    // Escuta mudanças na autenticação (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { ...session.user } : null);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });

    // Escuta atualizações de perfil manuais
    const handleUserUpdated = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ? { ...session.user } : null);
    };
    window.addEventListener('userUpdated', handleUserUpdated);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      {/* Top Bar (Opcional - Conforme Diretrizes) */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContainer}`}>
          <span>Bem-vindo, selecione sua cidade</span>
          <div>
            <span>Siga-nos nas redes sociais</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={styles.mainHeader}>
        <div className={`container ${styles.mainHeaderContainer}`}>
          <Link href="/" className={styles.logo}>
            <img src="/logo.png" alt="Guia 360º Logo" width={40} height={40} style={{ objectFit: 'contain', borderRadius: '8px' }} />
            <span>GUIA LOCAL 360º</span>
          </Link>

          <button className={styles.menuButton} onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Início</Link>
            <Link href="/guia-comercial" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Guia Comercial</Link>
            <Link href="/guia-comercial?tipo=empresas" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Empresas</Link>
            <Link href="/guia-comercial?tipo=entidades" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Entidades</Link>
            
            <div className={styles.mobileActions}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                  {pathname !== '/perfil' && (
                    <Link href="/perfil" className={styles.loginBtn} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px' }}>
                      <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', overflow: 'hidden' }}>
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.user_metadata?.nome?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || <User size={14} />
                        )}
                      </div>
                      {user.user_metadata?.nome ? user.user_metadata.nome.split(' ')[0] : 'Meu Perfil'}
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <Link href="/admin" className={styles.loginBtn} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px' }}>
                      <Settings size={18} /> Painel Admin
                    </Link>
                  )}
                  
                  <button onClick={async () => { await supabase.auth.signOut(); setIsMenuOpen(false); router.push('/'); }} className={styles.loginBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', color: '#ef4444', border: 'none', background: 'transparent' }}>
                    <LogOut size={18} /> Sair
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className={styles.loginBtn} onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                  <Link href="/cadastro-empresa" className="btn-theme btn-pill" onClick={() => setIsMenuOpen(false)}>
                    ANUNCIAR GRÁTIS
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div className={styles.desktopActions}>
            {user ? (
              <Link href="/perfil" className={styles.loginBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', backgroundColor: 'var(--bg-light)', borderRadius: 'var(--radius-pill)', border: '1px solid #eaeaea' }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', overflow: 'hidden' }}>
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.user_metadata?.nome?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || <User size={16} />
                  )}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {user.user_metadata?.nome ? user.user_metadata.nome.split(' ')[0] : user.email?.split('@')[0]}
                </span>
              </Link>
            ) : (
              <>
                <Link href="/login" className={styles.loginBtn}>Entrar</Link>
                <Link href="/cadastro-empresa" className="btn-theme btn-pill">
                  ANUNCIAR GRÁTIS
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
