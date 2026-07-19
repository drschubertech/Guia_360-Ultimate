'use client';

import { useState, useEffect } from 'react';
import { empresasMock } from '../../../lib/data';
import { MapPin, Star, Phone, Globe, Clock, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

export default function PerfilEmpresa({ params }: { params: { slug: string } }) {
  const [empresa, setEmpresa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const slug = params.slug;
      
      try {
        const { data, error } = await supabase.from('empresas').select('*').eq('slug', slug).single();
        if (data && !error) {
          setEmpresa(data);
        } else {
          // Se não encontrou no banco, tenta no mock
          const mock = empresasMock.find(e => e.slug === slug);
          if (mock) setEmpresa(mock);
        }
      } catch (err) {
        console.error(err);
        const mock = empresasMock.find(e => e.slug === slug);
        if (mock) setEmpresa(mock);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [params.slug]);

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Carregando...</div>;
  }

  if (!empresa) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Página não encontrada</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          O negócio ou entidade que você procura não existe ou ainda não foi aprovado.
        </p>
        <Link href="/guia-comercial" className="btn-theme" style={{ display: 'inline-block' }}>Voltar ao Guia Comercial</Link>
      </div>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--bg-offwhite)', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Capa com Nome Sobreposto */}
      <div style={{ height: '400px', backgroundColor: '#333', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={empresa.capa} alt={empresa.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, position: 'absolute', top: 0, left: 0 }} />
        <h1 className="titulo-empresa" style={{ position: 'relative', zIndex: 10, color: '#fff', textTransform: 'uppercase', textShadow: '2px 2px 8px rgba(0,0,0,0.7)', textAlign: 'center', fontWeight: 900 }}>
          {empresa.nome}
        </h1>
      </div>

      <style>{`
        .empresa-grid {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 30px;
          align-items: start;
        }
        .galeria-grid {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          grid-template-rows: 150px 150px;
          gap: 10px;
        }
        .galeria-central {
          grid-column: 2;
          grid-row: 1 / span 2;
        }
        .titulo-empresa {
          font-size: 3.5rem;
        }
        
        @media (max-width: 900px) {
          .empresa-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .galeria-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 200px 150px 150px;
          }
          .galeria-central {
            grid-column: 1 / span 2;
            grid-row: 1;
          }
          .titulo-empresa {
            font-size: 2rem !important;
          }
        }
      `}</style>

      <div className="container" style={{ marginTop: '40px' }}>
        <div className="empresa-grid">
          
          {/* Coluna 1: Sobre */}
          <div style={{ paddingRight: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#1a202c' }}>Sobre</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', fontSize: '0.9rem' }}>
              {empresa.descricao || 'Sem descrição disponível.'}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#046c4e', color: '#fff', padding: '5px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
              ✓ Verificada
            </div>
            <div style={{ display: 'inline-flex', marginLeft: '10px', alignItems: 'center', gap: '5px', backgroundColor: '#f3f4f6', color: '#4b5563', padding: '5px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem' }}>
              {empresa.categoria}
            </div>
          </div>

          {/* Coluna 2: Galeria de Fotos */}
          <div>
            <div className="galeria-grid">
              {/* Foto 1 (Esquerda Topo) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                <img src={empresa.fotos_catalogo?.[0] || empresa.capa} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Galeria 1" />
              </div>
              {/* Foto 2 (Esquerda Baixo) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                <img src={empresa.fotos_catalogo?.[1] || empresa.capa} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Galeria 2" />
              </div>

              {/* Foto Central (Capa) */}
              <div className="galeria-central" style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <img src={empresa.capa} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Centro" />
              </div>

              {/* Foto 3 (Direita Topo) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                <img src={empresa.fotos_catalogo?.[2] || empresa.capa} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Galeria 3" />
              </div>
              {/* Foto 4 (Direita Baixo) */}
              <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                <img src={empresa.fotos_catalogo?.[3] || empresa.capa} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Galeria 4" />
              </div>
            </div>
          </div>

          {/* Coluna 3: Informações e Avaliações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Informações */}
            <div>
              <h3 style={{ marginBottom: '15px', color: '#1a202c' }}>Informações</h3>
              
              {empresa.logo && (
                <div style={{ marginBottom: '20px', width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={empresa.logo} alt={`Logo ${empresa.nome}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '10px' }} />
                </div>
              )}

              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin size={18} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{empresa.endereco}</span>
                </li>
                {empresa.telefone && (
                  <li style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Phone size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                      <span>{empresa.telefone}</span>
                    </div>
                    {/* Botão WhatsApp */}
                    <a href={`https://wa.me/55${empresa.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#25D366', color: '#fff', padding: '10px 15px', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', textDecoration: 'none', width: '100%', transition: 'opacity 0.2s' }}>
                      Chamar no WhatsApp
                    </a>
                  </li>
                )}
                
                {/* Redes Sociais */}
                {(empresa.site || empresa.instagram || empresa.facebook) && (
                  <li style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eaeaea' }}>
                    <span style={{ fontWeight: 'bold', color: '#1a202c', marginBottom: '5px' }}>Redes Sociais:</span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {empresa.site && (
                         <a href={empresa.site.startsWith('http') ? empresa.site : `https://${empresa.site}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#4b5563', textDecoration: 'none', fontSize: '0.85rem' }}>
                           <Globe size={16} /> Site
                         </a>
                      )}
                      {empresa.instagram && (
                         <a href={empresa.instagram.startsWith('http') ? empresa.instagram : `https://instagram.com/${empresa.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: '#fdf4ff', borderRadius: '8px', color: '#d946ef', textDecoration: 'none', fontSize: '0.85rem' }}>
                           <Instagram size={16} /> Insta
                         </a>
                      )}
                      {empresa.facebook && (
                         <a href={empresa.facebook.startsWith('http') ? empresa.facebook : `https://facebook.com/${empresa.facebook}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem' }}>
                           <Facebook size={16} /> Face
                         </a>
                      )}
                    </div>
                  </li>
                )}
                
                {/* Botão Reivindicar */}
                {empresa.reivindicada !== true && (
                  <li style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eaeaea' }}>
                    <Link href={`/contato?assunto=Reivindicar Empresa: ${empresa.nome}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: 'var(--radius-sm)', color: '#4b5563', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', transition: 'background-color 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                       🛡️ É o dono? Reivindique aqui
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Caixa de Avaliações */}
            <div>
              <h4 style={{ marginBottom: '10px', color: '#1a202c' }}>Avaliações</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', marginBottom: '5px' }}>
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <span style={{ color: '#9ca3af', marginLeft: '5px' }}>—</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sem avaliações ainda.</p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
