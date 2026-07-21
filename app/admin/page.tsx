'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Building2, Users, Calendar, ClipboardList, 
  Newspaper, Building, Check, X, Eye, Activity,
  Trash2, Loader2, CheckCircle2, XCircle, AlertCircle, Plus, UserCheck, MessageSquare, ShieldCheck, Tag
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
  const [replyText, setReplyText] = useState<Record<string, string>>({});
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

  async function handleToggleReivindicada(id: string, isEntidade: boolean, currentStatus: any) {
    const isCurrentlyClaimed = currentStatus === true || currentStatus === 'true';
    const newStatus = !isCurrentlyClaimed;
    const table = isEntidade ? 'entidades' : 'empresas';
    
    setProcessingId(id);
    try {
      const { error } = await supabase.from(table).update({ reivindicada: newStatus }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert('Erro ao atualizar: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleAddEmpresa(e: React.FormEvent) {
    e.preventDefault();
    setLoadingCriar(true);
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
  async function handleResolveMessage(msg: any) {
    if (!confirm(msg.company_id ? 'Aprovar reivindicação e vincular usuário à empresa?' : 'Enviar resposta e marcar como resolvida?')) return;
    setProcessingId(msg.id);
    
    try {
      const resposta = replyText[msg.id] || '';
      const respostaFinal = resposta || (msg.company_id ? 'Reivindicação Aprovada! O local já está vinculado ao seu perfil.' : 'Resolvido pelo administrador.');
      
      const { error } = await supabase.from('contact_messages').update({ 
        status: 'resolved',
        resposta_admin: respostaFinal
      }).eq('id', msg.id);
      if (error) throw error;
      
      if (msg.company_id && msg.user_id && msg.tipo_empresa) {
        const table = msg.tipo_empresa.toLowerCase() === 'entidade' ? 'entidades' : 'empresas';
        const { error: compErr } = await supabase.from(table).update({ 
          user_id: msg.user_id,
          reivindicada: true
        }).eq('id', msg.company_id);
        if (compErr) throw compErr;
      }
      
      fetchData();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  }

  const pendingCount = messages.filter(m => m.status === 'pending').length;

  return (
    <div className="adm-page">
      <style>{`
        /* ---- Animações Globais da Página ---- */
        @keyframes adm-spin { to { transform: rotate(360deg); } }
        @keyframes adm-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes adm-pop {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }

        .adm-spin { animation: adm-spin 0.8s linear infinite; }

        /* ---- Estrutura da Página ---- */
        .adm-page {
          padding: 36px 24px 64px;
          max-width: 1200px;
          margin: 0 auto;
          animation: adm-fadein 0.3s ease-out;
        }

        /* ---- Topbar Header ---- */
        .adm-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .adm-header-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .adm-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--primary-color);
        }

        .adm-page-title {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }

        .adm-page-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .adm-new-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background-color: var(--primary-color);
          color: var(--bg-light);
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          font-family: inherit;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
          white-space: nowrap;
        }

        .adm-new-btn:hover {
          background-color: var(--primary-color-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .adm-new-btn:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        /* ---- Stat Cards Grid ---- */
        .adm-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .adm-stat-card {
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }

        .adm-stat-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
          border-color: #d1d5db;
        }

        .adm-stat-label {
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }

        .adm-stat-value {
          font-size: 2.1rem;
          font-weight: 800;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          line-height: 1;
        }

        .adm-stat-sub {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-top: 6px;
          font-weight: 500;
        }

        .adm-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .adm-stat-card:hover .adm-stat-icon {
          transform: scale(1.06);
        }

        /* Temas dos Ícones de Estatística */
        .adm-icon-info {
          background-color: var(--info-light);
          color: var(--info-color);
        }
        .adm-icon-primary {
          background-color: var(--primary-light);
          color: var(--primary-color);
        }
        .adm-icon-success {
          background-color: var(--success-light);
          color: var(--success-color);
        }
        .adm-icon-danger {
          background-color: var(--danger-light);
          color: var(--danger-color);
        }
        .adm-icon-warning {
          background-color: var(--warning-light);
          color: var(--warning-color);
        }
        .adm-icon-neutral {
          background-color: var(--bg-offwhite);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        /* ---- Divisor ---- */
        .adm-section-header {
          margin-bottom: 20px;
        }

        .adm-section-title {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          margin-bottom: 4px;
        }

        .adm-section-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* ---- Abas Navegáveis ---- */
        .adm-tabs-wrapper {
          border-bottom: 1.5px solid var(--border-color);
          margin-bottom: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .adm-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .adm-tabs::-webkit-scrollbar { display: none; }

        .adm-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1.5px;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.92rem;
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        }

        .adm-tab-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-light);
        }

        .adm-tab-btn.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
          background-color: var(--bg-light);
        }

        .adm-tab-btn:focus-visible {
          outline: 2px solid var(--primary-color);
        }

        .adm-tab-badge {
          background-color: var(--danger-color);
          color: var(--bg-light);
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          line-height: 1.4;
          box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
        }

        /* ---- Painel de Conteúdo ---- */
        .adm-panel {
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-top: none;
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          animation: adm-fadein 0.25s ease-out;
        }

        /* ---- Tabela (Desktop View >= 768px) ---- */
        .adm-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .adm-table thead {
          background-color: var(--bg-offwhite);
          border-bottom: 1.5px solid var(--border-color);
        }

        .adm-table th {
          padding: 14px 20px;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .adm-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }

        .adm-table tbody tr {
          transition: background-color 0.15s ease;
        }

        .adm-table tbody tr:hover {
          background-color: var(--bg-offwhite);
        }

        .adm-table tbody tr:last-child td {
          border-bottom: none;
        }

        .adm-table-name {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 0.92rem;
          margin: 0;
        }

        .adm-table-sub {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          font-weight: 400;
          margin-top: 3px;
          margin-bottom: 0;
        }

        .adm-table-meta {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* ---- Badges de Status ---- */
        .adm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: var(--radius-pill);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .adm-badge-reivindicada {
          background-color: var(--success-light);
          color: var(--success-text);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .adm-badge-disponivel {
          background-color: var(--bg-offwhite);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .adm-badge-pending {
          background-color: var(--warning-light);
          color: var(--warning-text);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .adm-badge-resolved {
          background-color: var(--success-light);
          color: var(--success-text);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* ---- Botões de Ação ---- */
        .adm-actions-cell {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .adm-action-btn {
          height: 34px;
          padding: 0 12px;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .adm-action-btn:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        .adm-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .adm-action-btn-claim-off {
          background-color: var(--warning-light);
          color: var(--warning-text);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .adm-action-btn-claim-off:hover:not(:disabled) {
          background-color: var(--warning-color);
          color: var(--bg-light);
          transform: translateY(-1px);
        }

        .adm-action-btn-claim-on {
          background-color: var(--success-light);
          color: var(--success-text);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .adm-action-btn-claim-on:hover:not(:disabled) {
          background-color: var(--success-color);
          color: var(--bg-light);
          transform: translateY(-1px);
        }

        .adm-action-btn-delete {
          width: 34px;
          height: 34px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-light);
          color: var(--danger-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .adm-action-btn-delete:hover {
          background-color: var(--danger-light);
          border-color: var(--danger-color);
          transform: translateY(-1px);
        }

        .adm-action-btn-delete:focus-visible {
          outline: 2px solid var(--danger-color);
        }

        /* ---- Visualização em Cards para Mobile (< 768px) ---- */
        .adm-mobile-cards {
          display: none;
          flex-direction: column;
          gap: 0;
        }

        .adm-mobile-card {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .adm-mobile-card:last-child {
          border-bottom: none;
        }

        .adm-mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .adm-mobile-card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .adm-mobile-card-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 4px;
        }

        .adm-mobile-card-actions .adm-action-btn {
          flex: 1;
        }

        /* ---- Estados de Carregamento e Vazio ---- */
        .adm-empty {
          padding: 64px 20px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 0.92rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .adm-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-pill);
          background-color: var(--bg-offwhite);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .adm-loading-row {
          padding: 48px;
          text-align: center;
          color: var(--text-tertiary);
        }

        /* ---- Lista de Mensagens (Fale Conosco) ---- */
        .adm-msg-list {
          display: flex;
          flex-direction: column;
        }

        .adm-msg-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
          transition: background-color 0.15s ease;
        }

        .adm-msg-item:last-child {
          border-bottom: none;
        }

        .adm-msg-item:hover {
          background-color: var(--bg-offwhite);
        }

        .adm-msg-item.resolved {
          opacity: 0.75;
        }

        .adm-msg-body {
          flex: 1;
          min-width: 0;
        }

        .adm-msg-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .adm-msg-subject {
          font-size: 1.05rem;
          font-weight: 700;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0;
        }

        .adm-msg-date {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          white-space: nowrap;
          margin-left: auto;
        }

        .adm-msg-from {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .adm-msg-content {
          background-color: var(--bg-offwhite);
          padding: 14px 16px;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.9rem;
          line-height: 1.5;
          white-space: pre-wrap;
          border-left: 3px solid var(--primary-color);
        }

        .adm-msg-reply-area {
          margin-top: 14px;
        }

        .adm-msg-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.885rem;
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
          resize: vertical;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .adm-msg-textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-light);
          background-color: var(--bg-light);
        }

        .adm-msg-resolved-reply {
          margin-top: 12px;
          background-color: var(--success-light);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--success-color);
        }

        .adm-msg-resolved-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--success-text);
          display: block;
          margin-bottom: 4px;
        }

        .adm-msg-resolved-text {
          font-size: 0.875rem;
          color: var(--success-text);
          white-space: pre-wrap;
        }

        .adm-msg-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 180px;
          flex-shrink: 0;
        }

        .adm-msg-btn {
          padding: 10px 16px;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .adm-msg-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .adm-msg-btn-approve {
          background-color: var(--success-color);
          color: var(--bg-light);
        }
        .adm-msg-btn-approve:hover:not(:disabled) {
          background-color: #059669;
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .adm-msg-btn-reply {
          background-color: var(--info-color);
          color: var(--bg-light);
        }
        .adm-msg-btn-reply:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .adm-msg-btn-done {
          background-color: var(--bg-offwhite);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          cursor: default;
          box-shadow: none;
        }

        /* ---- MODAL DE CADASTRO RÁPIDO ---- */
        .adm-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(17, 24, 39, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(6px);
          padding: 20px;
          animation: adm-fadein 0.2s ease-out;
        }

        .adm-modal {
          background: var(--bg-light);
          width: 100%;
          max-width: 560px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
          animation: adm-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .adm-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .adm-modal-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .adm-modal-header-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background-color: var(--primary-light);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .adm-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0;
        }

        .adm-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }

        .adm-modal-close:hover {
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
        }

        .adm-modal-close:focus-visible {
          outline: 2px solid var(--primary-color);
        }

        .adm-modal-body {
          padding: 24px 28px;
        }

        .adm-modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .adm-modal-full {
          grid-column: 1 / -1;
        }

        .adm-modal-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .adm-modal-input, .adm-modal-select {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.92rem;
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .adm-modal-input::placeholder {
          color: var(--text-tertiary);
        }

        .adm-modal-input:hover, .adm-modal-select:hover {
          border-color: #d1d5db;
        }

        .adm-modal-input:focus, .adm-modal-select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-light);
          background-color: var(--bg-light);
        }

        .adm-modal-select { cursor: pointer; }

        .adm-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 18px 28px 24px;
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-offwhite);
        }

        .adm-modal-cancel {
          padding: 10px 20px;
          background: var(--bg-light);
          color: var(--text-secondary);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          font-size: 0.9rem;
          transition: all 0.15s ease;
        }

        .adm-modal-cancel:hover {
          border-color: var(--text-secondary);
          color: var(--text-primary);
        }

        .adm-modal-submit {
          padding: 10px 24px;
          background: var(--primary-color);
          color: var(--bg-light);
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .adm-modal-submit:hover:not(:disabled) {
          background-color: var(--primary-color-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .adm-modal-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        /* ---- Responsividade (Mobile & Tablet) ---- */
        @media (max-width: 768px) {
          .adm-page { padding: 20px 16px 48px; }
          .adm-topbar { flex-direction: column; align-items: flex-start; }
          .adm-new-btn { width: 100%; justify-content: center; }
          .adm-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .adm-stat-card { padding: 16px; }
          .adm-stat-value { font-size: 1.75rem; }

          /* Esconde a tabela e exibe o layout de cards responsivo */
          .adm-table-wrapper { display: none; }
          .adm-mobile-cards { display: flex; }

          .adm-msg-item { flex-direction: column; gap: 16px; padding: 18px; }
          .adm-msg-date { margin-left: 0; }
          .adm-msg-actions { width: 100%; flex-direction: row; }
          .adm-msg-btn { flex: 1; }

          .adm-modal-grid { grid-template-columns: 1fr; }
          .adm-modal-full { grid-column: 1; }
        }

        @media (max-width: 480px) {
          .adm-stats-grid { grid-template-columns: 1fr; }
          .adm-msg-actions { flex-direction: column; }
        }
      `}</style>

      {/* ── Topbar Header ── */}
      <div className="adm-topbar">
        <div className="adm-header-info">
          <span className="adm-eyebrow">
            <ShieldCheck size={14} /> Painel Administrativo
          </span>
          <h1 className="adm-page-title">Dashboard 360°</h1>
          <p className="adm-page-subtitle">Gerencie empresas, entidades, solicitações e estatísticas do sistema</p>
        </div>
        <button className="adm-new-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Cadastrar Empresa / Entidade
        </button>
      </div>

      {/* ── Stat Cards Grid (6 Estatísticas Gerais) ── */}
      <div className="adm-stats-grid">
        {[
          { title: 'Empresas',   value: stats.empresas,     icon: <Building2 size={20}/>,     theme: 'adm-icon-info' },
          { title: 'Entidades',  value: stats.entidades,    icon: <Building size={20}/>,      theme: 'adm-icon-neutral' },
          { title: 'Usuários',   value: stats.usuarios,     icon: <Users size={20}/>,         theme: 'adm-icon-primary', sub: 'Cadastrados no sistema' },
          { title: 'Eventos',    value: stats.eventos,      icon: <Calendar size={20}/>,      theme: 'adm-icon-success' },
          { title: 'Notícias',   value: stats.noticias,     icon: <Newspaper size={20}/>,     theme: 'adm-icon-neutral' },
          { title: 'Mensagens',  value: stats.solicitacoes, icon: <ClipboardList size={20}/>, theme: 'adm-icon-danger', sub: 'Pendentes' },
        ].map(s => (
          <div key={s.title} className="adm-stat-card">
            <div>
              <p className="adm-stat-label">{s.title}</p>
              <p className="adm-stat-value">{loading ? '—' : s.value}</p>
              {s.sub && <p className="adm-stat-sub">{s.sub}</p>}
            </div>
            <div className={`adm-stat-icon ${s.theme}`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Seção de Gestão ── */}
      <div className="adm-section-header">
        <h2 className="adm-section-title">Administração do Aplicativo</h2>
        <p className="adm-section-desc">Gerencie o diretório de estabelecimentos e responda aos atendimentos recebidos</p>
      </div>

      {/* Abas Navegáveis */}
      <div className="adm-tabs-wrapper">
        <div className="adm-tabs">
          <button
            className={`adm-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Building2 size={18} /> Diretório (Empresas & Entidades)
          </button>
          <button
            className={`adm-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={18} /> Fale Conosco (Atendimento)
            {pendingCount > 0 && <span className="adm-tab-badge">{pendingCount}</span>}
          </button>
        </div>
      </div>

      {/* Painel Central */}
      <div className="adm-panel">

        {/* ── Aba 1: Diretório (Listagem) ── */}
        {activeTab === 'list' && (
          <>
            {/* Tabela para Telas Grandes (>= 768px) */}
            <div className="adm-table-wrapper">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Nome / Contato</th>
                    <th>Tipo</th>
                    <th>Data Cadastro</th>
                    <th>Status Reivindicação</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="adm-loading-row">
                          <Loader2 size={24} className="adm-spin" style={{ color: 'var(--text-tertiary)', display: 'block', margin: '0 auto' }} />
                        </div>
                      </td>
                    </tr>
                  ) : empresas.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="adm-empty">
                          <div className="adm-empty-icon"><Building2 size={24} /></div>
                          Nenhuma empresa ou entidade cadastrada no diretório.
                        </div>
                      </td>
                    </tr>
                  ) : empresas.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <p className="adm-table-name">{emp.nome}</p>
                        <p className="adm-table-sub">{emp.telefone || 'Sem telefone cadastrado'}</p>
                      </td>
                      <td className="adm-table-meta">{emp.isEntidade ? 'Entidade / ONG' : 'Empresa'}</td>
                      <td className="adm-table-meta">{new Date(emp.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {(emp.reivindicada === true || emp.reivindicada === 'true')
                          ? <span className="adm-badge adm-badge-reivindicada"><CheckCircle2 size={13} /> Reivindicada</span>
                          : <span className="adm-badge adm-badge-disponivel"><AlertCircle size={13} /> Disponível</span>
                        }
                      </td>
                      <td>
                        <div className="adm-actions-cell">
                          {(emp.reivindicada === true || emp.reivindicada === 'true') ? (
                            <button
                              onClick={() => handleToggleReivindicada(emp.id, emp.isEntidade, emp.reivindicada)}
                              disabled={processingId === emp.id}
                              className="adm-action-btn adm-action-btn-claim-off"
                              title="Remover vinculo de reivindicação"
                            >
                              {processingId === emp.id ? <Loader2 size={14} className="adm-spin" /> : <X size={14} />}
                              <span>Desfazer</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleReivindicada(emp.id, emp.isEntidade, emp.reivindicada)}
                              disabled={processingId === emp.id}
                              className="adm-action-btn adm-action-btn-claim-on"
                              title="Marcar manualmente como reivindicada"
                            >
                              {processingId === emp.id ? <Loader2 size={14} className="adm-spin" /> : <Check size={14} />}
                              <span>Reivindicar</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEmpresa(emp.id, emp.isEntidade)}
                            className="adm-action-btn-delete"
                            title="Excluir cadastro"
                            aria-label="Excluir cadastro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards Responsivos para Telas Menores (< 768px) */}
            <div className="adm-mobile-cards">
              {loading ? (
                <div className="adm-loading-row">
                  <Loader2 size={24} className="adm-spin" style={{ color: 'var(--text-tertiary)', display: 'block', margin: '0 auto' }} />
                </div>
              ) : empresas.length === 0 ? (
                <div className="adm-empty">
                  <div className="adm-empty-icon"><Building2 size={24} /></div>
                  Nenhum registro encontrado.
                </div>
              ) : empresas.map(emp => (
                <div key={emp.id} className="adm-mobile-card">
                  <div className="adm-mobile-card-header">
                    <div>
                      <p className="adm-table-name">{emp.nome}</p>
                      <p className="adm-table-sub">{emp.telefone || 'Sem telefone'}</p>
                    </div>
                    {(emp.reivindicada === true || emp.reivindicada === 'true')
                      ? <span className="adm-badge adm-badge-reivindicada"><CheckCircle2 size={13} /> Reivindicada</span>
                      : <span className="adm-badge adm-badge-disponivel"><AlertCircle size={13} /> Disponível</span>
                    }
                  </div>
                  <div className="adm-mobile-card-meta">
                    <span><strong>Tipo:</strong> {emp.isEntidade ? 'Entidade' : 'Empresa'}</span>
                    <span>•</span>
                    <span><strong>Cadastro:</strong> {new Date(emp.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="adm-mobile-card-actions">
                    {(emp.reivindicada === true || emp.reivindicada === 'true') ? (
                      <button
                        onClick={() => handleToggleReivindicada(emp.id, emp.isEntidade, emp.reivindicada)}
                        disabled={processingId === emp.id}
                        className="adm-action-btn adm-action-btn-claim-off"
                      >
                        {processingId === emp.id ? <Loader2 size={14} className="adm-spin" /> : <X size={14} />}
                        Desfazer Reivindicação
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleReivindicada(emp.id, emp.isEntidade, emp.reivindicada)}
                        disabled={processingId === emp.id}
                        className="adm-action-btn adm-action-btn-claim-on"
                      >
                        {processingId === emp.id ? <Loader2 size={14} className="adm-spin" /> : <Check size={14} />}
                        Reivindicar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEmpresa(emp.id, emp.isEntidade)}
                      className="adm-action-btn-delete"
                      title="Excluir cadastro"
                      aria-label="Excluir cadastro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Aba 2: Fale Conosco (Mensagens & Atendimentos) ── */}
        {activeTab === 'messages' && (
          <div className="adm-msg-list">
            {loading ? (
              <div className="adm-loading-row">
                <Loader2 size={24} className="adm-spin" style={{ color: 'var(--text-tertiary)', display: 'block', margin: '0 auto' }} />
              </div>
            ) : messages.length === 0 ? (
              <div className="adm-empty">
                <div className="adm-empty-icon"><MessageSquare size={24} /></div>
                Caixa de entrada vazia. Nenhuma mensagem recebida até o momento.
              </div>
            ) : messages.map(msg => (
              <div
                key={msg.id}
                className={`adm-msg-item ${msg.status === 'resolved' ? 'resolved' : ''}`}
              >
                <div className="adm-msg-body">
                  <div className="adm-msg-header">
                    <h4 className="adm-msg-subject">{msg.subject || 'Sem Assunto'}</h4>
                    <span className={`adm-badge ${msg.status === 'resolved' ? 'adm-badge-resolved' : 'adm-badge-pending'}`}>
                      {msg.status === 'resolved' ? 'Resolvida' : 'Pendente'}
                    </span>
                    <span className="adm-msg-date">{new Date(msg.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="adm-msg-from">De: <strong>{msg.name}</strong> — {msg.email}</p>
                  <div className="adm-msg-content">{msg.message}</div>

                  {msg.status === 'pending' && (
                    <div className="adm-msg-reply-area">
                      <textarea
                        placeholder={msg.company_id ? 'Mensagem de aprovação para o usuário (opcional)…' : 'Digite sua resposta para o usuário…'}
                        value={replyText[msg.id] || ''}
                        onChange={e => setReplyText({...replyText, [msg.id]: e.target.value})}
                        rows={3}
                        className="adm-msg-textarea"
                      />
                    </div>
                  )}

                  {msg.status === 'resolved' && msg.resposta_admin && (
                    <div className="adm-msg-resolved-reply">
                      <strong className="adm-msg-resolved-label">Resposta registrada pelo Administrador:</strong>
                      <span className="adm-msg-resolved-text">{msg.resposta_admin}</span>
                    </div>
                  )}
                </div>

                <div className="adm-msg-actions">
                  {msg.status === 'pending' ? (
                    <button
                      onClick={() => handleResolveMessage(msg)}
                      disabled={processingId === msg.id}
                      className={`adm-msg-btn ${msg.company_id ? 'adm-msg-btn-approve' : 'adm-msg-btn-reply'}`}
                    >
                      {processingId === msg.id
                        ? <Loader2 size={16} className="adm-spin" />
                        : <CheckCircle2 size={16} />
                      }
                      {msg.company_id ? 'Aprovar Reivindicação' : 'Enviar Resposta'}
                    </button>
                  ) : (
                    <span className="adm-msg-btn adm-msg-btn-done">
                      <Check size={16} /> Arquivado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de Cadastro Rápido de Empresa/Entidade ── */}
      {isModalOpen && (
        <div className="adm-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div className="adm-modal-header-title">
                <div className="adm-modal-header-icon">
                  <Plus size={20} />
                </div>
                <h2 className="adm-modal-title">Novo Cadastro Rápido</h2>
              </div>
              <button className="adm-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Fechar modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEmpresa}>
              <div className="adm-modal-body">
                <div className="adm-modal-grid">
                  {/* Tipo de Cadastro */}
                  <div className="adm-modal-full">
                    <label className="adm-modal-label">Tipo de Cadastro *</label>
                    <select
                      value={tipoCadastro}
                      onChange={e => setTipoCadastro(e.target.value as any)}
                      className="adm-modal-select"
                    >
                      <option value="empresa">Empresa / Negócio Comercial</option>
                      <option value="entidade">Entidade / ONG / Instituição</option>
                    </select>
                  </div>

                  {/* Nome */}
                  <div className="adm-modal-full">
                    <label className="adm-modal-label">Razão Social ou Nome Fantasia *</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      required
                      placeholder="Ex: Pizzaria do João"
                      className="adm-modal-input"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="adm-modal-label">Telefone Público</label>
                    <input
                      type="text"
                      value={telefone}
                      onChange={e => setTelefone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="adm-modal-input"
                    />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="adm-modal-label">E-mail Público</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="contato@empresa.com"
                      className="adm-modal-input"
                    />
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="adm-modal-cancel">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingCriar} className="adm-modal-submit">
                  {loadingCriar ? <><Loader2 size={16} className="adm-spin" /> Salvando…</> : 'Criar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
