'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, LogOut, Save, Camera } from 'lucide-react';

export default function Perfil() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
            <User size={32} /> Meu Perfil
          </h1>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}>
            <LogOut size={18} /> Sair
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--bg-light)', padding: '40px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid #eaeaea' }}>
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Nome Completo</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo" 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000" 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Endereço</label>
                <input 
                  type="text" 
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade" 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
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
      </div>
    </main>
  );
}
