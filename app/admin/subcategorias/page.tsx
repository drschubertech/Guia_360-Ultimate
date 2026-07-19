'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminSubcategorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: catData } = await supabase.from('categorias').select('id, nome, tipo').order('nome');
    if (catData) {
      setCategorias(catData);
      if (catData.length > 0 && !categoriaId) {
        setCategoriaId(catData[0].id);
      }
    }

    const { data: subData } = await supabase.from('subcategorias').select('*, categorias(nome)').order('nome');
    if (subData) setSubcategorias(subData);
  }

  async function handleAddSubcategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!categoriaId) return alert('Selecione uma categoria primeiro.');
    
    setLoading(true);
    
    const { error } = await supabase.from('subcategorias').insert([{
      nome, categoria_id: categoriaId
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
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return;
    
    const { error } = await supabase.from('subcategorias').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchData();
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Gestão de Subcategorias</h1>
      
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '15px' }}>Adicionar Nova Subcategoria</h3>
        <form onSubmit={handleAddSubcategoria} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Nome da Subcategoria</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Ex: Pizzaria" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Categoria Pai</label>
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="" disabled>Selecione uma categoria...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome} ({cat.tipo})</option>
              ))}
            </select>
          </div>
          
          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button type="submit" disabled={loading || categorias.length === 0} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Salvando...' : '+ Adicionar Subcategoria'}
            </button>
            {categorias.length === 0 && <p style={{ color: 'red', marginTop: '10px', fontSize: '0.85rem' }}>Cadastre ao menos uma Categoria primeiro.</p>}
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9f9f9' }}>
            <tr>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Subcategoria</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Categoria Pai</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {subcategorias.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Nenhuma subcategoria cadastrada.</td></tr>
            ) : subcategorias.map(sub => (
              <tr key={sub.id}>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{sub.nome}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{sub.categorias?.nome || 'Desconhecida'}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <button onClick={() => handleDelete(sub.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
