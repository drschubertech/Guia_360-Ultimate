'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Newspaper, 
  Landmark, 
  Users, 
  Tags, 
  MapPin, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('drschubertech@gmail.com');

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    }
    getUser();
  }, []);

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Previne rolagem do body quando menu mobile está aberto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { label: 'Visão geral', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Empresas', path: '/admin/empresas', icon: <Building2 size={18} /> },
    { label: 'Publicações', path: '/admin/publicacoes', icon: <Newspaper size={18} /> },
    { label: 'Entidades', path: '/admin/entidades', icon: <Landmark size={18} /> },
    { label: 'Usuários', path: '/admin/usuarios', icon: <Users size={18} /> },
    { label: 'Categorias', path: '/admin/categorias', icon: <Tags size={18} /> },
    { label: 'Cidades', path: '/admin/cidades', icon: <MapPin size={18} /> },
  ];

  return (
    <AdminGuard>
      <div className="adm-layout-container">
        <style>{`
          /* ---- Estrutura Geral do Layout ---- */
          .adm-layout-container {
            display: flex;
            min-height: 100vh;
            background-color: #F5F3EB;
            font-family: var(--font-inter), sans-serif;
            color: var(--text-primary);
          }

          /* ---- Topbar Mobile (< 768px) ---- */
          .adm-mobile-header {
            display: none;
            position: sticky;
            top: 0;
            z-index: 100;
            height: 64px;
            background-color: #0D1527;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 0 20px;
            align-items: center;
            justify-content: space-between;
          }

          .adm-mobile-logo {
            display: flex;
            flex-direction: column;
            text-decoration: none;
          }

          .adm-mobile-logo-title {
            font-size: 1.1rem;
            font-weight: 800;
            font-family: var(--font-outfit), sans-serif;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .adm-mobile-logo-sub {
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #94A3B8;
            text-transform: uppercase;
          }

          .adm-hamburger-btn {
            background: none;
            border: none;
            color: #FFFFFF;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: var(--radius-sm);
          }

          /* ---- Sidebar Drawer ---- */
          .adm-sidebar {
            width: 250px;
            background-color: #0D1527;
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 0;
            height: 100vh;
            flex-shrink: 0;
            z-index: 1000;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .adm-sidebar-header {
            padding: 24px 20px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .adm-sidebar-brand {
            color: var(--primary-color, #FF6B4A);
            font-size: 1.2rem;
            font-weight: 800;
            font-family: var(--font-outfit), sans-serif;
            letter-spacing: -0.01em;
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 0;
          }

          .adm-sidebar-brand-dot {
            width: 8px;
            height: 8px;
            background-color: var(--primary-color, #FF6B4A);
            border-radius: 50%;
          }

          .adm-sidebar-sub {
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #94A3B8;
            text-transform: uppercase;
            margin-top: 2px;
          }

          .adm-sidebar-close {
            display: none;
            background: none;
            border: none;
            color: #94A3B8;
            cursor: pointer;
            padding: 6px;
            border-radius: var(--radius-sm);
          }

          /* ---- Navegação Interna ---- */
          .adm-nav {
            padding: 16px 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            overflow-y: auto;
          }

          .adm-nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border-radius: 6px;
            color: #CBD5E1;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.15s ease;
            text-decoration: none;
          }

          .adm-nav-link:hover {
            background-color: rgba(255, 255, 255, 0.06);
            color: #FFFFFF;
          }

          .adm-nav-link.active {
            background-color: #2563EB;
            color: #FFFFFF;
            font-weight: 600;
          }

          /* ---- Rodapé da Sidebar ---- */
          .adm-sidebar-footer {
            padding: 16px 16px 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .adm-user-email {
            font-size: 0.8rem;
            color: #94A3B8;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-left: 2px;
          }

          .adm-logout-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 0;
            color: #CBD5E1;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.88rem;
            font-family: inherit;
            transition: all 0.15s ease;
            text-align: left;
          }

          .adm-logout-btn:hover {
            color: #FFFFFF;
          }

          /* ---- Main Content ---- */
          .adm-main-content {
            flex: 1;
            padding: 32px 40px;
            overflow-y: auto;
            min-width: 0;
          }

          .adm-main-inner {
            max-width: 1200px;
            margin: 0 auto;
          }

          /* ---- Overlay Escuro Mobile ---- */
          .adm-backdrop {
            display: none;
          }

          /* ---- Regras Responsivas (< 768px) ---- */
          @media (max-width: 768px) {
            .adm-layout-container {
              flex-direction: column;
            }

            .adm-mobile-header {
              display: flex;
            }

            .adm-sidebar {
              position: fixed;
              top: 0;
              left: 0;
              height: 100vh;
              z-index: 1000;
              transform: translateX(-100%);
              box-shadow: var(--shadow-lg);
            }

            .adm-sidebar.open {
              transform: translateX(0);
            }

            .adm-sidebar-close {
              display: flex;
            }

            .adm-backdrop {
              display: block;
              position: fixed;
              inset: 0;
              background-color: rgba(15, 23, 42, 0.6);
              backdrop-filter: blur(4px);
              z-index: 999;
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.3s ease;
            }

            .adm-backdrop.open {
              opacity: 1;
              pointer-events: auto;
            }

            .adm-main-content {
              padding: 20px 16px 48px;
            }
          }
        `}</style>

        {/* Header Mobile com Ícone Hambúrguer */}
        <header className="adm-mobile-header">
          <Link href="/admin" className="adm-mobile-logo">
            <div className="adm-mobile-logo-title">
              <div className="adm-sidebar-brand-dot" />
              Guia Local 360°
            </div>
            <div className="adm-mobile-logo-sub">PAINEL ADMINISTRATIVO</div>
          </Link>
          <button
            className="adm-hamburger-btn"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Overlay do Backdrop Mobile */}
        <div
          className={`adm-backdrop ${isMobileOpen ? 'open' : ''}`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Sidebar Navigation */}
        <aside className={`adm-sidebar ${isMobileOpen ? 'open' : ''}`}>
          <div className="adm-sidebar-header">
            <div>
              <h2 className="adm-sidebar-brand">
                <div className="adm-sidebar-brand-dot" />
                Guia Local 360°
              </h2>
              <p className="adm-sidebar-sub">PAINEL ADMINISTRATIVO</p>
            </div>
            <button
              className="adm-sidebar-close"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="adm-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`adm-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="adm-sidebar-footer">
            <div className="adm-user-email">{userEmail}</div>

            <button onClick={handleLogout} className="adm-logout-btn">
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="adm-main-content">
          <div className="adm-main-inner">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}

