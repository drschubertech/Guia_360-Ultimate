'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Loader2, CheckCircle2, XCircle, AlertCircle, Check, X, Plus, Building2, UserCheck, MessageSquare } from 'lucide-react';

export default function AdminEmpresas() {
  const [activeTab, setActiveTab] = useState<'list' | 'claims' | 'messages'>('list');
  
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Estados do Modal de Criação Rápida
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loadingCriar, setLoadingCriar] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setFetching(true);
    
    // Buscar empresas
    const { data: empData, error: empError } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
    if (empData) setEmpresas(empData);
    if (empError) console.error(empError);

    // Buscar solicitações pendentes (claims)
    const { data: claimsData, error: claimsError } = await supabase
      .from('company_claims')
      .select(`
        *,
        companies ( name, document ),
        profiles ( full_name, email:id ) 
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (claimsData) setClaims(claimsData);
    if (claimsError) console.error(claimsError);

    // Buscar mensagens de contato
    const { data: msgData, error: msgError } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
      
    // Se a tabela ainda não existir, o erro pode acontecer, então apenas engolimos o erro silenciosamente no UI
    if (msgData) setMessages(msgData);

    setFetching(false);
  }

  // --- Aprovação de Claims ---
  async function handleApprove(claim: any) {
    if (!confirm('Aprovar esta solicitação dará controle da empresa para este usuário. Continuar?')) return;
    setProcessingId(claim.id);

    try {
      const { error: claimErr } = await supabase.from('company_claims').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', claim.id);
      if (claimErr) throw claimErr;

      const { error: compErr } = await supabase.from('companies').update({ is_claimed: true }).eq('id', claim.company_id);
      if (compErr) throw compErr;

      const { error: memErr } = await supabase.from('entity_members').insert([{
        company_id: claim.company_id,
        user_id: claim.user_id,
        title: 'Proprietário'
      }]);
      
      if (memErr && memErr.code !== '23505') throw memErr;

      alert('Solicitação aprovada com sucesso!');
      fetchData();
    } catch (error: any) {
      alert('Erro ao aprovar solicitação: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(claimId: string) {
    if (!confirm('Tem certeza que deseja rejeitar esta solicitação?')) return;
    setProcessingId(claimId);

    try {
      const { error } = await supabase.from('company_claims').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', claimId);
      if (error) throw error;
      
      alert('Solicitação rejeitada.');
      fetchData();
    } catch (error: any) {
      alert('Erro ao rejeitar solicitação: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  }

  // --- Resolução de Mensagens ---
  async function handleResolveMessage(msgId: string) {
    if (!confirm('Marcar esta mensagem como resolvida?')) return;
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

  // --- Deleção ---
  async function handleDeleteEmpresa(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta empresa? Todos os locais vinculados a ela serão desvinculados.')) return;
    
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchData();
    }
  }

  // --- Criação Rápida de Empresa (Para popular o Guia) ---
  async function handleAddEmpresa(e: React.FormEvent) {
    e.preventDefault();
    setLoadingCriar(true);
    
    const { error } = await supabase.from('companies').insert([{
      name: nome,
      document: documento,
      contact_email: email,
      contact_phone: telefone,
      is_claimed: false 
    }]);

    setLoadingCriar(false);
    
    if (error) {
      alert('Erro ao cadastrar empresa: ' + error.message);
    } else {
      setNome('');
      setDocumento('');
      setEmail('');
      setTelefone('');
      setIsModalOpen(false);
      fetchData();
      alert('Empresa adicionada com sucesso!');
    }
  }

  const TabButton = ({ id, label, icon, badge }: { id: any, label: string, icon: React.ReactNode, badge?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: activeTab === id ? '#fff' : 'transparent',
        color: activeTab === id ? 'var(--primary-color)' : '#64748b',
        border: 'none',
        borderBottom: activeTab === id ? '3px solid var(--primary-color)' : '3px solid transparent',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '1rem',
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      {icon} {label}
      {badge ? (
        <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px' }}>
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#2c3e50', letterSpacing: '-0.5px' }}>Empresas & Entidades</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '6px' }}>
            Gerencie o diretório, aprove reivindicações e atenda solicitações de contato.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 20px', 
            backgroundColor: 'var(--primary-color, #ff6b6b)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'transform 0.1s, opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={18} /> Cadastrar para o Guia
        </button>
      </div>
      
      {/* Sistema de Abas */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <TabButton id="list" label="Listagem Geral" icon={<Building2 size={18} />} />
        <TabButton id="claims" label="Aprovações (Claims)" icon={<UserCheck size={18} />} badge={claims.length > 0 ? claims.length : undefined} />
        <TabButton id="messages" label="Fale Conosco" icon={<MessageSquare size={18} />} badge={messages.filter(m => m.status === 'pending').length > 0 ? messages.filter(m => m.status === 'pending').length : undefined} />
      </div>

      {/* Conteúdo das Abas */}
      <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        
        {/* ABA: LISTAGEM */}
        {activeTab === 'list' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Nome / Razão Social</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Documento</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Contato</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Reivindicada?</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
                ) : empresas.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '1.05rem' }}>Nenhuma empresa cadastrada no momento.</td></tr>
                ) : empresas.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#334155' }}>{emp.name}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>{emp.document || '-'}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>{emp.contact_email || 'S/ E-mail'}</span>
                        <span style={{ fontSize: '0.85rem' }}>{emp.contact_phone || 'S/ Telefone'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>
                      {emp.is_claimed ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#51cf66', backgroundColor: '#eefaf1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Sim
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fcc419', backgroundColor: '#fff9e6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <XCircle size={14} /> Não
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteEmpresa(emp.id)} 
                        style={{ 
                          color: '#ef4444', 
                          border: 'none', 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          cursor: 'pointer', 
                          padding: '8px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s'
                        }}
                        title="Excluir"
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ABA: CLAIMS (Aprovações) */}
        {activeTab === 'claims' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(245, 159, 0, 0.1)', borderRadius: '8px' }}>
                <AlertCircle size={20} color="#f59f00" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b' }}>Solicitações Pendentes</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Usuários querendo assumir o controle de uma empresa.</p>
              </div>
            </div>
            
            {fetching ? (
              <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: '#94a3b8' }} /></div>
            ) : claims.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Não há solicitações de reivindicação pendentes no momento.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {claims.map(claim => (
                  <div key={claim.id} style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>{claim.companies?.name}</span>
                        <span style={{ fontSize: '0.85rem', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px' }}>CNPJ: {claim.companies?.document || 'N/A'}</span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '8px' }}>
                        <strong>Solicitado por:</strong> {claim.profiles?.full_name || 'Usuário Desconhecido'}
                      </p>
                      {claim.message && (
                        <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f59f00', fontSize: '0.9rem', color: '#78350f' }}>
                          <strong>Mensagem:</strong> "{claim.message}"
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleApprove(claim)}
                        disabled={processingId === claim.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#51cf66', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s', opacity: processingId === claim.id ? 0.7 : 1 }}
                      >
                        {processingId === claim.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />} Aprovar
                      </button>
                      <button 
                        onClick={() => handleReject(claim.id)}
                        disabled={processingId === claim.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'background-color 0.2s', opacity: processingId === claim.id ? 0.7 : 1 }}
                      >
                        <X size={18} /> Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: MENSAGENS (Fale Conosco) */}
        {activeTab === 'messages' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                <MessageSquare size={20} color="#3b82f6" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b' }}>Caixa de Entrada (Fale Conosco)</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Mensagens, dúvidas e reportes dos usuários do site.</p>
              </div>
            </div>

            {fetching ? (
              <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: '#94a3b8' }} /></div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>A caixa de entrada está vazia. Nenhuma mensagem recebida ainda.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', opacity: msg.status === 'resolved' ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 700, marginBottom: '4px' }}>{msg.subject || 'Sem Assunto'}</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>De: {msg.name} ({msg.email}) • Tel: {msg.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', textAlign: 'right', marginBottom: '8px' }}>
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                        {msg.status === 'pending' ? (
                          <button 
                            onClick={() => handleResolveMessage(msg.id)}
                            disabled={processingId === msg.id}
                            style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle2 size={14} /> Marcar como Resolvido
                          </button>
                        ) : (
                          <span style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Resolvido
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', color: '#334155', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO RÁPIDA DE EMPRESA */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '600px', borderRadius: '16px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>Cadastrar Empresa para o Guia</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.5' }}>
              Use este formulário para preencher o guia da cidade antecipadamente. As empresas criadas por aqui aparecerão como <strong>"Não Reivindicadas"</strong>. Depois, os donos reais poderão acessar a página da empresa e clicar em <em>"Reivindicar esta empresa"</em>.
            </p>

            <form onSubmit={handleAddEmpresa} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Razão Social / Nome da Empresa *</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
                  placeholder="Ex: Pizzaria do João" 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>CNPJ / CPF</label>
                <input 
                  type="text" 
                  value={documento} 
                  onChange={e => setDocumento(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
                  placeholder="Apenas números" 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Telefone Público</label>
                <input 
                  type="text" 
                  value={telefone} 
                  onChange={e => setTelefone(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
                  placeholder="(00) 00000-0000" 
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>E-mail Público</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
                  placeholder="contato@empresa.com" 
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loadingCriar} 
                  style={{ padding: '12px 24px', backgroundColor: 'var(--primary-color, #ff6b6b)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: loadingCriar ? 0.7 : 1 }}
                >
                  {loadingCriar ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : 'Criar Empresa Oficial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
