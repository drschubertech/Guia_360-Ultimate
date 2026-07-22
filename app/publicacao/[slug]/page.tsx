'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { noticiasMock } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import PostCard from '@/components/PostCard/PostCard';
import { 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  MessageCircle, 
  Loader2,
  Bookmark
} from 'lucide-react';

export default function PublicacaoPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [noticia, setNoticia] = useState<any | null>(null);
  const [noticiasRelacionadas, setNoticiasRelacionadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function carregarNoticia() {
      if (!slug) return;
      setLoading(true);

      try {
        // 1. Tenta buscar na tabela 'noticias' no Supabase
        let { data, error } = await supabase
          .from('noticias')
          .select('*, profiles(full_name)')
          .eq('slug', slug)
          .maybeSingle();

        if (error || !data) {
          const resSimple = await supabase
            .from('noticias')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
          if (resSimple.data) data = resSimple.data;
        }

        // 2. Se não encontrar, tenta buscar por ID caso o slug seja o id
        if (!data) {
          const { data: dataById } = await supabase
            .from('noticias')
            .select('*')
            .eq('id', slug)
            .maybeSingle();
          data = dataById;
        }

        // 3. Se não encontrar na tabela 'noticias', tenta na tabela 'news'
        if (!data) {
          const { data: newsData } = await supabase
            .from('news')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
          data = newsData;
        }

        if (data) {
          setNoticia(data);
        } else {
          // 4. Fallback para os dados mock se não estiver no banco
          const mock = noticiasMock.find(n => n.slug === slug || n.id === slug);
          if (mock) {
            setNoticia(mock);
          } else {
            setNoticia(null);
          }
        }

        // Carregar outras notícias relacionadas
        let outrNoticias: any[] | null = null;
        const resRelJoin = await supabase
          .from('noticias')
          .select('*, profiles(full_name)')
          .neq('slug', slug)
          .limit(3);

        if (!resRelJoin.error && resRelJoin.data) {
          outrNoticias = resRelJoin.data;
        } else {
          const resRelSimple = await supabase
            .from('noticias')
            .select('*')
            .neq('slug', slug)
            .limit(3);
          if (resRelSimple.data) outrNoticias = resRelSimple.data;
        }

        if (outrNoticias && outrNoticias.length > 0) {
          setNoticiasRelacionadas(outrNoticias);
        } else {
          setNoticiasRelacionadas(noticiasMock.filter(n => n.slug !== slug).slice(0, 3));
        }

      } catch (err) {
        console.error('Erro ao carregar publicação:', err);
        const mock = noticiasMock.find(n => n.slug === slug || n.id === slug);
        setNoticia(mock || null);
        setNoticiasRelacionadas(noticiasMock.filter(n => n.slug !== slug).slice(0, 3));
      } finally {
        setLoading(false);
      }
    }

    carregarNoticia();
  }, [slug]);

  const handleCopiarLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const handleCompartilharWhatsApp = () => {
    if (typeof window !== 'undefined' && noticia) {
      const text = encodeURIComponent(`Confira esta notícia: *${noticia.titulo || noticia.title}*\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-offwhite)' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 16px', color: 'var(--primary-color)' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Carregando notícia…</p>
        </div>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div style={{ minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--primary-light)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
          <Bookmark size={40} color="var(--primary-color)" />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Notícia não encontrada</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', marginBottom: '28px', lineHeight: 1.6 }}>
          A publicação que você está procurando pode ter sido removida ou o endereço digitado está incorreto.
        </p>
        <Link href="/" className="btn-theme btn-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={18} /> Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  const titulo = noticia.titulo || noticia.title;
  const conteudo = noticia.conteudo || noticia.content || noticia.resumo;
  const resumo = noticia.resumo;
  const categoria = noticia.categoria || noticia.category || 'Notícia';
  const autor = noticia.profiles?.full_name || noticia.autor || 'Redação Guia 360';
  const dataPost = noticia.data_publicacao || noticia.published_at || noticia.created_at || noticia.data;
  const dataFormatada = dataPost ? new Date(dataPost).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data recente';
  const imagem = noticia.imagem_url || noticia.image_url || noticia.capa || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80';

  // Estimar tempo de leitura (aprox 200 palavras por minuto)
  const totalPalavras = conteudo ? conteudo.split(/\s+/).length : 100;
  const tempoLeitura = Math.max(1, Math.ceil(totalPalavras / 200));

  // Dividir conteúdo em parágrafos para boa formatação
  const paragrafos = conteudo ? conteudo.split('\n').filter((p: string) => p.trim().length > 0) : [resumo];

  return (
    <main className="pub-page">
      <style>{`
        .pub-page {
          background-color: var(--bg-offwhite);
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .pub-breadcrumb {
          padding: 20px 0;
          border-bottom: 1px solid var(--border-color);
          background-color: #fff;
          margin-bottom: 36px;
        }

        .pub-breadcrumb-inner {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }

        .pub-breadcrumb-inner a:hover {
          color: var(--primary-color);
        }

        .pub-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .pub-header {
          margin-bottom: 28px;
        }

        .pub-category {
          display: inline-block;
          background-color: var(--primary-light);
          color: var(--primary-color);
          font-weight: 700;
          font-size: 0.825rem;
          padding: 6px 14px;
          border-radius: var(--radius-pill);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .pub-title {
          font-size: 2.3rem;
          line-height: 1.25;
          color: var(--text-primary);
          margin-bottom: 18px;
          font-weight: 800;
        }

        .pub-lead {
          font-size: 1.15rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 24px;
          font-weight: 500;
        }

        .pub-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pub-author-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pub-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: var(--primary-color);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .pub-author-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .pub-date-info {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .pub-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pub-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pub-share-btn {
          background-color: #fff;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px 14px;
          border-radius: var(--radius-pill);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .pub-share-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
          background-color: var(--primary-light);
        }

        .pub-share-btn.wsp {
          background-color: #25D366;
          color: #fff;
          border: none;
        }

        .pub-share-btn.wsp:hover {
          background-color: #20ba5a;
          color: #fff;
        }

        .pub-hero-image-wrapper {
          position: relative;
          width: 100%;
          max-height: 480px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 40px;
          box-shadow: var(--shadow-md);
        }

        .pub-hero-image {
          width: 100%;
          height: 100%;
          max-height: 480px;
          object-fit: cover;
          display: block;
        }

        .pub-body {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #2d3748;
          background-color: #fff;
          padding: 40px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          margin-bottom: 48px;
        }

        .pub-body p {
          margin-bottom: 24px;
        }

        .pub-body p:last-child {
          margin-bottom: 0;
        }

        .pub-footer-share {
          background-color: var(--bg-light);
          padding: 24px 32px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 64px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pub-related-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .pub-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .pub-title {
            font-size: 1.75rem;
          }
          .pub-lead {
            font-size: 1rem;
          }
          .pub-body {
            padding: 24px;
            font-size: 1rem;
          }
          .pub-meta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* Breadcrumb Header */}
      <div className="pub-breadcrumb">
        <div className="pub-container">
          <div className="pub-breadcrumb-inner">
            <Link href="/">Início</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
              {titulo}
            </span>
          </div>
        </div>
      </div>

      <article className="pub-container">
        {/* Post Header */}
        <header className="pub-header">
          <span className="pub-category">{categoria}</span>
          <h1 className="pub-title">{titulo}</h1>
          {resumo && resumo !== titulo && (
            <p className="pub-lead">{resumo}</p>
          )}

          {/* Author & Meta Bar */}
          <div className="pub-meta">
            <div className="pub-author-info">
              <div className="pub-avatar">
                {autor.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="pub-author-name">{autor}</div>
                <div className="pub-date-info">
                  <span className="pub-meta-item">
                    <Calendar size={14} />
                    {dataFormatada}
                  </span>
                  <span>•</span>
                  <span className="pub-meta-item">
                    <Clock size={14} />
                    {tempoLeitura} min de leitura
                  </span>
                </div>
              </div>
            </div>

            <div className="pub-actions">
              <button onClick={handleCompartilharWhatsApp} className="pub-share-btn wsp" title="Compartilhar no WhatsApp">
                <MessageCircle size={16} /> Compartilhar
              </button>
              <button onClick={handleCopiarLink} className="pub-share-btn" title="Copiar link">
                {copiado ? <Check size={16} color="var(--success-color)" /> : <Share2 size={16} />}
                {copiado ? 'Link Copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Cover Image */}
        {imagem && (
          <div className="pub-hero-image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagem} alt={titulo} className="pub-hero-image" />
          </div>
        )}

        {/* Article Body */}
        <div className="pub-body">
          {paragrafos.map((paragrafo: string, index: number) => (
            <p key={index}>{paragrafo}</p>
          ))}
        </div>

        {/* Share Footer */}
        <div className="pub-footer-share">
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Gostou dessa matéria?</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Compartilhe com amigos e familiares da sua cidade.</p>
          </div>
          <div className="pub-actions">
            <button onClick={handleCompartilharWhatsApp} className="pub-share-btn wsp">
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button onClick={handleCopiarLink} className="pub-share-btn">
              {copiado ? <Check size={16} color="var(--success-color)" /> : <Share2 size={16} />}
              {copiado ? 'Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>

        {/* Related News */}
        {noticiasRelacionadas.length > 0 && (
          <section>
            <h3 className="pub-related-title">Outras Notícias</h3>
            <div className="pub-grid">
              {noticiasRelacionadas.map((noticiaItem) => (
                <PostCard key={noticiaItem.id || noticiaItem.slug} noticia={noticiaItem} />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
