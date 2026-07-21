'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, LogOut, Save, Camera, Mail, Phone, MapPin, ShieldCheck, Inbox, CheckCircle2, Clock, Loader2, Shield } from 'lucide-react';

export default function Perfil() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Dados do formulário
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      
      // Se houver metadados no usuário, carrega no formulário
      if (session.user.user_metadata) {
        setNome(session.user.user_metadata.nome || '');
        setTelefone(session.user.user_metadata.telefone || '');
        setEndereco(session.user.user_metadata.endereco || '');
        setAvatarUrl(session.user.user_metadata.avatar_url || '');
      }

      // Checar se é admin
      try {
        const { data: profile } = await supabase.from('profiles').select('role_id').eq('id', session.user.id).single();
        if (profile?.role_id) {
          const { data: role } = await supabase.from('user_roles').select('name').eq('id', profile.role_id).single();
          if (role?.name === 'admin') setIsAdmin(true);
        }
      } catch (err) {
        console.error(err);
      }
      
      // Buscar mensagens e reivindicações do usuário
      try {
        const { data: msgData, error: msgError } = await supabase
          .from('contact_messages')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (msgData) setMessages(msgData);
      } catch (err) {
        console.error(err);
      }
      
      setLoading(false);
    }
    
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let finalAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }

      // Atualiza os metadados do usuário no Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          nome,
          telefone,
          endereco,
          avatar_url: finalAvatarUrl
        }
      });
      
      if (error) throw error;
      
      // Dispara um evento para o Header atualizar imediatamente
      window.dispatchEvent(new Event('userUpdated'));
      
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      alert('Erro ao atualizar perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-offwhite)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} style={{ animation: 'pf-spin 0.8s linear infinite', display: 'block', margin: '0 auto 12px' }} />
          <span style={{ fontSize: '0.95rem' }}>Carregando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="pf-page">
      <style>{`
        @keyframes pf-spin { to { transform: rotate(360deg); } }
        .pf-spin { animation: pf-spin 0.8s linear infinite; }
        @keyframes pf-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pf-page {
          padding: 48px 20px 80px;
          background-color: var(--bg-offwhite);
          min-height: calc(100vh - 140px);
        }

        .pf-container {
          max-width: 820px;
          margin: 0 auto;
          animation: pf-fadein 0.3s ease-out;
        }

        /* ── Top Bar / Header ── */
        .pf-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pf-page-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.6rem;
          font-weight: 800;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .pf-page-title-icon {
          color: var(--primary-color);
        }

        .pf-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pf-btn-admin {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background-color: var(--primary-color);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.875rem;
          font-family: inherit;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: var(--shadow-sm);
        }

        .pf-btn-admin:hover {
          background-color: var(--primary-color-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .pf-btn-logout {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background-color: #fef2f2;
          color: #dc2626;
          border: 1.5px solid #fecaca;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.875rem;
          font-family: inherit;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .pf-btn-logout:hover {
          background-color: #fee2e2;
          border-color: #fca5a5;
        }

        /* ── Card Base ── */
        .pf-card {
          background-color: var(--bg-light);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          padding: 36px;
          margin-bottom: 28px;
        }

        /* ── Profile User Header ── */
        .pf-header {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-bottom: 28px;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border-color);
        }

        .pf-avatar-container {
          position: relative;
          flex-shrink: 0;
        }

        .pf-avatar-circle {
          width: 96px;
          height: 96px;
          background-color: var(--primary-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 2.4rem;
          font-weight: 800;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
          border: 3px solid var(--bg-light);
        }

        .pf-avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pf-avatar-label {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background-color: var(--bg-light);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          color: var(--primary-color);
          border: 1.5px solid var(--border-color);
          transition: transform 0.15s ease, background-color 0.2s ease;
        }

        .pf-avatar-label:hover {
          transform: scale(1.08);
          background-color: var(--primary-light);
        }

        .pf-user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pf-user-name {
          font-size: 1.4rem;
          font-weight: 800;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0;
        }

        .pf-user-email {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pf-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: var(--primary-light);
          color: var(--primary-color);
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-top: 6px;
          align-self: flex-start;
        }

        .pf-role-badge-admin {
          background-color: #fef3c7;
          color: #92400e;
        }

        /* ── Form Section ── */
        .pf-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 20px;
          font-family: var(--font-outfit), sans-serif;
        }

        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .pf-grid-full {
          grid-column: 1 / -1;
        }

        .pf-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pf-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pf-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .pf-input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-tertiary);
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .pf-input {
          width: 100%;
          padding: 11px 14px 11px 42px;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          box-sizing: border-box;
        }

        .pf-input::placeholder {
          color: var(--text-tertiary);
        }

        .pf-input:hover {
          border-color: #d1d5db;
        }

        .pf-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-light);
          background-color: var(--bg-light);
        }

        .pf-input:focus + .pf-input-icon,
        .pf-input-wrap:focus-within .pf-input-icon {
          color: var(--primary-color);
        }

        .pf-submit-wrap {
          display: flex;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .pf-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background-color: var(--primary-color);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.925rem;
          font-family: inherit;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .pf-submit-btn:hover:not(:disabled) {
          background-color: var(--primary-color-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .pf-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Section Mensagens ── */
        .pf-msg-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pf-msg-item {
          padding: 20px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-light);
          transition: box-shadow 0.2s ease;
        }

        .pf-msg-item.resolved {
          background-color: #fafafa;
        }

        .pf-msg-item:hover {
          box-shadow: var(--shadow-sm);
        }

        .pf-msg-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .pf-msg-subject {
          margin: 0 0 4px;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 700;
        }

        .pf-msg-date {
          font-size: 0.78rem;
          color: var(--text-tertiary);
        }

        .pf-badge-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .pf-badge-resolved {
          background-color: #dcfce7;
          color: #15803d;
        }

        .pf-badge-pending {
          background-color: #fef9c3;
          color: #92400e;
        }

        .pf-msg-box {
          padding: 12px 14px;
          background-color: var(--bg-offwhite);
          border-radius: var(--radius-sm);
          font-size: 0.885rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
          line-height: 1.5;
          border-left: 3px solid var(--border-color);
        }

        .pf-msg-box strong {
          color: var(--text-primary);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .pf-msg-reply {
          padding: 14px 16px;
          background-color: #ecfdf5;
          border-radius: var(--radius-sm);
          border-left: 3px solid #10b981;
          font-size: 0.9rem;
        }

        .pf-msg-reply-title {
          color: #065f46;
          font-weight: 700;
          font-size: 0.825rem;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .pf-msg-reply-text {
          color: #064e3b;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .pf-empty-msg {
          color: var(--text-secondary);
          font-size: 0.9rem;
          text-align: center;
          padding: 24px 0;
          margin: 0;
        }

        /* ── Responsividade Mobile ── */
        @media (max-width: 768px) {
          .pf-page {
            padding: 24px 16px 60px;
          }
          .pf-card {
            padding: 24px 20px;
          }
          .pf-grid {
            grid-template-columns: 1fr;
          }
          .pf-grid-full {
            grid-column: 1;
          }
          .pf-header {
            flex-direction: column;
            text-align: center;
            align-items: center;
            gap: 16px;
          }
          .pf-role-badge {
            align-self: center;
          }
          .pf-topbar {
            flex-direction: column;
            align-items: flex-start;
          }
          .pf-actions {
            width: 100%;
            justify-content: flex-start;
          }
          .pf-submit-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="pf-container">
        
        {/* Top Header */}
        <div className="pf-topbar">
          <h1 className="pf-page-title">
            <User size={28} className="pf-page-title-icon" /> Meu Perfil
          </h1>
          <div className="pf-actions">
            {isAdmin && (
              <button 
                onClick={() => router.push('/admin')} 
                className="pf-btn-admin"
              >
                <Shield size={16} /> Painel Admin
              </button>
            )}
            <button 
              onClick={handleLogout} 
              className="pf-btn-logout"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="pf-card">
          <div className="pf-header">
            <div className="pf-avatar-container">
              <div className="pf-avatar-circle">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" />
                ) : (
                  user?.email?.charAt(0).toUpperCase()
                )}
              </div>
              <label htmlFor="avatar-upload" className="pf-avatar-label" title="Alterar foto de perfil">
                <Camera size={16} />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAvatarFile(e.target.files[0]);
                      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }} 
                />
              </label>
            </div>
            <div className="pf-user-info">
              <h2 className="pf-user-name">{nome || 'Usuário'}</h2>
              <p className="pf-user-email">
                <Mail size={14} /> {user?.email}
              </p>
              {isAdmin ? (
                <span className="pf-role-badge pf-role-badge-admin">
                  <ShieldCheck size={12} /> Administrador
                </span>
              ) : (
                <span className="pf-role-badge">
                  <User size={12} /> Cidadão
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSave}>
            <h3 className="pf-section-title">Informações Pessoais</h3>
            
            <div className="pf-grid">
              <div>
                <label className="pf-label" htmlFor="nome-input">Nome de Usuário (Como aparecerá no site)</label>
                <div className="pf-input-wrap">
                  <User size={18} className="pf-input-icon" />
                  <input 
                    id="nome-input"
                    type="text" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo" 
                    className="pf-input"
                  />
                </div>
              </div>

              <div>
                <label className="pf-label" htmlFor="telefone-input">Telefone / WhatsApp</label>
                <div className="pf-input-wrap">
                  <Phone size={18} className="pf-input-icon" />
                  <input 
                    id="telefone-input"
                    type="text" 
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000" 
                    className="pf-input"
                  />
                </div>
              </div>

              <div className="pf-grid-full">
                <label className="pf-label" htmlFor="endereco-input">Endereço</label>
                <div className="pf-input-wrap">
                  <MapPin size={18} className="pf-input-icon" />
                  <input 
                    id="endereco-input"
                    type="text" 
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, Número, Bairro, Cidade" 
                    className="pf-input"
                  />
                </div>
              </div>
            </div>

            <div className="pf-submit-wrap">
              <button 
                type="submit" 
                className="pf-submit-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="pf-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Minhas Mensagens e Solicitações Card */}
        <div className="pf-card">
          <h3 className="pf-section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Inbox size={20} className="pf-page-title-icon" /> Minhas Solicitações e Mensagens
          </h3>
          
          {messages.length === 0 ? (
            <p className="pf-empty-msg">Você ainda não enviou nenhuma solicitação ou reivindicação.</p>
          ) : (
            <div className="pf-msg-list">
              {messages.map(msg => (
                <div key={msg.id} className={`pf-msg-item ${msg.status === 'resolved' ? 'resolved' : ''}`}>
                  <div className="pf-msg-header">
                    <div>
                      <h4 className="pf-msg-subject">{msg.subject || 'Sem Assunto'}</h4>
                      <span className="pf-msg-date">{new Date(msg.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                    {msg.status === 'resolved' ? (
                      <span className="pf-badge-status pf-badge-resolved">
                        <CheckCircle2 size={13} /> Resolvido
                      </span>
                    ) : (
                      <span className="pf-badge-status pf-badge-pending">
                        <Clock size={13} /> Em Análise
                      </span>
                    )}
                  </div>
                  
                  <div className="pf-msg-box">
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Sua Mensagem:</strong>
                    {msg.message}
                  </div>

                  {msg.status === 'resolved' && msg.resposta_admin && (
                    <div className="pf-msg-reply">
                      <div className="pf-msg-reply-title">
                        <CheckCircle2 size={14} /> Resposta da Administração:
                      </div>
                      <div className="pf-msg-reply-text">{msg.resposta_admin}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
