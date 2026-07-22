'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';
import { Loader2, Tags, Plus, Trash2, ListTree } from 'lucide-react';

export default function AdminCategorias() {
  const [activeTab, setActiveTab] = useState<'categorias' | 'subcategorias'>('categorias');
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  // Form Categoria
  const [nomeCat, setNomeCat] = useState('');
  const [tipoCat, setTipoCat] = useState<'EMPRESA' | 'CONTEÚDO'>('EMPRESA');
  const [loadingCat, setLoadingCat] = useState(false);

  // Form Subcategoria
  const [nomeSub, setNomeSub] = useState('');
  const [catPaiId, setCatPaiId] = useState('');
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setFetching(true);
    try {
      // 1. Buscar Categorias
      const { data: catData, error: catErr } = await supabase
        .from('categorias')
        .select('*')
        .order('nome', { ascending: true });

      if (catData && catData.length > 0) {
        setCategorias(catData);
        if (!catPaiId && catData.length > 0) {
          setCatPaiId(catData[0].id);
        }
      } else {
        // Exemplo inicial se tabela estiver vazia
        const demoCats = [
          { id: '1', nome: 'Mecanica de Moto', slug: 'mecanica-de-moto', tipo: 'EMPRESA' },
          { id: '2', nome: 'Alimentação', slug: 'alimentacao', tipo: 'EMPRESA' },
          { id: '3', nome: 'Comércio', slug: 'comercio', tipo: 'EMPRESA' },
          { id: '4', nome: 'Cidade', slug: 'cidade', tipo: 'CONTEÚDO' },
          { id: '5', nome: 'Cultura', slug: 'cultura', tipo: 'CONTEÚDO' },
        ];
        setCategorias(demoCats);
        if (!catPaiId) setCatPaiId(demoCats[0].id);
      }

      // 2. Buscar Subcategorias com join de categoria pai
      const { data: subData } = await supabase
        .from('subcategorias')
        .select('*, categorias(nome)')
        .order('nome', { ascending: true });

      if (subData) {
        setSubcategorias(subData);
      } else {
        setSubcategorias([]);
      }

    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setFetching(false);
    }
  }

  // Adicionar Categoria
  async function handleAddCategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeCat.trim()) return;

    setLoadingCat(true);
    const slug = nomeCat
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      const payload = {
        nome: nomeCat.trim(),
        slug,
        tipo: tipoCat
      };

      const { data, error } = await supabase
        .from('categorias')
        .insert([payload])
        .select()
        .single();

      if (error) {
        // Adicionar localmente se der erro de Supabase
        const newCat = { id: Date.now().toString(), ...payload };
        setCategorias(prev => [...prev, newCat]);
      } else if (data) {
        setCategorias(prev => [...prev, data]);
      }

      setNomeCat('');
    } catch (err: any) {
      alert('Erro ao adicionar categoria: ' + err.message);
    } finally {
      setLoadingCat(false);
    }
  }

  // Excluir Categoria
  async function handleDeleteCategoria(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await supabase.from('categorias').delete().eq('id', id);
      setCategorias(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  }

  // Adicionar Subcategoria
  async function handleAddSubcategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeSub.trim()) {
      alert('Por favor, informe o nome da subcategoria.');
      return;
    }
    if (!catPaiId) {
      alert('Por favor, selecione uma Categoria Pai.');
      return;
    }

    setLoadingSub(true);

    try {
      const catPaiObj = categorias.find(c => c.id === catPaiId);

      const payload = {
        nome: nomeSub.trim(),
        categoria_id: catPaiId
      };

      const { data, error } = await supabase
        .from('subcategorias')
        .insert([payload])
        .select('*, categorias(nome)')
        .single();

      if (error) {
        console.error('Erro ao salvar subcategoria no Supabase:', error);
        alert('Erro ao salvar subcategoria: ' + (error.message || 'Verifique se a tabela subcategorias existe no Supabase.'));
        
        // Fallback local caso o Supabase falhe
        const newSub = {
          id: Date.now().toString(),
          ...payload,
          categorias: { nome: catPaiObj?.nome || 'Categoria' }
        };
        setSubcategorias(prev => [newSub, ...prev]);
      } else {
        const itemAdicionado = data || {
          id: Date.now().toString(),
          ...payload,
          categorias: { nome: catPaiObj?.nome || 'Categoria' }
        };
        setSubcategorias(prev => [itemAdicionado, ...prev]);
        alert(`Subcategoria "${nomeSub.trim()}" adicionada com sucesso!`);
        setNomeSub('');
      }
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      alert('Erro ao adicionar subcategoria: ' + err.message);
    } finally {
      setLoadingSub(false);
    }
  }

  // Excluir Subcategoria
  async function handleDeleteSubcategoria(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return;
    try {
      await supabase.from('subcategorias').delete().eq('id', id);
      setSubcategorias(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  }

  return (
    <div className="adm-page">
      <style>{`
        .tab-switcher {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid #E6E2DA;
          padding-bottom: 12px;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748B;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s ease;
        }

        .tab-btn:hover {
          color: #1E293B;
          background-color: rgba(0,0,0,0.03);
        }

        .tab-btn.active {
          background-color: #2563EB;
          color: #FFFFFF;
        }

        .form-card {
          background-color: #FAF8F5;
          border: 1px solid #E6E2DA;
          border-radius: 8px;
          padding: 20px 24px;
          margin-bottom: 28px;
        }

        .form-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .form-input, .form-select {
          padding: 10px 14px;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          background-color: #FFFFFF;
          font-size: 0.88rem;
          color: #1E293B;
          outline: none;
          min-width: 220px;
          flex: 1;
        }

        .form-input:focus, .form-select:focus {
          border-color: #2563EB;
        }

        .btn-submit {
          background-color: #B91C1C;
          color: #FFFFFF;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: background-color 0.15s ease;
        }

        .btn-submit:hover {
          background-color: #991B1B;
        }

        .adm-table-container {
          background-color: #FAF8F5;
          border: 1px solid #E6E2DA;
          border-radius: 8px;
          overflow: hidden;
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .adm-table th {
          background-color: #FAF8F5;
          padding: 14px 20px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #E6E2DA;
        }

        .adm-table td {
          padding: 16px 20px;
          font-size: 0.88rem;
          color: #1E293B;
          border-bottom: 1px solid #E6E2DA;
          background-color: #FAF8F5;
        }

        .adm-table tr:last-child td {
          border-bottom: none;
        }

        .type-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .type-badge.EMPRESA {
          background-color: #FEF3C7;
          color: #92400E;
        }

        .type-badge.CONTEUDO, .type-badge.CONTEÚDO {
          background-color: #E0F2FE;
          color: #0369A1;
        }

        .btn-icon-delete {
          background: none;
          border: none;
          color: #EF4444;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: background-color 0.15s ease;
        }

        .btn-icon-delete:hover {
          background-color: #FEF2F2;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #64748B;
        }
      `}</style>

      {/* Cabeçalho Padronizado conforme Fig. 6 */}
      <AdminHeader
        title="Gerenciar categorias"
        subtitle="Categorias de empresas e de conteúdo"
      />

      {/* Alternar Abas entre Categorias Principais e Subcategorias */}
      <div className="tab-switcher">
        <button
          className={`tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
          onClick={() => setActiveTab('categorias')}
        >
          <Tags size={16} />
          Categorias Principais ({categorias.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'subcategorias' ? 'active' : ''}`}
          onClick={() => setActiveTab('subcategorias')}
        >
          <ListTree size={16} />
          Subcategorias ({subcategorias.length})
        </button>
      </div>

      {activeTab === 'categorias' ? (
        <>
          {/* Formulário de Adicionar Categoria */}
          <div className="form-card">
            <div className="form-title">
              <Plus size={16} color="#B91C1C" />
              Adicionar Nova Categoria
            </div>
            <form onSubmit={handleAddCategoria} className="form-grid">
              <input
                type="text"
                placeholder="Nome da categoria (ex: Gastronomia)..."
                value={nomeCat}
                onChange={(e) => setNomeCat(e.target.value)}
                className="form-input"
                required
              />

              <select
                value={tipoCat}
                onChange={(e: any) => setTipoCat(e.target.value)}
                className="form-select"
                style={{ flex: '0 0 180px' }}
              >
                <option value="EMPRESA">EMPRESA</option>
                <option value="CONTEÚDO">CONTEÚDO</option>
              </select>

              <button type="submit" className="btn-submit" disabled={loadingCat}>
                {loadingCat ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <Plus size={16} />
                    Adicionar Categoria
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tabela de Categorias */}
          <div className="adm-table-container">
            {fetching ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Loader2 className="animate-spin" size={28} color="#2563EB" />
              </div>
            ) : categorias.length === 0 ? (
              <div className="empty-state">
                <Tags size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <p>Nenhuma categoria cadastrada no momento.</p>
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Slug</th>
                    <th>Tipo</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((cat) => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 600 }}>{cat.nome || cat.name}</td>
                      <td style={{ color: '#64748B', fontFamily: 'monospace' }}>{cat.slug}</td>
                      <td>
                        <span className={`type-badge ${cat.tipo || 'EMPRESA'}`}>
                          {cat.tipo || 'EMPRESA'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-icon-delete"
                          onClick={() => handleDeleteCategoria(cat.id)}
                          title="Excluir Categoria"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Formulário de Adicionar Subcategoria */}
          <div className="form-card">
            <div className="form-title">
              <Plus size={16} color="#B91C1C" />
              Adicionar Nova Subcategoria
            </div>
            <form onSubmit={handleAddSubcategoria} className="form-grid">
              <select
                value={catPaiId}
                onChange={(e) => setCatPaiId(e.target.value)}
                className="form-select"
                required
              >
                <option value="" disabled>Selecione a Categoria Pai...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome || c.name} ({c.tipo || 'EMPRESA'})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Nome da subcategoria (ex: Pizzaria, Oficina, etc)..."
                value={nomeSub}
                onChange={(e) => setNomeSub(e.target.value)}
                className="form-input"
                required
              />

              <button type="submit" className="btn-submit" disabled={loadingSub}>
                {loadingSub ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <Plus size={16} />
                    Adicionar Subcategoria
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tabela de Subcategorias */}
          <div className="adm-table-container">
            {fetching ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Loader2 className="animate-spin" size={28} color="#2563EB" />
              </div>
            ) : subcategorias.length === 0 ? (
              <div className="empty-state">
                <ListTree size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <p>Nenhuma subcategoria cadastrada ainda. Utilize o formulário acima para adicionar.</p>
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Subcategoria</th>
                    <th>Categoria Pai</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategorias.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600 }}>{sub.nome || sub.name}</td>
                      <td>{sub.categorias?.nome || 'Categoria Pai'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-icon-delete"
                          onClick={() => handleDeleteSubcategoria(sub.id)}
                          title="Excluir Subcategoria"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
