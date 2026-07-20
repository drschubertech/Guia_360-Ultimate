'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import Link from 'next/link';

export default function EditarEmpresa({ params }: { params: { slug: string } }) {
  const [empresa, setEmpresa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Campos do Formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [site, setSite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fotoLogo, setFotoLogo] = useState<File | null>(null);
  const [fotoCapa, setFotoCapa] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Você precisa estar logado para editar uma empresa.');
        router.push('/login');
        return;
      }

      const { data, error } = await supabase.from('empresas').select('*').eq('slug', params.slug).single();
      
      if (error || !data) {
        alert('Empresa não encontrada.');
        router.push('/');
        return;
      }

      if (data.user_id !== session.user.id) {
        alert('Acesso negado. Você não é o administrador desta página.');
        router.push(`/empresa/${params.slug}`);
        return;
      }

      setEmpresa(data);
      setNome(data.nome || '');
      setDescricao(data.descricao || '');
      setTelefone(data.telefone || '');
      setEndereco(data.endereco || '');
      setSite(data.site || '');
      setInstagram(data.instagram || '');
      setFacebook(data.facebook || '');
      setCategoria(data.categoria || '');
      
      setLoading(false);
    }
    checkAuthAndLoad();
  }, [params.slug, router]);

  const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagens')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let finalLogoUrl = empresa.logo;
      let finalCapaUrl = empresa.capa;

      if (fotoLogo) {
        finalLogoUrl = await uploadImage(fotoLogo, `empresas/${empresa.slug}/logo`);
      }
      
      if (fotoCapa) {
        finalCapaUrl = await uploadImage(fotoCapa, `empresas/${empresa.slug}/capa`);
      }

      const atualizacao = {
        nome,
        descricao,
        telefone,
        endereco,
        site,
        instagram,
        facebook,
        categoria,
        logo: finalLogoUrl,
        capa: finalCapaUrl,
      };

      const { error } = await supabase
        .from('empresas')
        .update(atualizacao)
        .eq('id', empresa.id);

      if (error) throw error;
      
      alert('Informações atualizadas com sucesso!');
      router.push(`/empresa/${empresa.slug}`);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao atualizar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Carregando dados...</div>;
  }

  return (
    <main style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-offwhite)', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '700px' }}>
        <h1 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Editar: {empresa.nome}</h1>
        
        <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nome da Empresa/Entidade *</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Categoria</label>
            <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Descrição</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={4} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}></textarea>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Telefone (WhatsApp)</label>
            <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Endereço Completo</label>
            <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Website</label>
              <input type="text" value={site} onChange={e => setSite(e.target.value)} placeholder="https://" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Instagram</label>
              <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Facebook</label>
              <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="Link do perfil" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Logo Atualizar</label>
              {empresa.logo && <img src={empresa.logo} alt="Logo Atual" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '10px', border: '1px solid #eaeaea', borderRadius: '8px' }} />}
              <input type="file" accept="image/*" onChange={e => setFotoLogo(e.target.files?.[0] || null)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Capa Atualizar</label>
              {empresa.capa && <img src={empresa.capa} alt="Capa Atual" style={{ width: '100%', height: '80px', objectFit: 'cover', marginBottom: '10px', borderRadius: '8px' }} />}
              <input type="file" accept="image/*" onChange={e => setFotoCapa(e.target.files?.[0] || null)} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <Link href={`/empresa/${empresa.slug}`} style={{ flex: 1, textAlign: 'center', padding: '15px', backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>
              Cancelar
            </Link>
            <button type="submit" disabled={saving} className="btn-theme" style={{ flex: 2, padding: '15px', fontSize: '1.1rem' }}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
