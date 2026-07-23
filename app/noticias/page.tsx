'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import PostCard from '@/components/PostCard/PostCard';
import { Search, Loader2, Newspaper } from 'lucide-react';

export default function NoticiasListingPage() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');

  useEffect(() => {
    async function carregarNoticias() {
      setLoading(true);
      try {
        let { data, error } = await supabase
          .from('noticias')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          const resSimple = await supabase
            .from('noticias')
            .select('*')
            .order('created_at', { ascending: false });
          if (!resSimple.error && resSimple.data && resSimple.data.length > 0) {
            data = resSimple.data;
            error = null;
          }
        }

        if (data && data.length > 0) {
          setNoticias(data);
        }
      } catch (err) {
        console.error('Erro ao buscar notícias:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarNoticias();
  }, []);

  // Categorias únicas extraídas das notícias
  const categorias = ['Todas', ...Array.from(new Set(noticias.map(n => n.categoria).filter(Boolean)))];

  // Filtragem por busca e categoria
  const noticiasFiltradas = noticias.filter(item => {
    const titulo = item.titulo || item.title || '';
    const resumo = item.resumo || item.content || '';
    const matchesBusca = titulo.toLowerCase().includes(busca.toLowerCase()) || resumo.toLowerCase().includes(busca.toLowerCase());
    const matchesCategoria = categoriaAtiva === 'Todas' || item.categoria === categoriaAtiva;
    return matchesBusca && matchesCategoria;
  });

  return (
    <main className="noticias-page">
      <style>{`
        .noticias-page {
          background-color: var(--bg-offwhite);
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .noticias-hero {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #fff;
          padding: 60px 0;
          margin-bottom: 40px;
        }

        .noticias-hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 12px;
          color: #fff;
        }

        .noticias-hero-subtitle {
          color: #94a3b8;
          font-size: 1.1rem;
          max-width: 600px;
          margin-bottom: 28px;
        }

        .noticias-search-bar {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: var(--radius-pill);
          padding: 6px 8px 6px 20px;
          max-width: 580px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .noticias-search-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 1rem;
          color: var(--text-primary);
          background: transparent;
        }

        .noticias-categories {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 36px;
        }

        .noticias-cat-btn {
          background: #fff;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 18px;
          border-radius: var(--radius-pill);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .noticias-cat-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .noticias-cat-btn.active {
          background-color: var(--primary-color);
          color: #fff;
          border-color: var(--primary-color);
        }

        .noticias-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 28px;
        }
      `}</style>

      {/* Hero Header */}
      <section className="noticias-hero">
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', color: '#fcc419', marginBottom: '16px', fontWeight: 600 }}>
            <Newspaper size={16} /> Portal de Notícias Local
          </div>
          <h1 className="noticias-hero-title">Fique por dentro da sua cidade</h1>
          <p className="noticias-hero-subtitle">
            Notícias, eventos, obras de infraestrutura e novidades da comunidade em tempo real.
          </p>

          <div className="noticias-search-bar">
            <Search size={20} color="#94a3b8" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Buscar notícias ou eventos..."
              className="noticias-search-input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content Container */}
      <section className="container">
        {/* Categories */}
        <div className="noticias-categories">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`noticias-cat-btn ${categoriaAtiva === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary-color)' }} />
            <p>Carregando notícias…</p>
          </div>
        ) : noticiasFiltradas.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Nenhuma notícia encontrada</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Tente buscar por outro termo ou selecione outra categoria.</p>
          </div>
        ) : (
          <div className="noticias-grid">
            {noticiasFiltradas.map(noticia => (
              <PostCard key={noticia.id || noticia.slug} noticia={noticia} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
