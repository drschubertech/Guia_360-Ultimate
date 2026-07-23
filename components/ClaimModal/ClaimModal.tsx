'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, X, Building2, HeartHandshake } from 'lucide-react';

type ClaimModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetTable: 'empresas' | 'entidades';
  targetId: string;
  targetName: string;
  onSuccess?: () => void;
};

export default function ClaimModal({ isOpen, onClose, targetTable, targetId, targetName, onSuccess }: ClaimModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (confirm('Você precisa estar logado para reivindicar uma empresa. Deseja fazer login?')) {
          router.push('/login');
        }
        return;
      }

      const { data: existing } = await supabase
        .from('claims')
        .select('id, status')
        .eq('target_table', targetTable)
        .eq('target_id', targetId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existing && existing.status === 'pending') {
        setError('Você já possui uma solicitação pendente para esta empresa.');
        return;
      }

      if (existing && existing.status === 'approved') {
        setError('Você já é o administrador desta empresa.');
        return;
      }

      const { error: insertError } = await supabase
        .from('claims')
        .insert({
          target_table: targetTable,
          target_id: targetId,
          user_id: session.user.id,
          message: message || null,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #E6E2DA'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>
            {success ? 'Solicitação Enviada' : `Reivindicar ${targetTable === 'empresas' ? 'Empresa' : 'Entidade'}`}
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px', borderRadius: '8px', display: 'flex',
            color: '#94A3B8'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: '16px' }} />
              <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#1E293B' }}>
                Solicitação enviada com sucesso!
              </h4>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                O administrador analisará sua solicitação e você receberá uma resposta em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Info da empresa */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px',
                border: '1px solid #E6E2DA'
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  backgroundColor: targetTable === 'empresas' ? '#EFF6FF' : '#FFF7ED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {targetTable === 'empresas' ? <Building2 size={22} color="#2563EB" /> : <HeartHandshake size={22} color="#EA580C" />}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>{targetName}</p>
                  <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '0.82rem' }}>
                    {targetTable === 'empresas' ? 'Empresa' : 'Entidade'}
                  </p>
                </div>
              </div>

              {/* Campo de mensagem */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.88rem', color: '#1E293B' }}>
                  Mensagem <span style={{ fontWeight: 400, color: '#94A3B8' }}>(opcional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Explique por que você é o proprietário ou responsável por esta empresa..."
                  rows={4}
                  style={{
                    width: '100%', padding: '11px 14px', border: '1.5px solid #E6E2DA',
                    borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.9rem',
                    color: '#1E293B', outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', lineHeight: 1.5
                  }}
                />
              </div>

              {/* Erro */}
              {error && (
                <p style={{ color: '#EF4444', fontSize: '0.85rem', margin: 0 }}>{error}</p>
              )}

              {/* Aviso */}
              <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                Ao enviar esta solicitação, você declara ser o proprietário ou representante legal
                desta {targetTable === 'empresas' ? 'empresa' : 'entidade'}. O administrador analisará
                e poderá aprovar ou rejeitar sua solicitação.
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={onClose} style={{
                  flex: 1, padding: '11px 16px', borderRadius: '8px',
                  border: '1.5px solid #E6E2DA', backgroundColor: '#fff',
                  color: '#64748B', fontWeight: 600, fontSize: '0.9rem',
                  cursor: 'pointer', fontFamily: 'inherit'
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={sending} style={{
                  flex: 2, padding: '11px 16px', borderRadius: '8px',
                  border: 'none', backgroundColor: '#2563EB', color: '#fff',
                  fontWeight: 700, fontSize: '0.9rem', cursor: sending ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: sending ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                  {sending ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enviando…</> : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
