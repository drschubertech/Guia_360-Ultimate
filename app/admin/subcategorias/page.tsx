'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Loader2 } from 'lucide-react';

export default function AdminSubcategorias() {
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  
  const [nome, setNome] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setFetching(true);
    
    // Buscar categorias para o select
    const { data: catData } = await supabase.from('categorias').select('*').order('nome');
    if (catData) {
      setCategorias(catData);
      if (catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].id);
      }
    }

    // Buscar subcategorias com os nomes das categorias
    const { data: subData, error } = await supabase
      .from('subcategorias')
      .select(`
        *,
        categorias (
          nome
        )
      `)
      .order('nome');
      
    if (subData) setSubcategorias(subData);
    if (error) console.error(error);
    
    setFetching(false);
  }

  async function handleAddSubcategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      alert("Por favor, selecione uma categoria principal.");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from('subcategorias').insert([{
      nome: nome.trim(), 
      categoria_id: categoryId
    }]);

    setLoading(false);
    
    if (error) {
      alert('Erro ao criar subcategoria: ' + error.message);
    } else {
      setNome('');
      fetchData();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria? As empresas atreladas a ela poderão ficar sem subcategoria.')) return;
    
    const { error } = await supabase.from('subcategorias').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchData();
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#2c3e50', letterSpacing: '-0.5px' }}>Subcategorias</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '6px' }}>
          Gerencie as subcategorias para refinar a busca no guia.
        </p>
      </div>
      
      {/* Formulário de Adição */}
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(77, 171, 247, 0.1)', borderRadius: '8px' }}>
            <Plus size={18} color="#4dabf7" />
          </div>
          Nova Subcategoria
        </h3>
        
        <form onSubmit={handleAddSubcategoria} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Categoria Principal</label>
            <select 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)} 
              required
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', backgroundColor: '#fff', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#4dabf7'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              {categorias.length === 0 && <option value="">Nenhuma categoria cadastrada</option>}
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Nome da Subcategoria</label>
            <input 
              type="text" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
              placeholder="Ex: Pizzaria" 
              onFocus={(e) => e.target.style.borderColor = '#4dabf7'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          
          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button 
              type="submit" 
              disabled={loading || categorias.length === 0} 
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#4dabf7', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: (loading || categorias.length === 0) ? 'not-allowed' : 'pointer', 
                fontWeight: 600,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s, transform 0.1s',
                opacity: (loading || categorias.length === 0) ? 0.7 : 1
              }}
              onMouseEnter={(e) => { if(!loading && categorias.length > 0) e.currentTarget.style.backgroundColor = '#339af0'; }}
              onMouseLeave={(e) => { if(!loading && categorias.length > 0) e.currentTarget.style.backgroundColor = '#4dabf7'; }}
              onMouseDown={(e) => { if(!loading && categorias.length > 0) e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { if(!loading && categorias.length > 0) e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : 'Adicionar Subcategoria'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Subcategorias */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Nome</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Categoria Principal</th>
              <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
            ) : subcategorias.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '1.05rem' }}>Nenhuma subcategoria cadastrada.</td></tr>
            ) : subcategorias.map(sub => (
              <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#334155' }}>{sub.nome}</td>
                <td style={{ padding: '16px 24px', color: '#64748b' }}>
                  <span style={{ backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {sub.categorias?.nome || 'Sem categoria'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(sub.id)} 
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
