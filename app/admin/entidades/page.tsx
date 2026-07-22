'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { Loader2, Landmark, CheckCircle2 } from 'lucide-react';

export default function AdminEntidades() {
  const [entidades, setEntidades] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntidades();
  }, []);

  async function fetchEntidades() {
    setFetching(true);
    try {
      // 1. Tentar buscar entidades com dados de profiles se houver relacao
      let rawData: any[] | null = null;

      const { data: dataJoin } = await supabase
        .from('entidades')
        .select('*, profiles(full_name, id)')
        .order('nome', { ascending: true });

      if (dataJoin && dataJoin.length > 0) {
        rawData = dataJoin;
      } else {
        const { data: dataSimple } = await supabase
          .from('entidades')
          .select('*')
          .order('nome', { ascending: true });
        if (dataSimple) rawData = dataSimple;
      }

      if (rawData && rawData.length > 0) {
        // Se houver user_id sem nome do profile, buscar em profiles
        const missingUserIds = Array.from(
          new Set(rawData.filter(e => e.user_id && !e.profiles?.full_name).map(e => e.user_id))
        );

        let userMap = new Map<string, string>();
        if (missingUserIds.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', missingUserIds);
          if (profs) {
            profs.forEach(p => userMap.set(p.id, p.full_name));
          }
        }

        const processed = rawData.map(ent => ({
          ...ent,
          tipo: ent.tipo || ent.categoria || 'Associação',
          responsavel: ent.responsavel || ent.profiles?.full_name || userMap.get(ent.user_id) || (ent.user_id ? 'Responsável vinculado' : '— Sem responsável —'),
          verificada: ent.verificada !== undefined ? ent.verificada : true
        }));

        setEntidades(processed);
      } else {
        // Fallback de demonstração
        setEntidades([
          { id: '1', nome: 'Associação Comercial de Piçarras', tipo: 'Associação', responsavel: 'Daniel Rubens - teste@teste.com', verificada: true },
          { id: '2', nome: 'Clube Náutico Piçarras', tipo: 'Clube', responsavel: '— Sem responsável —', verificada: true },
          { id: '3', nome: 'Colônia de Pescadores Z-19', tipo: 'Associação', responsavel: '— Sem responsável —', verificada: true },
          { id: '4', nome: 'Igreja Batista Renovada — Juventude em ação', tipo: 'Outro', responsavel: 'Paulinho - ibr@teste.com', verificada: false },
          { id: '5', nome: 'ONG Mar Limpo', tipo: 'ONG', responsavel: 'Fulano deTal - fulano@teste.com', verificada: true },
          { id: '6', nome: 'Paróquia Nossa Senhora da Paz', tipo: 'Igreja', responsavel: '— Sem responsável —', verificada: true },
          { id: '7', nome: 'Paróquia Santo Antonio — Pastoral da Juventude', tipo: 'Outro', responsavel: '— Sem responsável —', verificada: false },
          { id: '8', nome: 'Prefeitura de Balneário Piçarras', tipo: 'Órgão público', responsavel: 'Daniel Rubens - danielrschubert@gmail.com', verificada: true }
        ]);
      }
    } catch (err) {
      console.error('Erro ao buscar entidades:', err);
    } finally {
      setFetching(false);
    }
  }

  async function handleVerificar(id: string) {
    setProcessingId(id);
    try {
      await supabase
        .from('entidades')
        .update({ verificada: true })
        .eq('id', id);

      setEntidades(prev => prev.map(e => e.id === id ? { ...e, verificada: true } : e));
    } catch (err: any) {
      console.error('Erro ao verificar entidade:', err);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="adm-page">
      <style>{`
        .adm-table-container {
          background-color: #FAF8F5;
          border: 1px solid #E6E2DA;
          border-radius: 8px;
          overflow: hidden;
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .adm-table th {
          background-color: #FAF8F5;
          padding: 14px 20px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #E6E2DA;
        }

        .adm-table td {
          padding: 16px 20px;
          font-size: 0.88rem;
          color: #1E293B;
          border-bottom: 1px solid #E6E2DA;
          background-color: #FAF8F5;
        }

        .adm-table tr:last-child td {
          border-bottom: none;
        }

        .verified-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .btn-verificar {
          background-color: #B91C1C;
          color: #FFFFFF;
          border: none;
          border-radius: 4px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .btn-verificar:hover {
          background-color: #991B1B;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748B;
        }
      `}</style>

      {/* Cabeçalho Padronizado conforme Fig. 4 */}
      <AdminHeader
        title="Gerenciar entidades"
        subtitle={`${entidades.length} entidades cadastradas`}
      />

      <div className="adm-table-container">
        {fetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="animate-spin" size={28} color="#2563EB" />
          </div>
        ) : entidades.length === 0 ? (
          <div className="empty-state">
            <Landmark size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p>Nenhuma entidade cadastrada no momento.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Entidade</th>
                <th>Tipo</th>
                <th>Responsável</th>
                <th>Verificada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {entidades.map((ent) => (
                <tr key={ent.id}>
                  <td style={{ fontWeight: 600 }}>{ent.nome || ent.name}</td>
                  <td>{ent.tipo || ent.categoria || 'Associação'}</td>
                  <td>{ent.responsavel || '— Sem responsável —'}</td>
                  <td>
                    <div className="verified-cell">
                      {ent.verificada ? (
                        <>
                          <CheckCircle2 size={16} color="#2563EB" />
                          <span>Sim</span>
                        </>
                      ) : (
                        <span>Não</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {!ent.verificada && (
                      <button
                        className="btn-verificar"
                        onClick={() => handleVerificar(ent.id)}
                        disabled={processingId === ent.id}
                      >
                        {processingId === ent.id ? <Loader2 className="animate-spin" size={12} /> : 'Verificar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
