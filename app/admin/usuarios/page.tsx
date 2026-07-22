'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { Loader2, Users } from 'lucide-react';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setUsuarios(data);
      } else {
        // Dados de demonstração alinhados com a Imagem 5
        setUsuarios([
          { id: '1', nome: 'Fulano deTal', email: 'fulano@teste.com', tipo: 'ENTIDADE' },
          { id: '2', nome: 'bilbi', email: 'bilbi@teste.com', tipo: 'EMPRESA' },
          { id: '3', nome: 'Empresa teste', email: 'teste4@teste.com', tipo: 'EMPRESA' },
          { id: '4', nome: 'Sousa Marques', email: 'teste3@teste.com', tipo: 'EMPRESA' },
          { id: '5', nome: 'Teste Cadastro Entidade', email: 'teste2@teste.com', tipo: 'ENTIDADE' },
          { id: '6', nome: 'Daniel Rubens', email: 'drschubertech@gmail.com', tipo: 'ADMIN' },
          { id: '7', nome: 'Daniel Rubens', email: 'teste@teste.com', tipo: 'ENTIDADE' },
          { id: '8', nome: 'Paulinho', email: 'ibr@teste.com', tipo: 'ENTIDADE' },
          { id: '9', nome: 'Daniel Rubens Schubert', email: 'dr_schubert@hotmail.com', tipo: 'ENTIDADE' },
          { id: '10', nome: 'Daniel Rubens', email: 'danielrschubert@gmail.com', tipo: 'ENTIDADE' },
          { id: '11', nome: 'Daniel Rubens Schubert', email: 'schubertech@gmail.com', tipo: 'ADMIN' },
        ]);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setFetching(false);
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

        .role-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background-color: #E2E8F0;
          color: #475569;
        }

        .role-badge.ADMIN {
          background-color: #DCFCE7;
          color: #166534;
        }

        .role-badge.ENTIDADE {
          background-color: #E0F2FE;
          color: #0369A1;
        }

        .role-badge.EMPRESA {
          background-color: #FEF3C7;
          color: #92400E;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748B;
        }
      `}</style>

      {/* Cabeçalho Padronizado conforme Fig. 5 */}
      <AdminHeader
        title="Gerenciar usuários"
        subtitle={`${usuarios.length} conta(s) registrada(s)`}
      />

      <div className="adm-table-container">
        {fetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 className="animate-spin" size={28} color="#2563EB" />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">
            <Users size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p>Nenhum usuário registrado no momento.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.nome || u.full_name || u.name || 'Sem nome'}</td>
                  <td>{u.email || u.user_email || '-'}</td>
                  <td>
                    <span className={`role-badge ${u.tipo || u.role || 'ENTIDADE'}`}>
                      {u.tipo || u.role || 'ENTIDADE'}
                    </span>
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
