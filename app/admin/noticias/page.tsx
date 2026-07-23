'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit2, Plus, Loader2, X, Newspaper, Image as ImageIcon } from 'lucide-react';

const CATEGORIAS_SUGERIDAS = [
  'Geral',
  'Cidade',
  'Infraestrutura',
  'Eventos',
  'Saúde',
  'Educação',
  'Cultura',
  'Esporte',
  'Turismo'
];

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [resumo, setResumo] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [imagemUrl, setImagemUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSessionAndNews();
  }, []);

  async function fetchSessionAndNews() {
    setFetching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }

      let rawData: any[] | null = null;
      let err: any = null;

      // 1. Tentar buscar em 'noticias' com join de profiles
      const resJoin = await supabase
        .from('noticias')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (!resJoin.error && resJoin.data && resJoin.data.length > 0) {
        rawData = resJoin.data;
      } else {
        // 2. Se join com profiles falhar ou retornar 0 registros, tentar select('*') em 'noticias'
        const resSimple = await supabase
          .from('noticias')
          .select('*')
          .order('created_at', { ascending: false });

        if (!resSimple.error && resSimple.data && resSimple.data.length > 0) {
          rawData = resSimple.data;
        }
      }

      if (rawData && rawData.length > 0) {
        let processed: any[] = rawData.map((n: any) => ({
          ...n,
          id: n.id,
          titulo: n.titulo || n.title || 'Sem título',
          conteudo: n.conteudo || n.content || '',
          resumo: n.resumo || (n.conteudo || n.content || '').substring(0, 120) + '...',
          categoria: n.categoria || n.category || 'Geral',
          imagem_url: n.imagem_url || n.image_url || n.capa || '',
          autor_id: n.autor_id || n.user_id || n.author_id,
          autor_nome: n.profiles?.full_name || n.autor || 'Administrador',
          created_at: n.created_at || n.published_at || n.data_publicacao || new Date().toISOString()
        }));

        // Buscar nomes de perfil para autores não identificados se houver autor_id
        const missingUserIds = Array.from(
          new Set(
            processed
              .filter(item => item.autor_id && (item.autor_nome === 'Administrador' || !item.autor_nome))
              .map(item => item.autor_id)
          )
        );

        if (missingUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', missingUserIds);

          if (profiles && profiles.length > 0) {
            const profileMap = new Map(profiles.map(p => [p.id, p.full_name]));
            processed = processed.map(item => ({
              ...item,
              autor_nome: profileMap.get(item.autor_id) || item.autor_nome
            }));
          }
        }

        setNoticias(processed);
      } else {
        setNoticias([]);
      }
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      setNoticias([]);
    } finally {
      setFetching(false);
    }
  }

  async function handleAddNoticia(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoading(true);

    const rawSlug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'noticia';

    const slugUnico = editId ? rawSlug : `${rawSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const payloadPt = {
      titulo, 
      conteudo,
      resumo: resumo || (conteudo.substring(0, 120) + '...'),
      categoria: categoria || 'Geral',
      slug: slugUnico,
      imagem_url: imagemUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80',
      data_publicacao: new Date().toISOString()
    };

    let savedSuccessfully = false;
    let lastError: any = null;

    if (editId) {
      const { error: errPt } = await supabase
        .from('noticias')
        .update({
          titulo: payloadPt.titulo,
          conteudo: payloadPt.conteudo,
          resumo: payloadPt.resumo,
          categoria: payloadPt.categoria,
          imagem_url: payloadPt.imagem_url
        })
        .eq('id', editId);

      if (!errPt) {
        savedSuccessfully = true;
      } else {
        lastError = errPt;
      }
    } else {
      const authorKeys = ['autor_id', 'user_id', 'author_id', null];

      for (const key of authorKeys) {
        const payload: any = { ...payloadPt };
        if (key) payload[key] = userId;

        const { error } = await supabase.from('noticias').insert([payload]);
        if (!error) {
          savedSuccessfully = true;
          break;
        }
        lastError = error;

        if (error.message?.includes('duplicate key') || error.message?.includes('slug')) {
          payload.slug = `${rawSlug}-${Date.now()}`;
          const { error: errRetry } = await supabase.from('noticias').insert([payload]);
          if (!errRetry) {
            savedSuccessfully = true;
            break;
          }
        }
      }
    }

    setLoading(false);

    if (!savedSuccessfully && lastError) {
      alert('Erro ao salvar notícia: ' + (lastError.message || JSON.stringify(lastError)));
    } else {
      handleCancelEdit();
      fetchSessionAndNews();
    }
  }

  function handleEdit(noticia: any) {
    setEditId(noticia.id);
    setTitulo(noticia.titulo || noticia.title || '');
    setConteudo(noticia.conteudo || noticia.content || '');
    setResumo(noticia.resumo || '');
    setCategoria(noticia.categoria || 'Geral');
    setImagemUrl(noticia.imagem_url || noticia.image_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditId(null);
    setTitulo('');
    setConteudo('');
    setResumo('');
    setCategoria('Geral');
    setImagemUrl('');
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.')) return;
    
    let { error } = await supabase.from('noticias').delete().eq('id', id);
    
    if (error) {
      alert('Erro ao excluir notícia: ' + error.message);
    } else {
      if (editId === id) {
        handleCancelEdit();
      }
      fetchSessionAndNews();
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#2c3e50', letterSpacing: '-0.5px' }}>Notícias</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '6px' }}>
          Publique, edite e gerencie as informações e novidades para os cidadãos.
        </p>
      </div>
      
      {/* Form Section */}
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '30px', 
        borderRadius: '16px', 
        marginBottom: '40px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: editId ? '2px solid #fcc419' : '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', backgroundColor: editId ? 'rgba(252, 196, 25, 0.2)' : 'rgba(252, 196, 25, 0.1)', borderRadius: '8px' }}>
              {editId ? <Edit2 size={20} color="#d97706" /> : <Plus size={20} color="#fcc419" />}
            </div>
            {editId ? 'Editar Notícia' : 'Publicar Nova Notícia'}
          </h3>
          {editId && (
            <button 
              type="button" 
              onClick={handleCancelEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <X size={16} /> Cancelar Edição
            </button>
          )}
        </div>
        
        <form onSubmit={handleAddNoticia} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                Título da Notícia *
              </label>
              <input 
                type="text" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
                placeholder="Ex: Nova praça central é inaugurada nesta sexta" 
                onFocus={(e) => e.target.style.borderColor = '#fcc419'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                Categoria *
              </label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', backgroundColor: '#fff' }}
                onFocus={(e) => e.target.style.borderColor = '#fcc419'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                {CATEGORIAS_SUGERIDAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Resumo / Chamada (Opcional)
            </label>
            <input 
              type="text" 
              value={resumo} 
              onChange={e => setResumo(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
              placeholder="Uma breve síntese para aparecer nos cards da notícia" 
              onFocus={(e) => e.target.style.borderColor = '#fcc419'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Conteúdo / Matéria Completa *
            </label>
            <textarea 
              value={conteudo} 
              onChange={e => setConteudo(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', minHeight: '150px', fontFamily: 'inherit', outline: 'none', lineHeight: 1.6 }} 
              placeholder="Escreva o texto completo da publicação..." 
              onFocus={(e) => e.target.style.borderColor = '#fcc419'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              URL da Imagem de Capa
            </label>
            <input 
              type="url" 
              value={imagemUrl} 
              onChange={e => setImagemUrl(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
              placeholder="https://images.unsplash.com/..." 
              onFocus={(e) => e.target.style.borderColor = '#fcc419'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            {imagemUrl && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagemUrl} alt="Prévia" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Prévia da imagem de capa</span>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: '12px 28px', 
                backgroundColor: editId ? '#d97706' : '#fcc419', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
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
                  fontSize: '1rem'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={20} color="#64748b" /> Notícias Publicadas ({noticias.length})
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Título</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoria</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Autor</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
                </td>
              </tr>
            ) : noticias.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '1.05rem' }}>
                  Nenhuma notícia publicada.
                </td>
              </tr>
            ) : noticias.map(noticia => (
              <tr key={noticia.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s', backgroundColor: editId === noticia.id ? 'rgba(252, 196, 25, 0.08)' : 'transparent' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#334155', maxWidth: '320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {noticia.imagem_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={noticia.imagem_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ImageIcon size={18} color="#94a3b8" />
                      </div>
                    )}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={noticia.titulo}>
                      {noticia.titulo}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {noticia.categoria}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.9rem' }}>
                  {noticia.autor_nome}
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.9rem' }}>
                  {new Date(noticia.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => handleEdit(noticia)} 
                      style={{ 
                        color: '#d97706', 
                        border: 'none', 
                        background: 'rgba(217, 119, 6, 0.1)', 
                        cursor: 'pointer', 
                        padding: '8px 12px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'background-color 0.2s'
                      }}
                      title="Editar notícia"
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(noticia.id)} 
                      style={{ 
                        color: '#ef4444', 
                        border: 'none', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        cursor: 'pointer', 
                        padding: '8px 12px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'background-color 0.2s'
                      }}
                      title="Excluir notícia"
                    >
                      <Trash2 size={16} /> Excluir
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

