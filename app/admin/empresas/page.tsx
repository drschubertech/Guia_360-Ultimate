'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { Loader2, Building2, Plus, Trash2 } from 'lucide-react';

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  async function fetchEmpresas() {
    setFetching(true);
    try {
      let { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar empresas:', error);
      }

      setEmpresas(data || []);
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
      setEmpresas([]);
    } finally {
      setFetching(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
    try {
      await supabase.from('empresas').delete().eq('id', id);
      fetchEmpresas();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
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

        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.ativo {
          background-color: #DCFCE7;
          color: #15803D;
        }

        .status-badge.pendente {
          background-color: #FEF3C7;
          color: #B45309;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748B;
        }
      `}</style>

      {/* Cabeçalho Padronizado conforme Fig. 2 */}
      <AdminHeader
        title="Gerenciar empresas"
        subtitle={`${empresas.length} ${empresas.length === 1 ? 'empresa cadastrada' : 'empresas cadastradas'}`}
      />

      <div className="adm-table-container">
        {fetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="animate-spin" size={28} color="#2563EB" />
          </div>
        ) : empresas.length === 0 ? (
          <div className="empty-state">
            <Building2 size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p>Nenhuma empresa cadastrada no momento.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Categoria</th>
                <th>Bairro</th>
                <th>Status</th>
                <th>Dono</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600 }}>{emp.nome || emp.name || 'Sem nome'}</td>
                  <td>{emp.categoria || emp.category || '-'}</td>
                  <td>{emp.bairro || emp.neighborhood || '-'}</td>
                  <td>
                    <span className={`status-badge ${emp.status === 'ativo' || emp.is_claimed ? 'ativo' : 'pendente'}`}>
                      {emp.status || (emp.is_claimed ? 'ATIVO' : 'REGISTRADO')}
                    </span>
                  </td>
                  <td>{emp.dono || emp.owner_email || '-'}</td>
                  <td>{emp.views || emp.visualizacoes || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
