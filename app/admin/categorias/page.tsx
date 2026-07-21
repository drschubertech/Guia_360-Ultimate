'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Loader2 } from 'lucide-react';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    setFetching(true);
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (data) setCategorias(data);
    if (error) console.error(error);
    setFetching(false);
  }

  async function handleAddCategoria(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const { error } = await supabase.from('categorias').insert([{
      nome: nome, 
      slug, 
      icone: icone
    }]);

    setLoading(false);
    
    if (error) {
      alert('Erro ao criar categoria: ' + error.message);
    } else {
      setNome('');
      setIcone('');
      fetchCategorias();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria? As subcategorias atreladas também poderão ser removidas.')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchCategorias();
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#2c3e50', letterSpacing: '-0.5px' }}>Categorias</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '6px' }}>
          Gerencie as categorias principais do guia.
        </p>
      </div>
      
      {/* Formulário de Adição */}
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px' }}>
            <Plus size={18} color="var(--primary-color, #ff6b6b)" />
          </div>
          Nova Categoria
        </h3>
        
        <form onSubmit={handleAddCategoria} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Nome da Categoria</label>
            <input 
              type="text" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
              placeholder="Ex: Alimentação" 
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color, #ff6b6b)'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Ícone (Nome do Lucide)</label>
            <input 
              type="text" 
              value={icone} 
              onChange={e => setIcone(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
              placeholder="Ex: Utensils" 
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color, #ff6b6b)'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          
          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: '12px 24px', 
                backgroundColor: 'var(--primary-color, #ff6b6b)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s, transform 0.1s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fa5252'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color, #ff6b6b)'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : 'Adicionar Categoria'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Categorias */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Nome</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Slug</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Ícone</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
            ) : categorias.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '1.05rem' }}>Nenhuma categoria cadastrada.</td></tr>
            ) : categorias.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#334155' }}>{cat.nome}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{cat.slug}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>{cat.icone || '-'}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(cat.id)} 
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
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .animate-spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    </div>
  );
}
