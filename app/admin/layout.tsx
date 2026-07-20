'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tags, ListTree, Newspaper, Building2, LogOut, Settings, User } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

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
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'var(--font-sans), sans-serif' }}>
        {/* Sidebar Moderna */}
        <aside style={{ 
          width: '280px', 
          backgroundColor: '#ffffff', 
          borderRight: '1px solid #eaeaea', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
          position: 'sticky',
          top: 0,
          height: '100vh'
        }}>
          <div style={{ padding: '30px 24px', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ 
              color: 'var(--primary-color, #ff6b6b)', 
              fontSize: '1.5rem', 
              fontWeight: 800,
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ width: 12, height: 12, backgroundColor: 'var(--primary-color, #ff6b6b)', borderRadius: '50%' }}></div>
              Guia Admin
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px', marginLeft: '22px' }}>Painel de Gerenciamento</p>
          </div>
          
          <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  href={item.path} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    backgroundColor: isActive ? 'rgba(255, 107, 107, 0.08)' : 'transparent',
                    color: isActive ? 'var(--primary-color, #ff6b6b)' : '#555',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if(!isActive) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.color = '#333';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if(!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#555';
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ padding: '24px 16px', borderTop: '1px solid #f0f0f0' }}>
            <Link 
              href="/" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px', 
                color: '#666',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={18} />
              Voltar ao Site
            </Link>
            
            <button
              onClick={handleLogout}
              style={{ 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px', 
                color: '#ef4444',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={18} />
              Sair / Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
