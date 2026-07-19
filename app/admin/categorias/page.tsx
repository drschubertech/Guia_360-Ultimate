'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Empresa');
  const [icone, setIcone] = useState('ShoppingBag');
  const [cor, setCor] = useState('#ff6b6b');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  async function fetchCategorias() {
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (data) setCategorias(data);
    if (error) console.error(error);
  }

  async function handleAddCategoria(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const { error } = await supabase.from('categorias').insert([{
      nome, slug, tipo, icone, cor
    }]);

    setLoading(false);
    
    if (error) {
      alert('Erro ao criar categoria: ' + error.message);
    } else {
      setNome('');
      fetchCategorias();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria? As subcategorias atreladas também poderão ser removidas.')) return;
    
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchCategorias();
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Gestão de Categorias</h1>
      
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '15px' }}>Adicionar Nova Categoria</h3>
        <form onSubmit={handleAddCategoria} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Nome da Categoria</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Ex: Alimentação" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="Empresa">Empresa</option>
              <option value="Entidade">Entidade</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ícone (Lucide React)</label>
            <input type="text" value={icone} onChange={e => setIcone(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Ex: Utensils, ShoppingBag" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Cor Hexadecimal</label>
            <input type="color" value={cor} onChange={e => setCor(e.target.value)} style={{ width: '100%', height: '40px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          
          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Salvando...' : '+ Adicionar Categoria'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9f9f9' }}>
            <tr>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Nome</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Tipo</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Cor</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Ícone</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #eee' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Nenhuma categoria cadastrada.</td></tr>
            ) : categorias.map(cat => (
              <tr key={cat.id}>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{cat.nome}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{cat.tipo}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '15px', height: '15px', backgroundColor: cat.cor, borderRadius: '50%' }}></div>
                    {cat.cor}
                  </div>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{cat.icone}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <button onClick={() => handleDelete(cat.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
