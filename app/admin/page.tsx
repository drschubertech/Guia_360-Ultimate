export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Dashboard Administrativo</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Bem-vindo ao painel de controle do Guia 360º.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '10px' }}>Gerenciar Categorias</h3>
          <p style={{ color: '#888', marginBottom: '15px' }}>Adicione ou remova as categorias principais que os usuários podem selecionar ao cadastrar suas empresas e entidades.</p>
          <a href="/admin/categorias" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Acessar Categorias &rarr;</a>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '10px' }}>Gerenciar Subcategorias</h3>
          <p style={{ color: '#888', marginBottom: '15px' }}>Adicione subcategorias específicas atreladas às categorias principais para afinar a busca dos usuários.</p>
          <a href="/admin/subcategorias" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Acessar Subcategorias &rarr;</a>
        </div>
      </div>
    </div>
  );
}
