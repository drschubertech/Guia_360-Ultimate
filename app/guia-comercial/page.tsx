'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { empresasMock, categoriasMock, Empresa } from '../../lib/data';
import CompanyCard from '../../components/CompanyCard/CompanyCard';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

function GuiaComercialContent() {
  const searchParams = useSearchParams();
  const categoriaSlug = searchParams.get('categoria');
  const tipoFiltro = searchParams.get('tipo'); // 'empresas' ou 'entidades'
  
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        const { data: empData, error: empError } = await supabase.from('empresas').select('*');
        if (empError) throw empError;
        
        const { data: entData, error: entError } = await supabase.from('entidades').select('*');
        if (entError) throw entError;

        const empresasFormatadas = (empData || []).map(e => ({ ...e, tipo: 'Empresa' }));
        const entidadesFormatadas = (entData || []).map(e => ({ ...e, tipo: 'Entidade' }));
        
        setEmpresas([...empresasMock, ...empresasFormatadas, ...entidadesFormatadas]);
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
      <style>{`
        .guia-layout {
          display: flex;
          gap: 30px;
          align-items: flex-start;
        }
        .guia-sidebar {
          width: 250px;
          flex-shrink: 0;
          background-color: var(--bg-light);
          padding: 20px;
          border-radius: var(--radius-md);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .guia-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .guia-layout {
            flex-direction: column;
          }
          .guia-sidebar {
            width: 100%;
          }
          .guia-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .guia-header select {
            width: 100%;
          }
        }
      `}</style>
      <section style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-offwhite) 100%)', color: 'var(--text-primary)', padding: '80px 20px 60px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 800, letterSpacing: '-0.03em' }}>
            {tipoFiltro === 'entidades' ? 'Guia de Entidades' : tipoFiltro === 'empresas' ? 'Guia de Empresas' : 'Guia Comercial'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>Encontre os melhores serviços, comércios e entidades da cidade.</p>
          
          <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', gap: '12px', background: 'var(--bg-light)', padding: '8px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
            <input 
              type="text" 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome da empresa, serviço ou entidade..." 
              style={{ flex: 1, padding: '12px 20px', border: 'none', background: 'transparent', fontSize: '1.1rem', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '40px 0' }}>
        <div className="guia-layout">
          
          {/* Sidebar de Filtros */}
          <aside className="guia-sidebar">
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
          <div style={{ flex: 1, width: '100%' }}>
            <div className="guia-header">
              <h2 style={{ fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 700 }}>Resultados ({empresasFiltradas.length})</h2>
              <select style={{ padding: '10px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-light)' }}>
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

export default function GuiaComercial() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <GuiaComercialContent />
    </Suspense>
  );
}
