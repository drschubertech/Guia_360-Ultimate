'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, LogOut, Save, Camera } from 'lucide-react';

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
    return <div style={{ padding: '100px', textAlign: 'center' }}>Carregando perfil...</div>;
  }

  return (
    <main style={{ padding: '60px 20px', backgroundColor: 'var(--bg-offwhite)', minHeight: 'calc(100vh - 200px)' }}>
      <style>{`
        .perfil-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .perfil-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid var(--border-color);
        }
        .perfil-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        @media (max-width: 768px) {
          .perfil-grid {
            grid-template-columns: 1fr;
          }
          .perfil-header {
            flex-direction: column;
            text-align: center;
          }
          .perfil-title {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          .perfil-actions {
            display: none !important;
          }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div className="perfil-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
            <User size={32} /> Meu Perfil
          </h1>
          <div className="perfil-actions" style={{ display: 'flex', gap: '10px' }}>
            {isAdmin && (
              <button onClick={() => router.push('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>
                Painel Admin
              </button>
            )}
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-light)', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
          <div className="perfil-header">
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.email?.charAt(0).toUpperCase()
                )}
              </div>
              <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: 'var(--primary-color)' }}>
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
            <div>
              <h2 style={{ marginBottom: '5px' }}>{nome || 'Usuário'}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>Informações Pessoais</h3>
            
            <div className="perfil-grid">
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Nome de Usuário (Como aparecerá no site)</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo" 
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000" 
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Endereço</label>
                <input 
                  type="text" 
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade" 
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                type="submit" 
                className="btn-theme" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', opacity: saving ? 0.7 : 1 }}
                disabled={saving}
              >
                <Save size={20} />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* Minhas Mensagens e Solicitações */}
        <div style={{ backgroundColor: 'var(--bg-light)', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', marginTop: '40px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             📬 Minhas Solicitações e Mensagens
          </h3>
          
          {messages.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Você ainda não enviou nenhuma solicitação ou reivindicação.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: msg.status === 'resolved' ? '#f8fafc' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{msg.subject}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    {msg.status === 'resolved' ? (
                      <span style={{ padding: '4px 10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 'bold' }}>Resolvido</span>
                    ) : (
                      <span style={{ padding: '4px 10px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 'bold' }}>Em Análise</span>
                    )}
                  </div>
                  
                  <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                    <strong>Sua Mensagem:</strong><br />
                    {msg.message}
                  </div>

                  {msg.status === 'resolved' && msg.resposta_admin && (
                    <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #10b981', fontSize: '0.95rem' }}>
                      <strong style={{ color: '#065f46', display: 'block', marginBottom: '5px' }}>Resposta da Administração:</strong>
                      <span style={{ color: '#064e3b', whiteSpace: 'pre-wrap' }}>{msg.resposta_admin}</span>
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
