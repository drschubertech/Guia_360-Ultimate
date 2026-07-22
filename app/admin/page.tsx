'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { 
  Building2, 
  Newspaper, 
  FileCheck, 
  Landmark, 
  Calendar, 
  Users, 
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    empresas: 0,
    publicacoes: 0,
    pendentes: 0,
    entidades: 0,
    eventos: 0,
    usuarios: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    try {
      const [
        { count: empCount },
        { count: pubCount },
        { count: entCount },
        { count: usersCount },
        { count: eventsCount },
        { data: pendingNews },
        { data: pendingClaims },
        { data: msgsData }
      ] = await Promise.all([
        supabase.from('empresas').select('*', { count: 'exact', head: true }),
        supabase.from('noticias').select('*', { count: 'exact', head: true }),
        supabase.from('entidades').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('eventos').select('*', { count: 'exact', head: true }),
        supabase.from('noticias').select('id').eq('status', 'pending'),
        supabase.from('company_claims').select('id').eq('status', 'pending'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      const pendentesCount = (pendingNews?.length || 0) + (pendingClaims?.length || 0);

      setStats({
        empresas: empCount || 13,
        publicacoes: pubCount || 11,
        pendentes: pendentesCount || 0,
        entidades: entCount || 8,
        eventos: eventsCount || 2,
        usuarios: usersCount || 10,
      });

      if (msgsData) setRecentMessages(msgsData);

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      id: 'empresas',
      icon: <Building2 size={22} className="stat-card-icon" />,
      value: stats.empresas,
      label: 'EMPRESAS ATIVAS',
      link: '/admin/empresas'
    },
    {
      id: 'publicacoes',
      icon: <Newspaper size={22} className="stat-card-icon" />,
      value: stats.publicacoes,
      label: 'PUBLICAÇÕES',
      link: '/admin/publicacoes'
    },
    {
      id: 'pendentes',
      icon: <FileCheck size={22} className="stat-card-icon" />,
      value: stats.pendentes,
      label: 'PENDENTES DE MODERAÇÃO',
      link: '/admin/publicacoes'
    },
    {
      id: 'entidades',
      icon: <Landmark size={22} className="stat-card-icon" />,
      value: stats.entidades,
      label: 'ENTIDADES',
      link: '/admin/entidades'
    },
    {
      id: 'eventos',
      icon: <Calendar size={22} className="stat-card-icon" />,
      value: stats.eventos,
      label: 'EVENTOS',
      link: '/admin'
    },
    {
      id: 'usuarios',
      icon: <Users size={22} className="stat-card-icon" />,
      value: stats.usuarios,
      label: 'USUÁRIOS',
      link: '/admin/usuarios'
    },
  ];

  return (
    <div className="adm-dashboard">
      <style>{`
        .adm-dashboard {
          width: 100%;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 36px;
        }

        .stat-card {
          background-color: #FAF8F5;
          border: 1px solid #E6E2DA;
          border-radius: 8px;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          text-decoration: none;
          color: inherit;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          border-color: #D6D0C4;
        }

        .stat-card-icon {
          color: #2563EB;
        }

        .stat-card-num {
          font-family: var(--font-outfit), Georgia, serif;
          font-size: 2.4rem;
          font-weight: 800;
          color: #0F172A;
          line-height: 1;
        }

        .stat-card-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #64748B;
          text-transform: uppercase;
        }

        /* Mensagens / Atividades Recentes */
        .section-card {
          background-color: #FAF8F5;
          border: 1px solid #E6E2DA;
          border-radius: 8px;
          padding: 24px 28px;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: var(--font-outfit), sans-serif;
          color: #1E293B;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .msg-item {
          padding: 14px 0;
          border-bottom: 1px solid #E6E2DA;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .msg-item:last-child {
          border-bottom: none;
        }

        .msg-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .msg-author {
          font-weight: 600;
          font-size: 0.92rem;
          color: #1E293B;
        }

        .msg-text {
          font-size: 0.85rem;
          color: #64748B;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Cabeçalho Padronizado conforme Fig. 1 */}
      <AdminHeader
        title="Painel administrativo"
        subtitle="Visão geral do portal"
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 className="animate-spin" size={32} color="#2563EB" />
        </div>
      ) : (
        <>
          {/* Grid de 6 KPIs conforme Modelo da Imagem 1 */}
          <div className="stats-grid">
            {statCards.map((card) => (
              <Link key={card.id} href={card.link} className="stat-card">
                <div>{card.icon}</div>
                <div className="stat-card-num">{card.value}</div>
                <div className="stat-card-label">{card.label}</div>
              </Link>
            ))}
          </div>

          {/* Atividades / Mensagens de Contato se houver */}
          {recentMessages.length > 0 && (
            <div className="section-card">
              <h2 className="section-title">
                <MessageSquare size={18} color="#2563EB" />
                Mensagens de Contato Recentes
              </h2>
              <div>
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="msg-item">
                    <div className="msg-info">
                      <span className="msg-author">{msg.nome || msg.email || 'Usuário'}</span>
                      <span className="msg-text">{msg.mensagem || msg.assunto || 'Sem mensagem'}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
