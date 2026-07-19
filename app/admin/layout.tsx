import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #e0e0e0', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '30px', color: 'var(--primary-color)' }}>Guia Admin</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link href="/admin" style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
            Dashboard
          </Link>
          <Link href="/admin/categorias" style={{ padding: '10px', borderRadius: '5px', color: '#555' }}>
            Categorias
          </Link>
          <Link href="/admin/subcategorias" style={{ padding: '10px', borderRadius: '5px', color: '#555' }}>
            Subcategorias
          </Link>
          <Link href="/admin/noticias" style={{ padding: '10px', borderRadius: '5px', color: '#555' }}>
            Notícias
          </Link>
          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
          <Link href="/" style={{ padding: '10px', color: '#999' }}>
            &larr; Voltar ao Site
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        {children}
      </main>
    </div>
  );
}
