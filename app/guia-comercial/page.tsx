'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { empresasMock, categoriasMock, Empresa } from '../../lib/data';
import CompanyCard from '../../components/CompanyCard/CompanyCard';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function GuiaComercial() {
  const searchParams = useSearchParams();
  const categoriaSlug = searchParams.get('categoria');
  const tipoFiltro = searchParams.get('tipo'); // 'empresas' ou 'entidades'
  
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        const { data, error } = await supabase.from('empresas').select('*');
        if (error) throw error;
        setEmpresas([...empresasMock, ...(data || [])]);
      } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        setEmpresas(empresasMock);
      }
    }
    carregarEmpresas();
  }, []);

  // Filtrar empresas
  const empresasFiltradas = empresas.filter(emp => {
    let match = true;
    if (busca) {
      match = match && emp.nome.toLowerCase().includes(busca.toLowerCase());
    }
    if (categoriaSlug) {
      // Comparar slug ou nome. 'categoriaSlug' vem da url
      match = match && emp.categoria.toLowerCase().replace(/[^a-z0-9]+/g, '-') === categoriaSlug;
    }
    if (tipoFiltro) {
      // Mock original não tem "tipo", mas podemos inferir ou adaptar.
      // O tipo salvo no localStorage é "Empresa" ou "Entidade"
      const empTipo = emp.tipo ? emp.tipo.toLowerCase() : 'empresa'; // mock fallback para empresa
      if (tipoFiltro === 'entidades') {
        match = match && empTipo === 'entidade';
      } else if (tipoFiltro === 'empresas') {
        match = match && empTipo === 'empresa';
      }
    }
    return match;
  });

  return (
    <main>
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--bg-light)', padding: '60px 20px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
            {tipoFiltro === 'entidades' ? 'Guia de Entidades' : tipoFiltro === 'empresas' ? 'Guia de Empresas' : 'Guia Comercial'}
          </h1>
          <p style={{ color: '#ccc', marginBottom: '30px' }}>Encontre os melhores serviços, comércios e entidades da cidade.</p>
          
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome da empresa, serviço ou entidade..." 
              style={{ flex: 1, padding: '15px', border: 'none', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '40px 0' }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* Sidebar de Filtros */}
          <aside style={{ width: '250px', flexShrink: 0, backgroundColor: 'var(--bg-light)', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Categorias</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <Link href={`/guia-comercial`} style={{ color: !categoriaSlug ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: !categoriaSlug ? 'bold' : 'normal' }}>
                  Todas
                </Link>
              </li>
              {categoriasMock.map(cat => (
                <li key={cat.id} style={{ marginBottom: '10px' }}>
                  <Link href={`/guia-comercial?categoria=${cat.slug}`} style={{ color: categoriaSlug === cat.slug ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: categoriaSlug === cat.slug ? 'bold' : 'normal' }}>
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
              <h2>Resultados ({empresasFiltradas.length})</h2>
              <select style={{ padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid #ccc' }}>
                <option>Relevância</option>
                <option>Melhor Avaliação</option>
                <option>Mais Recentes</option>
              </select>
            </div>
            
            {empresasFiltradas.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {empresasFiltradas.map((empresa) => (
                  <CompanyCard key={empresa.id} empresa={empresa as Empresa} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <p>Nenhuma empresa ou entidade encontrada para os filtros selecionados.</p>
              </div>
            )}
          </div>
          
        </div>
      </section>
    </main>
  );
}
