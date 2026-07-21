'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Building2, Users, Calendar, ClipboardList, 
  Newspaper, Building, Check, X, Eye, Activity,
  Trash2, Loader2, CheckCircle2, XCircle, AlertCircle, Plus, UserCheck, MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    empresas: 0,
    usuarios: 0,
    eventos: 0,
    solicitacoes: 0,
    noticias: 0,
    entidades: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Estados das Abas
  const [activeTab, setActiveTab] = useState<'list' | 'messages'>('list');
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Estados do Modal de Criação Rápida
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [tipoCadastro, setTipoCadastro] = useState<'empresa' | 'entidade'>('empresa');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loadingCriar, setLoadingCriar] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [
      { count: empCount }, 
      { count: entCount }, 
      { count: usersCount }, 
      { count: eventsCount },
      { count: newsCount },
      // Buscar dados das Abas
      { data: empData },
      { data: entData },
      { data: msgData }
    ] = await Promise.all([
      supabase.from('empresas').select('*', { count: 'exact', head: true }),
      supabase.from('entidades').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('eventos').select('*', { count: 'exact', head: true }),
      supabase.from('noticias').select('*', { count: 'exact', head: true }),
      
      // Abas
      supabase.from('empresas').select('*').order('created_at', { ascending: false }),
      supabase.from('entidades').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    ]);

    setStats({
      empresas: empCount || 0,
      usuarios: usersCount || 0,
      eventos: eventsCount || 0,
      solicitacoes: msgData ? msgData.filter(m => m.status === 'pending').length : 0,
      noticias: newsCount || 0,
      entidades: entCount || 0
    });
    
    // Combine and sort
    const combined = [
      ...(empData || []).map(e => ({...e, isEntidade: false})), 
      ...(entData || []).map(e => ({...e, isEntidade: true}))
    ];
    combined.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setEmpresas(combined);

    if (msgData) setMessages(msgData);

    setLoading(false);
  }

  // --- Funções de Empresas/Entidades ---
  async function handleDeleteEmpresa(id: string, isEntidade: boolean) {
    if (!confirm('Excluir permanentemente?')) return;
    const table = isEntidade ? 'entidades' : 'empresas';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) alert('Erro: ' + error.message);
    else fetchData();
  }

  async function handleAddEmpresa(e: React.FormEvent) {
    e.preventDefault();
    setLoadingCriar(true);
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const table = tipoCadastro === 'entidade' ? 'entidades' : 'empresas';
    const { error } = await supabase.from(table).insert([{
      nome: nome, slug: slug, telefone: telefone, reivindicada: false, status: 'fechado' 
    }]);
    setLoadingCriar(false);
    if (error) {
      alert('Erro: ' + error.message);
    } else {
      setNome(''); setEmail(''); setTelefone('');
      setIsModalOpen(false);
      fetchData();
      alert('Cadastro realizado com sucesso!');
    }
  }

  // --- Funções de Mensagens ---
  async function handleResolveMessage(msgId: string) {
    if (!confirm('Marcar como resolvida?')) return;
    setProcessingId(msgId);
    try {
      const { error } = await supabase.from('contact_messages').update({ status: 'resolved' }).eq('id', msgId);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  }

  // UI Components
  const colors = { blue: '#3b82f6', orange: '#f97316', green: '#10b981', red: '#ef4444', gray: '#64748b', darkBlue: '#1e3a8a' };

  const StatCard = ({ title, value, subtitle, icon, color }: { title: string, value: number | string, subtitle?: string, icon: any, color: string }) => (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: '1 1 200px' }}>
      <div>
        <p style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>{title}</p>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{loading ? '...' : value}</h2>
        {subtitle && <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '6px' }}>{subtitle}</p>}
      </div>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
        {icon}
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon, badge }: { id: any, label: string, icon: React.ReactNode, badge?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
        backgroundColor: activeTab === id ? '#fff' : 'transparent',
        color: activeTab === id ? 'var(--primary-color)' : '#64748b',
        border: 'none',
        borderBottom: activeTab === id ? '3px solid var(--primary-color)' : '3px solid transparent',
        cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'all 0.2s', position: 'relative'
      }}
    >
      {icon} {label}
      {badge ? <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px' }}>{badge}</span> : null}
    </button>
  );

  return (
    <div style={{ padding: '10px 0', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Dashboard - Visão Geral</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
        >
          <Plus size={16} /> Cadastrar Nova Empresa/Entidade
        </button>
      </div>

      <style>{`
        .dashboard-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
        .dashboard-row-2 { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 20px; margin-bottom: 20px; }
        .recent-activities { grid-column: 3 / 4; grid-row: 1 / 3; }
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
          .dashboard-row-2 { grid-template-columns: 1fr 1fr; }
          .recent-activities { grid-column: 1 / 3; grid-row: auto; }
        }
        @media (max-width: 640px) {
          .dashboard-grid, .dashboard-row-2 { grid-template-columns: 1fr; }
          .recent-activities { grid-column: 1 / 2; }
        }
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .status-pendente { background-color: #fef08a; color: #854d0e; }
        .status-aprovado { background-color: #bbf7d0; color: #166534; }
        .status-rejeitado { background-color: #fecaca; color: #991b1b; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* DASHBOARD CARDS */}
      <div className="dashboard-grid">
        <StatCard title="Empresas" value={stats.empresas} icon={<Building2 size={20} />} color={colors.blue} />
        <StatCard title="Novos Usuários" value={stats.usuarios} subtitle="Cadastrados no sistema" icon={<Users size={20} />} color={colors.orange} />
        <StatCard title="Eventos Ativos" value={stats.eventos} icon={<Calendar size={20} />} color={colors.green} />
        <StatCard title="Mensagens de Contato" value={stats.solicitacoes} subtitle="Pendentes" icon={<ClipboardList size={20} />} color={colors.red} />
      </div>

      <div className="dashboard-row-2">
        <StatCard title="Notícias" value={stats.noticias} icon={<Newspaper size={20} />} color={colors.gray} />
        <StatCard title="Entidades" value={stats.entidades} icon={<Building size={20} />} color={colors.darkBlue} />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '40px 0' }} />

      {/* ADMINISTRACAO DE DADOS */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>Administração do Aplicativo</h2>
      
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '25px', overflowX: 'auto', paddingBottom: '2px' }}>
        <TabButton id="list" label="Diretório (Empresas/Entidades)" icon={<Building2 size={18} />} />
        <TabButton id="messages" label="Fale Conosco (Atendimento)" icon={<MessageSquare size={18} />} badge={messages.filter(m => m.status === 'pending').length > 0 ? messages.filter(m => m.status === 'pending').length : undefined} />
      </div>

      <div style={{ animation: 'fadeIn 0.3s ease-in-out', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', overflow: 'hidden', overflowX: 'auto' }}>
        
        {/* ABA: LISTAGEM GERAL */}
        {activeTab === 'list' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>NOME</th>
                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>TIPO</th>
                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>DATA CADASTRO</th>
                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: '#94a3b8' }}/></td></tr> :
               empresas.length === 0 ? <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma empresa/entidade no diretório.</td></tr> :
               empresas.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
                    {emp.nome}
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>{emp.telefone || 'S/ Telefone'}</span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{emp.isEntidade ? 'Entidade' : 'Empresa'}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{new Date(emp.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {emp.reivindicada 
                      ? <span className="status-badge status-aprovado">Reivindicada</span>
                      : <span className="status-badge status-pendente" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Disponível</span>}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button onClick={() => handleDeleteEmpresa(emp.id, emp.isEntidade)} style={{ color: colors.red, background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }} title="Excluir"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ABA: MENSAGENS */}
        {activeTab === 'messages' && (
          <div style={{ padding: '10px' }}>
             {loading ? <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: '#94a3b8' }}/></div> :
               messages.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Caixa de entrada vazia.</div> :
               messages.map(msg => (
                <div key={msg.id} style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', opacity: msg.status === 'resolved' ? 0.6 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '1.05rem', color: '#1e293b', margin: 0 }}>{msg.subject || 'Sem Assunto'}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '10px' }}>De: {msg.name} ({msg.email})</p>
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', color: '#334155', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </div>
                  </div>
                  <div>
                    {msg.status === 'pending' ? (
                      <button onClick={() => handleResolveMessage(msg.id)} disabled={processingId === msg.id} style={{ padding: '8px 14px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {processingId === msg.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Resolvido
                      </button>
                    ) : (
                      <span style={{ padding: '8px 14px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Check size={16} /> Arquivado
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO RÁPIDA DE EMPRESA/ENTIDADE */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '600px', borderRadius: 'var(--radius-lg)', padding: '30px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>Cadastrar no Guia</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddEmpresa} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Tipo de Cadastro *</label>
                <select value={tipoCadastro} onChange={e => setTipoCadastro(e.target.value as any)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', outline: 'none' }}>
                  <option value="empresa">Empresa / Negócio</option>
                  <option value="entidade">Entidade / ONG / Instituição</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Razão Social / Nome *</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', outline: 'none' }} placeholder="Ex: Pizzaria do João" />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Telefone Público</label>
                <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', outline: 'none' }} placeholder="(00) 00000-0000" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>E-mail Público</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', outline: 'none' }} placeholder="contato@empresa.com" />
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                <button type="submit" disabled={loadingCriar} style={{ padding: '12px 24px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: loadingCriar ? 0.7 : 1 }}>
                  {loadingCriar ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : 'Criar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
