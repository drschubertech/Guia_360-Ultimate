import { empresasMock, categoriasMock } from '../../lib/data';
import CompanyCard from '../../components/CompanyCard/CompanyCard';
import Link from 'next/link';

export default function GuiaComercial() {
  return (
    <main>
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--bg-light)', padding: '60px 20px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Guia Comercial</h1>
          <p style={{ color: '#ccc', marginBottom: '30px' }}>Encontre os melhores serviços e comércios da cidade.</p>
          
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Digite o nome da empresa ou serviço..." 
              style={{ flex: 1, padding: '15px', border: 'none', borderRadius: 'var(--radius-sm)' }}
            />
            <button className="btn-theme">Buscar</button>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '40px 0' }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* Sidebar de Filtros */}
          <aside style={{ width: '250px', flexShrink: 0, backgroundColor: 'var(--bg-light)', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Categorias</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {categoriasMock.map(cat => (
                <li key={cat.id} style={{ marginBottom: '10px' }}>
                  <Link href={`/empresas?categoria=${cat.slug}`} style={{ color: 'var(--text-secondary)' }}>
                    {cat.nome}
                  </Link>
                </li>
              ))}
            </ul>
            
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />
            
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Filtros</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <input type="checkbox" /> Aberto Agora
            </label>
          </aside>

          {/* Listagem de Empresas */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Empresas Recomendadas</h2>
              <select style={{ padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid #ccc' }}>
                <option>Relevância</option>
                <option>Melhor Avaliação</option>
                <option>Mais Recentes</option>
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {empresasMock.map((empresa) => (
                <CompanyCard key={empresa.id} empresa={empresa} />
              ))}
            </div>
          </div>
          
        </div>
      </section>
    </main>
  );
}
