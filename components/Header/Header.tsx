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

  const checkAdmin = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (!error && data === true) setIsAdmin(true);
      else setIsAdmin(false);
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { ...session.user } : null);
      if (session?.user) checkAdmin();
      else setIsAdmin(false);
    });

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

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContainer}`}>
          <span>Bem-vindo, selecione sua cidade</span>
          <div>
            <span>Siga-nos nas redes sociais</span>
          </div>
        </div>
      </div>

      <div className={styles.mainHeader}>
        <div className={`container ${styles.mainHeaderContainer}`}>
          <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
            <strong>Guia 360°</strong>
            <span>Ultimate</span>
          </Link>

          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Início</Link>
            <Link href="/guia-comercial" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Guia Comercial</Link>
            <Link href="/noticias" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Notícias</Link>
            <Link href="/contato" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Contato</Link>

            <div className={styles.mobileActions}>
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="btn-theme" onClick={() => setIsMenuOpen(false)}>
                      <Settings size={16} /> Admin
                    </Link>
                  )}
                  <Link href="/perfil" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                    <User size={18} /> {user.email?.split('@')[0] || 'Perfil'}
                  </Link>
                  <button
                    className={styles.navLink}
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setIsMenuOpen(false);
                      router.push('/');
                    }}
                    style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500, padding: '8px 0' }}>
                    <LogOut size={16} /> Sair
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn-theme" onClick={() => setIsMenuOpen(false)}>
                  Entrar / Cadastrar
                </Link>
              )}
            </div>
          </nav>

          <div className={styles.desktopActions}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAdmin && (
                  <Link href="/admin" className="btn-theme" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', padding: '6px 14px' }}>
                    <Settings size={14} /> Admin
                  </Link>
                )}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '8px',
                      border: '1.5px solid #E6E2DA', backgroundColor: '#fff',
                      cursor: 'pointer', color: '#1E293B', fontWeight: 600,
                      fontSize: '0.85rem', fontFamily: 'inherit'
                    }}>
                    <User size={16} />
                    {user.email?.split('@')[0] || 'Perfil'}
                  </button>
                  {isMenuOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                      backgroundColor: '#fff', borderRadius: '8px',
                      border: '1px solid #E6E2DA', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      minWidth: '180px', zIndex: 100, overflow: 'hidden'
                    }}>
                      <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', color: '#1E293B', fontSize: '0.85rem', textDecoration: 'none' }}
                        onClick={() => setIsMenuOpen(false)}>
                        <User size={15} /> Meu Perfil
                      </Link>
                      <button onClick={async () => {
                        await supabase.auth.signOut();
                        setIsMenuOpen(false);
                        router.push('/');
                      }} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', color: '#EF4444', fontSize: '0.85rem',
                        border: 'none', background: 'none', width: '100%',
                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
                      }}>
                        <LogOut size={15} /> Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-theme">Entrar / Cadastrar</Link>
            )}
          </div>

          <button className={styles.menuButton} onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
