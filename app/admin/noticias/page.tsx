'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNoticias();
  }, []);

  async function fetchNoticias() {
    const { data, error } = await supabase.from('noticias').select('*').order('created_at', { ascending: false });
    if (data) setNoticias(data);
    if (error) console.error(error);
  }

  async function handleAddNoticia(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dadosNoticia = {
      titulo, 
      slug, 
      resumo, 
      conteudo: 'Conteúdo detalhado da notícia (em breve)', 
      imagem_url: imagemUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80',
      categoria: 'Geral'
    };
    
    let error;

    if (editId) {
      const { error: err } = await supabase.from('noticias').update(dadosNoticia).eq('id', editId);
      error = err;
    } else {
      const { error: err } = await supabase.from('noticias').insert([dadosNoticia]);
      error = err;
    }

    setLoading(false);
    
    if (error) {
      alert('Erro ao salvar notícia: ' + error.message);
    } else {
      handleCancelEdit();
      fetchNoticias();
    }
  }

  function handleEdit(noticia: any) {
    setEditId(noticia.id);
    setTitulo(noticia.titulo);
    setResumo(noticia.resumo || '');
    setImagemUrl(noticia.imagem_url || '');
  }

  function handleCancelEdit() {
    setEditId(null);
    setTitulo('');
    setResumo('');
    setImagemUrl('');
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
    
    const { error } = await supabase.from('noticias').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchNoticias();
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Gestão de Notícias</h1>
      
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '15px' }}>{editId ? 'Editar Notícia' : 'Adicionar Nova Notícia'}</h3>
        <form onSubmit={handleAddNoticia} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Título da Notícia</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Ex: Nova praça inaugurada" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Descrição da Matéria</label>
            <textarea value={resumo} onChange={e => setResumo(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }} placeholder="Escreva a descrição ou o conteúdo principal da matéria." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>URL da Imagem de Capa</label>
            <input type="text" value={imagemUrl} onChange={e => setImagemUrl(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="https://..." />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Salvando...' : (editId ? 'Salvar Alterações' : '+ Adicionar Notícia')}
            </button>
            {editId && (
              <button type="button" onClick={handleCancelEdit} style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9f9f9' }}>
            <tr>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Título</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Data</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {noticias.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Nenhuma notícia cadastrada.</td></tr>
            ) : noticias.map(noticia => (
              <tr key={noticia.id}>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{noticia.titulo}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{new Date(noticia.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <button onClick={() => handleEdit(noticia)} style={{ color: '#0066cc', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}>Editar</button>
                  <button onClick={() => handleDelete(noticia.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
