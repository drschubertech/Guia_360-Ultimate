'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit2, Plus, Loader2 } from 'lucide-react';

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSessionAndNews();
  }, []);

  async function fetchSessionAndNews() {
    setFetching(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
    }
    
    const { data, error } = await supabase.from('news').select('*, profiles(full_name)').order('created_at', { ascending: false });
    if (data) setNoticias(data);
    if (error) console.error(error);
    setFetching(false);
  }

  async function handleAddNoticia(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }
    
    setLoading(true);
    
    const dadosNoticia = {
      title: titulo, 
      content: conteudo, 
      image_url: imagemUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80',
      author_id: userId,
      published_at: new Date().toISOString()
    };
    
    let error;

    if (editId) {
      const { error: err } = await supabase.from('news').update(dadosNoticia).eq('id', editId);
      error = err;
    } else {
      const { error: err } = await supabase.from('news').insert([dadosNoticia]);
      error = err;
    }

    setLoading(false);
    
    if (error) {
      alert('Erro ao salvar notícia: ' + error.message);
    } else {
      handleCancelEdit();
      fetchSessionAndNews();
    }
  }

  function handleEdit(noticia: any) {
    setEditId(noticia.id);
    setTitulo(noticia.title);
    setConteudo(noticia.content || '');
    setImagemUrl(noticia.image_url || '');
  }

  function handleCancelEdit() {
    setEditId(null);
    setTitulo('');
    setConteudo('');
    setImagemUrl('');
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
    
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchSessionAndNews();
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#2c3e50', letterSpacing: '-0.5px' }}>Notícias</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '6px' }}>
          Publique informações e novidades para os cidadãos.
        </p>
      </div>
      
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(252, 196, 25, 0.1)', borderRadius: '8px' }}>
            <Plus size={18} color="#fcc419" />
          </div>
          {editId ? 'Editar Notícia' : 'Publicar Nova Notícia'}
        </h3>
        
        <form onSubmit={handleAddNoticia} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Título da Notícia</label>
            <input 
              type="text" 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
              placeholder="Ex: Nova praça inaugurada" 
              onFocus={(e) => e.target.style.borderColor = '#fcc419'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Conteúdo / Matéria</label>
            <textarea 
              value={conteudo} 
              onChange={e => setConteudo(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', minHeight: '120px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }} 
              placeholder="Escreva o conteúdo completo da notícia." 
              onFocus={(e) => e.target.style.borderColor = '#fcc419'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>URL da Imagem de Capa</label>
            <input 
              type="text" 
              value={imagemUrl} 
              onChange={e => setImagemUrl(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
              placeholder="https://..." 
              onFocus={(e) => e.target.style.borderColor = '#fcc419'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#fcc419', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fab005'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fcc419'}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : (editId ? 'Salvar Alterações' : 'Publicar Notícia')}
            </button>

            {editId && (
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#f1f5f9', 
                  color: '#475569', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Título</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Autor</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Data</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
            ) : noticias.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '1.05rem' }}>Nenhuma notícia publicada.</td></tr>
            ) : noticias.map(noticia => (
              <tr key={noticia.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#334155' }}>{noticia.title}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{noticia.profiles?.full_name || 'Desconhecido'}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{new Date(noticia.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => handleEdit(noticia)} 
                      style={{ 
                        color: '#3b82f6', 
                        border: 'none', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        cursor: 'pointer', 
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                      }}
                      title="Editar"
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(noticia.id)} 
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .animate-spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    </div>
  );
}
