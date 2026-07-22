'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { Loader2, Check, X, Newspaper, CheckCircle2 } from 'lucide-react';

export default function AdminPublicacoes() {
  const [publicacoes, setPublicacoes] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicacoes();
  }, []);

  async function fetchPublicacoes() {
    setFetching(true);
    try {
      // Buscar notícias/publicações
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setPublicacoes(data);
      } else {
        // Fallback de dados de exemplo para demonstração se a tabela estiver vazia
        setPublicacoes([
          {
            id: '1',
            titulo: 'Balneário Piçarras recebe Chess Open no dia 25 de julho; inscrições seguem abertas',
            autor: 'ONG MAR LIMPO',
            created_at: '2026-07-22T10:00:00Z',
            status: 'pending'
          }
        ]);
      }
    } catch (err) {
      console.error('Erro ao buscar publicações:', err);
    } finally {
      setFetching(false);
    }
  }

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('noticias')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      setPublicacoes(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    } catch (err: any) {
      alert('Erro ao aprovar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('noticias')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      setPublicacoes(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    } catch (err: any) {
      alert('Erro ao rejeitar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  }

  return (
    <div className="adm-page">
      <style>{`
        .pub-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pub-card {
          background-color: #FAF8F5;
          border: 1px solid #E6E2DA;
          border-radius: 8px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .pub-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .pub-title {
          font-family: var(--font-outfit), Georgia, serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #1E293B;
          line-height: 1.3;
        }

        .pub-meta {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #94A3B8;
          text-transform: uppercase;
        }

        .pub-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .status-tag {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .status-tag.pending {
          background-color: #B91C1C;
          color: #FFFFFF;
        }

        .status-tag.approved {
          background-color: #15803D;
          color: #FFFFFF;
        }

        .status-tag.rejected {
          background-color: #64748B;
          color: #FFFFFF;
        }

        .btn-approve {
          background-color: #B91C1C;
          color: #FFFFFF;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .btn-approve:hover {
          background-color: #991B1B;
        }

        .btn-reject {
          background-color: transparent;
          color: #1E293B;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-reject:hover {
          background-color: #E2E8F0;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          background-color: #FAF8F5;
          border: 1px solid #E6E2DA;
          border-radius: 8px;
          color: #64748B;
        }

        @media (max-width: 768px) {
          .pub-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .pub-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>

      {/* Cabeçalho Padronizado conforme Fig. 3 */}
      <AdminHeader
        title="Moderar publicações"
        subtitle="Aprove ou rejeite conteúdo enviado pelas entidades"
      />

      {fetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="animate-spin" size={28} color="#2563EB" />
        </div>
      ) : publicacoes.length === 0 ? (
        <div className="empty-state">
          <Newspaper size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <p>Nenhuma publicação para moderação no momento.</p>
        </div>
      ) : (
        <div className="pub-list">
          {publicacoes.map((item) => (
            <div key={item.id} className="pub-card">
              <div className="pub-content">
                <div className="pub-title">{item.titulo || item.title}</div>
                <div className="pub-meta">
                  {(item.autor || item.entidade || 'ONG MAR LIMPO')} · {formatDate(item.created_at)}
                </div>
              </div>

              <div className="pub-actions">
                <span className={`status-tag ${item.status || 'pending'}`}>
                  {item.status === 'approved' ? 'APROVADO' : item.status === 'rejected' ? 'REJEITADO' : 'PENDENTE'}
                </span>

                {item.status !== 'approved' && (
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(item.id)}
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? <Loader2 className="animate-spin" size={14} /> : 'Aprovar'}
                  </button>
                )}

                {item.status !== 'rejected' && (
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(item.id)}
                    disabled={processingId === item.id}
                  >
                    Rejeitar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
