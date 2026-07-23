'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { Loader2, CheckCircle2, XCircle, Clock, Building2, HeartHandshake } from 'lucide-react';

export default function AdminClaims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (err) {
      console.error('Erro ao buscar claims:', err);
    } finally {
      setFetching(false);
    }
  }

  async function handleApprove(claimId: string) {
    if (!confirm('Tem certeza que deseja aprovar esta reivindicação?')) return;
    setProcessingId(claimId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { approveClaim } = await import('@/app/actions/admin');
      const result = await approveClaim(claimId, session?.user?.id);
      if (!result.success) throw new Error(result.error);
      fetchClaims();
    } catch (err: any) {
      alert('Erro ao aprovar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(claimId: string) {
    if (!confirm('Tem certeza que deseja rejeitar esta reivindicação?')) return;
    setProcessingId(claimId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { rejectClaim } = await import('@/app/actions/admin');
      const result = await rejectClaim(claimId, session?.user?.id);
      if (!result.success) throw new Error(result.error);
      fetchClaims();
    } catch (err: any) {
      alert('Erro ao rejeitar: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  }

  const pendentes = claims.filter(c => c.status === 'pending');
  const aprovadas = claims.filter(c => c.status === 'approved');
  const rejeitadas = claims.filter(c => c.status === 'rejected');

  return (
    <div className="claims-page">
      <style>{`
        .claims-page { width: 100%; }

        .claims-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .claim-card {
          background-color: #FAF8F5;
          border: 1px solid #E6E2DA;
          border-radius: 8px;
          padding: 20px 24px;
          margin-bottom: 12px;
        }

        .claim-card.pending {
          border-left: 4px solid #F59E0B;
        }

        .claim-card.approved {
          border-left: 4px solid #22C55E;
        }

        .claim-card.rejected {
          border-left: 4px solid #EF4444;
        }

        .claim-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .claim-entity {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          color: #1E293B;
        }

        .claim-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .claim-status-badge.pending {
          background-color: #FEF3C7;
          color: #B45309;
        }

        .claim-status-badge.approved {
          background-color: #DCFCE7;
          color: #15803D;
        }

        .claim-status-badge.rejected {
          background-color: #FEE2E2;
          color: #991B1B;
        }

        .claim-details {
          font-size: 0.85rem;
          color: #64748B;
          margin-bottom: 14px;
          line-height: 1.5;
        }

        .claim-actions {
          display: flex;
          gap: 10px;
        }

        .btn-approve {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background-color: #22C55E;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.15s;
        }

        .btn-approve:hover { background-color: #16A34A; }
        .btn-approve:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-reject {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background-color: #EF4444;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.15s;
        }

        .btn-reject:hover { background-color: #DC2626; }
        .btn-reject:disabled { opacity: 0.6; cursor: not-allowed; }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748B;
        }
      `}</style>

      <AdminHeader
        title="Gerenciar Reivindicações"
        subtitle={`${pendentes.length} pendentes · ${aprovadas.length} aprovadas · ${rejeitadas.length} rejeitadas`}
      />

      {fetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="animate-spin" size={28} color="#2563EB" />
        </div>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <Building2 size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <p>Nenhuma solicitação de reivindicação no momento.</p>
        </div>
      ) : (
        <div>
          {claims.map((claim) => (
            <div key={claim.id} className={`claim-card ${claim.status}`}>
              <div className="claim-header">
                <div className="claim-entity">
                  {claim.target_table === 'empresas' ? <Building2 size={18} color="#2563EB" /> : <HeartHandshake size={18} color="#EA580C" />}
                  <span>{claim.target_table === 'empresas' ? 'Empresa' : 'Entidade'} · {claim.target_id.slice(0, 8)}…</span>
                  <span className={`claim-status-badge ${claim.status}`}>
                    {claim.status === 'pending' ? <Clock size={12} /> : claim.status === 'approved' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {claim.status === 'pending' ? 'Pendente' : claim.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  {new Date(claim.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="claim-details">
                <div><strong>Solicitante:</strong> {claim.user_id}</div>
                {claim.message && <div style={{ marginTop: '4px' }}><strong>Mensagem:</strong> {claim.message}</div>}
                {claim.reviewed_at && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Analisado em:</strong> {new Date(claim.reviewed_at).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              {claim.status === 'pending' && (
                <div className="claim-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(claim.id)}
                    disabled={processingId === claim.id}
                  >
                    {processingId === claim.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                    Aprovar
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(claim.id)}
                    disabled={processingId === claim.id}
                  >
                    {processingId === claim.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={14} />}
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
