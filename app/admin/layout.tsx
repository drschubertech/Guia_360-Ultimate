'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Tags, ListTree, Newspaper, LogOut, Menu, X } from 'lucide-react';
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
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Categorias', path: '/admin/categorias', icon: <Tags size={20} /> },
    { label: 'Subcategorias', path: '/admin/subcategorias', icon: <ListTree size={20} /> },
    { label: 'Notícias', path: '/admin/noticias', icon: <Newspaper size={20} /> },
  ];

  return (
    <AdminGuard>
      <div className="adm-layout-container">
        <style>{`
          /* ---- Estrutura Geral do Layout ---- */
          .adm-layout-container {
            display: flex;
            min-height: 100vh;
            background-color: var(--bg-offwhite);
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
            background-color: var(--bg-light);
            border-bottom: 1px solid var(--border-color);
            padding: 0 20px;
            align-items: center;
            justify-content: space-between;
            box-shadow: var(--shadow-sm);
          }

          .adm-mobile-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.25rem;
            font-weight: 800;
            font-family: var(--font-outfit), sans-serif;
            color: var(--primary-color);
            text-decoration: none;
          }

          .adm-mobile-logo-dot {
            width: 10px;
            height: 10px;
            background-color: var(--primary-color);
            border-radius: 99px;
          }

          .adm-hamburger-btn {
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: var(--radius-sm);
            transition: background-color 0.15s ease;
          }

          .adm-hamburger-btn:hover {
            background-color: var(--bg-offwhite);
          }

          .adm-hamburger-btn:focus-visible {
            outline: 2px solid var(--primary-color);
          }

          /* ---- Sidebar Drawer ---- */
          .adm-sidebar {
            width: 280px;
            background-color: var(--bg-light);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            box-shadow: 2px 0 16px rgba(0, 0, 0, 0.02);
            position: sticky;
            top: 0;
            height: 100vh;
            flex-shrink: 0;
            z-index: 1000;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .adm-sidebar-header {
            padding: 28px 24px 24px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .adm-sidebar-brand {
            color: var(--primary-color);
            font-size: 1.4rem;
            font-weight: 800;
            font-family: var(--font-outfit), sans-serif;
            letter-spacing: -0.02em;
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0;
          }

          .adm-sidebar-brand-dot {
            width: 12px;
            height: 12px;
            background-color: var(--primary-color);
            border-radius: 50%;
          }

          .adm-sidebar-sub {
            font-size: 0.8rem;
            color: var(--text-tertiary);
            margin-top: 4px;
            margin-left: 22px;
          }

          .adm-sidebar-close {
            display: none;
            background: none;
            border: none;
            color: var(--text-tertiary);
            cursor: pointer;
            padding: 6px;
            border-radius: var(--radius-sm);
            transition: all 0.15s ease;
          }

          .adm-sidebar-close:hover {
            color: var(--text-primary);
            background-color: var(--bg-offwhite);
          }

          /* ---- Navegação Interna ---- */
          .adm-nav {
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
            overflow-y: auto;
          }

          .adm-nav-link {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 16px;
            border-radius: var(--radius-sm);
            color: var(--text-secondary);
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.2s ease;
            text-decoration: none;
          }

          .adm-nav-link:hover {
            background-color: var(--bg-offwhite);
            color: var(--text-primary);
          }

          .adm-nav-link.active {
            background-color: var(--primary-light);
            color: var(--primary-color);
            font-weight: 700;
          }

          .adm-nav-link:focus-visible {
            outline: 2px solid var(--primary-color);
          }

          /* ---- Rodapé da Sidebar ---- */
          .adm-sidebar-footer {
            padding: 20px 16px;
            border-top: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .adm-footer-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 11px 16px;
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.92rem;
            border-radius: var(--radius-sm);
            transition: all 0.15s ease;
          }

          .adm-footer-link:hover {
            background-color: var(--bg-offwhite);
            color: var(--text-primary);
          }

          .adm-logout-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 11px 16px;
            color: var(--danger-color);
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.92rem;
            font-family: inherit;
            border-radius: var(--radius-sm);
            transition: all 0.15s ease;
            text-align: left;
          }

          .adm-logout-btn:hover {
            background-color: var(--danger-light);
          }

          .adm-logout-btn:focus-visible {
            outline: 2px solid var(--danger-color);
          }

          /* ---- Main Content ---- */
          .adm-main-content {
            flex: 1;
            padding: 32px 40px;
            overflow-y: auto;
            min-width: 0; /* Previne estouro horizontal de tabelas */
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
              background-color: rgba(17, 24, 39, 0.5);
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
            <div className="adm-mobile-logo-dot" />
            Guia Admin
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
                Guia Admin
              </h2>
              <p className="adm-sidebar-sub">Painel de Gerenciamento</p>
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
            <Link href="/" className="adm-footer-link" onClick={() => setIsMobileOpen(false)}>
              <LogOut size={18} />
              Voltar ao Site
            </Link>

            <button onClick={handleLogout} className="adm-logout-btn">
              <LogOut size={18} />
              Sair / Logout
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
