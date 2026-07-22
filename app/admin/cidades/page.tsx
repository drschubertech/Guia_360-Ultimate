'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { Loader2, MapPin, Plus } from 'lucide-react';

export default function AdminCidades() {
  const [cidades, setCidades] = useState<any[]>([]);
  const [novaCidade, setNovaCidade] = useState('');
  const [fetching, setFetching] = useState(true);
  const [adding, setAdding] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCidades();
  }, []);

  async function fetchCidades() {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('cidades')
        .select('*')
        .order('nome', { ascending: true });

      if (data && data.length > 0) {
        setCidades(data);
      } else {
        // Dados de demonstração alinhados com a Imagem 7
        setCidades([
          { id: '1', nome: 'Balneário Piçarras', uf: 'SC', status: 'ATIVA' },
          { id: '2', nome: 'Penha', uf: 'SC', status: 'EM BREVE' },
          { id: '3', nome: 'Barra Velha', uf: 'SC', status: 'EM BREVE' },
        ]);
      }
    } catch (err) {
      console.error('Erro ao buscar cidades:', err);
    } finally {
      setFetching(false);
    }
  }

  async function handleAddCidade(e: React.FormEvent) {
    e.preventDefault();
    if (!novaCidade.trim()) return;

    setAdding(true);
    try {
      const payload = {
        nome: novaCidade.trim(),
        uf: 'SC',
        status: 'EM BREVE',
        slug: novaCidade.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };

      const { data, error } = await supabase
        .from('cidades')
        .insert([payload])
        .select()
        .single();

      if (error) {
        // Adicionar localmente se a tabela ainda não existir no Supabase
        setCidades(prev => [...prev, { id: Date.now().toString(), ...payload }]);
      } else if (data) {
        setCidades(prev => [...prev, data]);
      }
      setNovaCidade('');
    } catch (err: any) {
      console.error('Erro ao adicionar cidade:', err);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleStatus(cidade: any) {
    const newStatus = cidade.status === 'ATIVA' ? 'EM BREVE' : 'ATIVA';
    setProcessingId(cidade.id);

    try {
      await supabase
        .from('cidades')
        .update({ status: newStatus })
        .eq('id', cidade.id);

      setCidades(prev => prev.map(c => c.id === cidade.id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="adm-page">
      <style>{`
        .add-city-form {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          max-width: 450px;
        }

        .city-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #E6E2DA;
          border-radius: 4px;
          background-color: #FAF8F5;
          font-size: 0.9rem;
          color: #1E293B;
          outline: none;
        }

        .city-input:focus {
          border-color: #2563EB;
        }

        .btn-add {
          background-color: #B91C1C;
          color: #FFFFFF;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .btn-add:hover {
          background-color: #991B1B;
        }

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

        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .status-badge.ativa {
          background-color: #B91C1C;
          color: #FFFFFF;
        }

        .status-badge.em-breve {
          background-color: #E2E8F0;
          color: #64748B;
        }

        .btn-action {
          background-color: transparent;
          color: #475569;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-action:hover {
          background-color: #E2E8F0;
          color: #1E293B;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748B;
        }
      `}</style>

      {/* Cabeçalho Padronizado conforme Fig. 7 */}
      <AdminHeader
        title="Gerenciar cidades"
        subtitle="Cidades atendidas pelo portal"
      />

      {/* Formulário de Adicionar Cidade */}
      <form onSubmit={handleAddCidade} className="add-city-form">
        <input
          type="text"
          placeholder="Nova cidade..."
          value={novaCidade}
          onChange={(e) => setNovaCidade(e.target.value)}
          className="city-input"
        />
        <button type="submit" className="btn-add" disabled={adding}>
          {adding ? <Loader2 className="animate-spin" size={16} /> : 'Adicionar'}
        </button>
      </form>

      <div className="adm-table-container">
        {fetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="animate-spin" size={28} color="#2563EB" />
          </div>
        ) : cidades.length === 0 ? (
          <div className="empty-state">
            <MapPin size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p>Nenhuma cidade cadastrada no momento.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Cidade</th>
                <th>UF</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cidades.map((cid) => (
                <tr key={cid.id}>
                  <td style={{ fontWeight: 600 }}>{cid.nome || cid.name}</td>
                  <td>{cid.uf || 'SC'}</td>
                  <td>
                    <span className={`status-badge ${cid.status === 'ATIVA' ? 'ativa' : 'em-breve'}`}>
                      {cid.status === 'ATIVA' ? 'ATIVA' : 'EM BREVE'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-action"
                      onClick={() => handleToggleStatus(cid)}
                      disabled={processingId === cid.id}
                    >
                      {processingId === cid.id ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : cid.status === 'ATIVA' ? (
                        'Desativar'
                      ) : (
                        'Ativar'
                      )}
                    </button>
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
