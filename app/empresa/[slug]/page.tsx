'use client';

import { useState, useEffect } from 'react';
import { MapPin, Star, Phone, Globe, Clock, Instagram, Facebook, Edit, CheckCircle2, ShieldCheck, ChevronRight, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import ClaimModal from '../../../components/ClaimModal/ClaimModal';

export default function PerfilEmpresa({ params }: { params: { slug: string } }) {
  const [empresa, setEmpresa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [pendingClaim, setPendingClaim] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function carregar() {
      const slug = params.slug;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
        }
        const { data, error } = await supabase.from('empresas').select('*').eq('slug', slug).limit(1);
        if (data && data.length > 0 && !error) {
          setEmpresa(data[0]);
          if (session) {
            const { data: pendingData } = await supabase
              .from('claims')
              .select('id')
              .eq('target_table', 'empresas')
              .eq('target_id', data[0].id)
              .eq('user_id', session.user.id)
              .eq('status', 'pending')
              .limit(1);
            setPendingClaim(!!(pendingData && pendingData.length > 0));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [params.slug]);

  const handleReivindicar = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      if (window.confirm('Para prosseguir com essa ação você deve ser cadastrado. Deseja se cadastrar agora?')) {
        router.push('/cadastro-cidadao');
      }
      return;
    }
    setClaimModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-offwhite)' }}>
        <style>{`@keyframes ep-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} style={{ animation: 'ep-spin 0.8s linear infinite', display: 'block', margin: '0 auto 12px' }} />
          <span style={{ fontSize: '0.9rem' }}>Carregando perfil…</span>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Página não encontrada</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px' }}>
          O negócio ou entidade que você procura não existe ou ainda não foi aprovado.
        </p>
        <Link href="/guia-comercial" className="btn-theme" style={{ display: 'inline-block' }}>Voltar ao Guia Comercial</Link>
      </div>
    );
  }

  return (
    <main className="ep-page">
      <style>{`
        @keyframes ep-spin { to { transform: rotate(360deg); } }

        .ep-page {
          background-color: var(--bg-offwhite);
          min-height: 100vh;
          padding-bottom: 80px;
        }

        /* ── Hero / Capa ── */
        .ep-hero {
          height: 420px;
          position: relative;
          background-color: #1e293b;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .ep-hero { height: 260px; }
        }

        .ep-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.55;
          position: absolute;
          inset: 0;
          transition: transform 6s ease;
        }

        .ep-hero:hover .ep-hero-img {
          transform: scale(1.03);
        }

        /* Gradiente sobre a capa */
        .ep-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 30%,
            rgba(0,0,0,0.65) 100%
          );
          z-index: 1;
        }

        /* Botão Editar no hero */
        .ep-edit-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 20;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          color: var(--text-primary);
          padding: 9px 16px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.875rem;
          font-family: inherit;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .ep-edit-btn:hover {
          background: #fff;
          transform: translateY(-1px);
        }

        /* Título sobre a capa */
        .ep-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
          padding: 28px 32px;
        }

        .ep-hero-name {
          font-family: var(--font-outfit), sans-serif;
          font-size: 2.8rem;
          font-weight: 900;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 12px rgba(0,0,0,0.5);
          margin: 0 0 8px;
          line-height: 1.1;
        }

        .ep-hero-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ep-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 700;
          backdrop-filter: blur(6px);
        }

        .ep-badge-verified {
          background: rgba(5, 150, 105, 0.85);
          color: #fff;
        }

        .ep-badge-category {
          background: rgba(255,255,255,0.2);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.35);
        }

        @media (max-width: 640px) {
          .ep-hero-name { font-size: 1.7rem; }
          .ep-hero-content { padding: 20px 18px; }
        }

        /* ── Logo flutuante ── */
        .ep-logo-wrap {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          border: 3px solid #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ep-logo-wrap img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 6px;
        }

        /* ── Layout principal ── */
        .ep-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 28px;
          align-items: start;
          max-width: 1200px;
          margin: 32px auto 0;
          padding: 0 24px;
        }

        @media (max-width: 900px) {
          .ep-layout {
            grid-template-columns: 1fr;
            padding: 0 16px;
            margin-top: 24px;
            gap: 20px;
          }
        }

        /* ── Sidebar (esquerda) ── */
        .ep-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Card genérico ── */
        .ep-card {
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .ep-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .ep-card-body {
          padding: 18px 20px;
        }

        /* ── Informações de contato ── */
        .ep-info-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ep-info-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .ep-info-icon {
          color: var(--primary-color);
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── Botão WhatsApp ── */
        .ep-whatsapp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 11px 16px;
          margin-top: 6px;
          background: #22c55e;
          color: #fff;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .ep-whatsapp-btn:hover {
          background: #16a34a;
          transform: translateY(-1px);
        }

        /* ── Redes sociais ── */
        .ep-social-divider {
          height: 1px;
          background: var(--border-color);
          margin: 14px 0;
        }

        .ep-social-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          margin-bottom: 10px;
        }

        .ep-social-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ep-social-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border-color);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: border-color 0.2s ease, background-color 0.15s ease, transform 0.1s ease;
          color: var(--text-primary);
        }

        .ep-social-link:hover {
          transform: translateX(3px);
        }

        .ep-social-link-site:hover  { border-color: #6366f1; background: #eef2ff; color: #4f46e5; }
        .ep-social-link-insta:hover { border-color: #d946ef; background: #fdf4ff; color: #a21caf; }
        .ep-social-link-fb:hover    { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }

        /* ── Botão Reivindicar ── */
        .ep-claim-divider {
          height: 1px;
          background: var(--border-color);
          margin: 14px 0;
        }

        .ep-claim-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--bg-offwhite);
          border: 1.5px dashed var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.15s ease, color 0.15s ease;
        }

        .ep-claim-btn:hover {
          border-color: var(--primary-color);
          background: var(--primary-light);
          color: var(--primary-color);
        }

        /* ── Avaliações ── */
        .ep-stars {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #f59e0b;
          margin-bottom: 6px;
        }

        /* ── Conteúdo principal (direita) ── */
        .ep-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Sobre ── */
        .ep-about-text {
          font-size: 0.925rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin: 0;
        }

        /* ── Galeria ── */
        .ep-gallery {
          display: grid;
          grid-template-columns: 1fr 1.8fr 1fr;
          grid-template-rows: 160px 160px;
          gap: 10px;
        }

        .ep-gallery-thumb {
          border-radius: 10px;
          overflow: hidden;
          background: #e5e7eb;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .ep-gallery-thumb:hover {
          opacity: 0.88;
          transform: scale(1.01);
        }

        .ep-gallery-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ep-gallery-center {
          grid-column: 2;
          grid-row: 1 / span 2;
          border-radius: 14px;
          box-shadow: var(--shadow-md);
        }

        @media (max-width: 640px) {
          .ep-gallery {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 200px 140px 140px;
          }
          .ep-gallery-center {
            grid-column: 1 / span 2;
            grid-row: 1;
          }
        }
      `}</style>

      {/* ── Hero / Capa ── */}
      <div className="ep-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={empresa.capa} alt={empresa.nome} className="ep-hero-img" />
        <div className="ep-hero-overlay" />

        {/* Botão Editar */}
        {(userId === empresa.user_id || userId === empresa.claimed_by) && (
          <Link href={`/empresa/${empresa.slug}/editar`} className="ep-edit-btn">
            <Edit size={16} /> Editar Página
          </Link>
        )}

        {/* Nome e badges */}
        <div className="ep-hero-content">
          <h1 className="ep-hero-name">{empresa.nome}</h1>
          <div className="ep-hero-badges">
            {empresa.is_claimed === true && (
              <span className="ep-badge ep-badge-verified">
                <CheckCircle2 size={13} /> Verificada
              </span>
            )}
            {empresa.categoria && (
              <span className="ep-badge ep-badge-category">{empresa.categoria}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="ep-layout">

        {/* ── Sidebar ── */}
        <aside className="ep-sidebar">

          {/* Logo + Contato */}
          <div className="ep-card">
            <div className="ep-card-header">Informações</div>
            <div className="ep-card-body">

              {/* Logo */}
              {empresa.logo && (
                <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
                  <div className="ep-logo-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={empresa.logo} alt={`Logo ${empresa.nome}`} />
                  </div>
                </div>
              )}

              {/* Lista de infos */}
              <ul className="ep-info-list">
                {empresa.endereco && (
                  <li className="ep-info-item">
                    <MapPin size={16} className="ep-info-icon" />
                    <span>{empresa.endereco}</span>
                  </li>
                )}

                {empresa.telefone && (
                  <li style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="ep-info-item">
                      <Phone size={16} className="ep-info-icon" />
                      <span>{empresa.telefone}</span>
                    </div>
                    <a
                      href={`https://wa.me/55${empresa.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ep-whatsapp-btn"
                    >
                      {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                      💬 Chamar no WhatsApp
                    </a>
                  </li>
                )}
              </ul>

              {/* Redes Sociais */}
              {(empresa.site || empresa.instagram || empresa.facebook) && (
                <>
                  <div className="ep-social-divider" />
                  <p className="ep-social-label">Presença Online</p>
                  <div className="ep-social-links">
                    {empresa.site && (
                      <a
                        href={empresa.site.startsWith('http') ? empresa.site : `https://${empresa.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ep-social-link ep-social-link-site"
                      >
                        <Globe size={15} /> Website <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                      </a>
                    )}
                    {empresa.instagram && (
                      <a
                        href={empresa.instagram.startsWith('http') ? empresa.instagram : `https://instagram.com/${empresa.instagram.replace('@','')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ep-social-link ep-social-link-insta"
                      >
                        <Instagram size={15} /> Instagram <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                      </a>
                    )}
                    {empresa.facebook && (
                      <a
                        href={empresa.facebook.startsWith('http') ? empresa.facebook : `https://facebook.com/${empresa.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ep-social-link ep-social-link-fb"
                      >
                        <Facebook size={15} /> Facebook <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                      </a>
                    )}
                  </div>
                </>
              )}

              {/* Botão Reivindicar */}
              {pendingClaim && (
                <>
                  <div className="ep-claim-divider" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#FEF3C7', borderRadius: '8px', color: '#B45309', fontSize: '0.85rem', fontWeight: 600 }}>
                    <ShieldCheck size={16} /> Reivindicação pendente
                  </div>
                </>
              )}
              {!pendingClaim && !empresa.is_claimed && empresa.claimed_by !== userId && (
                <>
                  <div className="ep-claim-divider" />
                  <button onClick={handleReivindicar} className="ep-claim-btn">
                    <ShieldCheck size={16} /> É o dono? Reivindique aqui
                  </button>
                </>
              )}
              {empresa.claimed_by === userId && (
                <>
                  <div className="ep-claim-divider" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#DCFCE7', borderRadius: '8px', color: '#15803D', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> Você administra este perfil
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Avaliações */}
          <div className="ep-card">
            <div className="ep-card-header">Avaliações</div>
            <div className="ep-card-body">
              <div className="ep-stars">
                {[1,2,3,4,5].map(i => <Star key={i} size={15} fill="currentColor" />)}
                <span style={{ marginLeft: '6px', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>—</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', margin: 0 }}>Sem avaliações ainda.</p>
            </div>
          </div>

        </aside>

        {/* ── Conteúdo principal ── */}
        <div className="ep-main">

          {/* Sobre */}
          <div className="ep-card">
            <div className="ep-card-header">Sobre</div>
            <div className="ep-card-body">
              <p className="ep-about-text">
                {empresa.descricao || 'Sem descrição disponível.'}
              </p>
            </div>
          </div>

          {/* Galeria */}
          <div className="ep-card">
            <div className="ep-card-header">Galeria de Fotos</div>
            <div className="ep-card-body" style={{ padding: '16px' }}>
              <div className="ep-gallery">
                {/* Lateral esquerda topo */}
                <div className="ep-gallery-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={empresa.fotos_catalogo?.[0] || empresa.capa} alt="Galeria 1" />
                </div>
                {/* Central */}
                <div className="ep-gallery-thumb ep-gallery-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={empresa.capa} alt="Foto principal" />
                </div>
                {/* Lateral direita topo */}
                <div className="ep-gallery-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={empresa.fotos_catalogo?.[2] || empresa.capa} alt="Galeria 3" />
                </div>
                {/* Lateral esquerda baixo */}
                <div className="ep-gallery-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={empresa.fotos_catalogo?.[1] || empresa.capa} alt="Galeria 2" />
                </div>
                {/* Lateral direita baixo */}
                <div className="ep-gallery-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={empresa.fotos_catalogo?.[3] || empresa.capa} alt="Galeria 4" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        targetTable="empresas"
        targetId={empresa?.id}
        targetName={empresa?.nome}
        onSuccess={() => { setClaimModalOpen(false); setPendingClaim(true); }}
      />
    </main>
  );
}
