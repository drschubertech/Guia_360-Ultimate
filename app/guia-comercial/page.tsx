'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Empresa } from '../../lib/types';
import CompanyCard from '../../components/CompanyCard/CompanyCard';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Search, X, Filter, Building2, Store, HeartHandshake, ChevronRight, SlidersHorizontal, Loader2, SearchX, Check } from 'lucide-react';

function GuiaComercialContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoriaSlug = searchParams.get('categoria');
  const tipoFiltro = searchParams.get('tipo'); // 'empresas' ou 'entidades'
  
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [somenteAbertos, setSomenteAbertos] = useState(false);

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        const { data: empData, error: empError } = await supabase.from('empresas').select('*');
        if (empError) throw empError;
        
        const { data: entData, error: entError } = await supabase.from('entidades').select('*');
        if (entError) throw entError;

        const empresasFormatadas = (empData || []).map(e => ({ ...e, tipo: 'Empresa' }));
        const entidadesFormatadas = (entData || []).map(e => ({ ...e, tipo: 'Entidade' }));
        
        setEmpresas([...empresasFormatadas, ...entidadesFormatadas]);

        const { data: catData, error: catError } = await supabase.from('categorias').select('*').order('nome');
        if (!catError && catData && catData.length > 0) setCategorias(catData);
      } catch (error) {
        console.error('Erro ao buscar empresas:', error);
      }
    }
    carregarEmpresas();
  }, []);

  // Filtrar empresas
  const empresasFiltradas = empresas.filter(emp => {
    let match = true;
    if (busca) {
      match = match && (
        emp.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (emp.descricao && emp.descricao.toLowerCase().includes(busca.toLowerCase())) ||
        (emp.categoria && emp.categoria.toLowerCase().includes(busca.toLowerCase()))
      );
    }
    if (categoriaSlug) {
      match = match && emp.categoria.toLowerCase().replace(/[^a-z0-9]+/g, '-') === categoriaSlug;
    }
    if (tipoFiltro) {
      const empTipo = emp.tipo ? emp.tipo.toLowerCase() : 'empresa';
      if (tipoFiltro === 'entidades') {
        match = match && empTipo === 'entidade';
      } else if (tipoFiltro === 'empresas') {
        match = match && empTipo === 'empresa';
      }
    }
    if (somenteAbertos) {
      match = match && emp.status === 'aberto';
    }
    return match;
  });

  const limparFiltros = () => {
    setBusca('');
    setSomenteAbertos(false);
    router.push('/guia-comercial');
  };

  const hasFiltrosAtivos = busca || categoriaSlug || tipoFiltro || somenteAbertos;

  return (
    <main className="guia-page">
      <style>{`
        @keyframes guia-spin { to { transform: rotate(360deg); } }
        @keyframes guia-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .guia-page {
          background-color: var(--bg-offwhite);
          min-height: 100vh;
        }

        /* ── Hero / Search Header ── */
        .guia-hero {
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-offwhite) 100%);
          border-bottom: 1px solid var(--border-color);
          padding: 60px 20px 48px;
          text-align: center;
        }

        .guia-hero-inner {
          max-width: 720px;
          margin: 0 auto;
        }

        .guia-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 99px;
          background-color: var(--bg-light);
          border: 1px solid var(--border-color);
          color: var(--primary-color);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .guia-hero-title {
          font-size: 2.4rem;
          font-weight: 800;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          margin: 0 0 12px;
          line-height: 1.15;
        }

        .guia-hero-subtitle {
          color: var(--text-secondary);
          font-size: 1.05rem;
          margin: 0 0 32px;
        }

        /* ── Search Bar ── */
        .guia-search-bar {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-light);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          padding: 4px;
        }

        .guia-search-bar:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-light), var(--shadow-md);
        }

        .guia-search-icon {
          color: var(--text-tertiary);
          margin-left: 16px;
          flex-shrink: 0;
          transition: color 0.2s ease;
        }

        .guia-search-bar:focus-within .guia-search-icon {
          color: var(--primary-color);
        }

        .guia-search-input {
          flex: 1;
          padding: 12px 14px;
          border: none;
          background: transparent;
          font-size: 1rem;
          font-family: inherit;
          color: var(--text-primary);
          outline: none;
        }

        .guia-search-input::placeholder {
          color: var(--text-tertiary);
        }

        .guia-search-clear {
          background: none;
          border: none;
          color: var(--text-tertiary);
          padding: 8px;
          margin-right: 4px;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease, background-color 0.15s ease;
        }

        .guia-search-clear:hover {
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
        }

        /* ── Quick Tabs ── */
        .guia-type-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .guia-type-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 99px;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          color: var(--text-secondary);
          background-color: var(--bg-light);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .guia-type-tab:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .guia-type-tab.active {
          background-color: var(--primary-color);
          color: #fff;
          border-color: var(--primary-color);
          box-shadow: var(--shadow-sm);
        }

        /* ── Section Container ── */
        .guia-content-section {
          padding: 40px 20px 80px;
        }

        .guia-layout {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Sidebar ── */
        .guia-sidebar {
          width: 260px;
          flex-shrink: 0;
          background-color: var(--bg-light);
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .guia-sidebar-title {
          font-size: 0.95rem;
          font-weight: 700;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .guia-sidebar-title-icon {
          color: var(--primary-color);
        }

        .guia-cat-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .guia-cat-item {
          margin: 0;
        }

        .guia-cat-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .guia-cat-link:hover {
          background-color: var(--bg-offwhite);
          color: var(--primary-color);
        }

        .guia-cat-link.active {
          background-color: var(--primary-light);
          color: var(--primary-color);
          font-weight: 700;
        }

        .guia-cat-arrow {
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }

        .guia-cat-link:hover .guia-cat-arrow,
        .guia-cat-link.active .guia-cat-arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        .guia-divider {
          margin: 20px 0;
          border: none;
          border-top: 1px solid var(--border-color);
        }

        .guia-checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
        }

        .guia-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--primary-color);
          cursor: pointer;
        }

        .guia-clear-btn {
          margin-top: 20px;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: 1.5px dashed var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
        }

        .guia-clear-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          background-color: #fef2f2;
        }

        /* ── Main Results Area ── */
        .guia-main {
          flex: 1;
          width: 100%;
          min-width: 0;
        }

        .guia-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .guia-results-title {
          font-family: var(--font-outfit), sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .guia-results-count {
          background-color: var(--primary-light);
          color: var(--primary-color);
          padding: 2px 10px;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .guia-select {
          padding: 9px 14px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-color);
          color: var(--text-primary);
          outline: none;
          background: var(--bg-light);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .guia-select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px var(--primary-light);
        }

        /* ── Grid ── */
        .guia-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          animation: guia-fadein 0.3s ease-out;
        }

        /* ── Empty State ── */
        .guia-empty-state {
          background-color: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 60px 24px;
          text-align: center;
          box-shadow: var(--shadow-sm);
          animation: guia-fadein 0.3s ease-out;
        }

        .guia-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: var(--bg-offwhite);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          border: 1px solid var(--border-color);
        }

        .guia-empty-title {
          font-size: 1.2rem;
          font-weight: 700;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0 0 8px;
        }

        .guia-empty-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0 0 20px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .guia-empty-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background-color: var(--primary-color);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.875rem;
          font-family: inherit;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .guia-empty-reset-btn:hover {
          background-color: var(--primary-color-hover);
          transform: translateY(-1px);
        }

        /* ── Responsividade ── */
        @media (max-width: 900px) {
          .guia-layout {
            flex-direction: column;
            gap: 24px;
          }
          .guia-sidebar {
            width: 100%;
          }
          .guia-hero-title {
            font-size: 1.8rem;
          }
          .guia-hero {
            padding: 40px 16px 36px;
          }
        }

        @media (max-width: 600px) {
          .guia-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .guia-select {
            width: 100%;
          }
          .guia-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Hero Header */}
      <section className="guia-hero">
        <div className="guia-hero-inner">
          <div className="guia-hero-badge">
            <Building2 size={14} /> Guia Local
          </div>
          <h1 className="guia-hero-title">
            {tipoFiltro === 'entidades' ? 'Guia de Entidades' : tipoFiltro === 'empresas' ? 'Guia de Empresas' : 'Guia Comercial'}
          </h1>
          <p className="guia-hero-subtitle">
            Encontre os melhores serviços, comércios e entidades da cidade.
          </p>
          
          {/* Search Bar */}
          <div className="guia-search-bar">
            <Search size={20} className="guia-search-icon" />
            <input 
              type="text" 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome da empresa, serviço ou entidade..." 
              className="guia-search-input"
            />
            {busca && (
              <button 
                type="button" 
                onClick={() => setBusca('')} 
                className="guia-search-clear"
                title="Limpar busca"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Quick Type Filter Tabs */}
          <div className="guia-type-tabs">
            <Link 
              href="/guia-comercial"
              className={`guia-type-tab ${!tipoFiltro ? 'active' : ''}`}
            >
              <Building2 size={15} /> Todos os Locais
            </Link>
            <Link 
              href="/guia-comercial?tipo=empresas"
              className={`guia-type-tab ${tipoFiltro === 'empresas' ? 'active' : ''}`}
            >
              <Store size={15} /> Empresas
            </Link>
            <Link 
              href="/guia-comercial?tipo=entidades"
              className={`guia-type-tab ${tipoFiltro === 'entidades' ? 'active' : ''}`}
            >
              <HeartHandshake size={15} /> Entidades
            </Link>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="guia-content-section">
        <div className="guia-layout">
          
          {/* Sidebar de Filtros */}
          <aside className="guia-sidebar">
            <h3 className="guia-sidebar-title">
              <Filter size={16} className="guia-sidebar-title-icon" /> Categorias
            </h3>
            <ul className="guia-cat-list">
              <li className="guia-cat-item">
                <Link 
                  href="/guia-comercial" 
                  className={`guia-cat-link ${!categoriaSlug ? 'active' : ''}`}
                >
                  <span>Todas as Categorias</span>
                  <ChevronRight size={14} className="guia-cat-arrow" />
                </Link>
              </li>
              {categorias.map(cat => (
                <li key={cat.id} className="guia-cat-item">
                  <Link 
                    href={`/guia-comercial?categoria=${cat.slug}${tipoFiltro ? `&tipo=${tipoFiltro}` : ''}`} 
                    className={`guia-cat-link ${categoriaSlug === cat.slug ? 'active' : ''}`}
                  >
                    <span>{cat.nome}</span>
                    <ChevronRight size={14} className="guia-cat-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
            
            <hr className="guia-divider" />
            
            <h3 className="guia-sidebar-title">
              <SlidersHorizontal size={16} className="guia-sidebar-title-icon" /> Filtros
            </h3>
            <label className="guia-checkbox-label">
              <input 
                type="checkbox" 
                checked={somenteAbertos}
                onChange={(e) => setSomenteAbertos(e.target.checked)}
                className="guia-checkbox"
              /> 
              Aberto Agora
            </label>

            {hasFiltrosAtivos && (
              <button 
                type="button"
                onClick={limparFiltros}
                className="guia-clear-btn"
              >
                <X size={14} /> Limpar Filtros
              </button>
            )}
          </aside>

          {/* Listagem de Empresas */}
          <div className="guia-main">
            <div className="guia-header">
              <h2 className="guia-results-title">
                Resultados
                <span className="guia-results-count">{empresasFiltradas.length}</span>
              </h2>
              <select className="guia-select">
                <option>Relevância</option>
                <option>Melhor Avaliação</option>
                <option>Mais Recentes</option>
              </select>
            </div>
            
            {empresasFiltradas.length > 0 ? (
              <div className="guia-cards-grid">
                {empresasFiltradas.map((empresa) => (
                  <CompanyCard key={empresa.id} empresa={empresa as Empresa} />
                ))}
              </div>
            ) : (
              <div className="guia-empty-state">
                <div className="guia-empty-icon">
                  <SearchX size={26} />
                </div>
                <h3 className="guia-empty-title">Nenhum resultado encontrado</h3>
                <p className="guia-empty-desc">
                  Não encontramos empresas ou entidades que correspondam à sua busca ou filtros selecionados.
                </p>
                {hasFiltrosAtivos && (
                  <button 
                    type="button" 
                    onClick={limparFiltros} 
                    className="guia-empty-reset-btn"
                  >
                    <X size={16} /> Limpar todos os filtros
                  </button>
                )}
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
    <>
      <style>{`@keyframes guia-spin { to { transform: rotate(360deg); } }`}</style>
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-offwhite)' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 size={32} style={{ animation: 'guia-spin 0.8s linear infinite', display: 'block', margin: '0 auto 12px' }} />
            <span style={{ fontSize: '0.95rem' }}>Carregando guia comercial...</span>
          </div>
        </div>
      }>
        <GuiaComercialContent />
      </Suspense>
    </>
  );
}
