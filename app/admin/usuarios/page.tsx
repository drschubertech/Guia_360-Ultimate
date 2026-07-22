'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { Loader2, Users, Trash2 } from 'lucide-react';

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

      if (data) {
        setUsuarios(data);
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setFetching(false);
    }
  }

  const handleDelete = async (id: string) => {
    const confirmar = window.confirm("Tem certeza que deseja deletar este usuário?");
    if (!confirmar) return;

    try {
      // Deleta o perfil (se houver gatilho de cascade, apagará o auth.users também, ou vice-versa, dependendo da configuração do banco)
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      
      if (error) {
        throw error;
      }
      
      alert("Usuário deletado com sucesso!");
      // Atualiza a lista removendo o usuário deletado
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err);
      alert("Erro ao deletar usuário: " + err.message);
    }
  };

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
        
        .role-badge.USUARIO {
          background-color: #F3E8FF;
          color: #6B21A8;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748B;
        }

        .btn-delete {
          background: none;
          border: none;
          color: #EF4444;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .btn-delete:hover {
          background-color: #FEE2E2;
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
                <th>Contato</th>
                <th>Tipo</th>
                <th style={{ textAlign: 'center', width: '80px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.nome || u.full_name || u.name || 'Sem nome'}</td>
                  <td>{u.email || u.user_email || '-'}</td>
                  <td>{u.telefone || u.contato || u.phone || '-'}</td>
                  <td>
                    <span className={`role-badge ${u.tipo || u.role || 'USUARIO'}`}>
                      {u.tipo || u.role || 'USUARIO'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(u.id)}
                      title="Deletar Usuário"
                    >
                      <Trash2 size={18} />
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
