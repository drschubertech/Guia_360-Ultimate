'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import Link from 'next/link';
import {
  Building2, Phone, MapPin, Globe, Instagram, Facebook,
  ImagePlus, Save, ArrowLeft, Loader2, Tag
} from 'lucide-react';

export default function EditarEmpresa({ params }: { params: { slug: string } }) {
  const [empresa, setEmpresa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Campos do Formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [horarioFuncionamento, setHorarioFuncionamento] = useState('');
  const [site, setSite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('Empresa');
  const [fotoLogo, setFotoLogo] = useState<File | null>(null);
  const [fotoCapa, setFotoCapa] = useState<File | null>(null);

  // Previews locais
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewCapa, setPreviewCapa] = useState<string | null>(null);

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

      // Verifica se o usuário pode editar (admin ou dono da claim)
      let canEdit = false;
      if (data.user_id === session.user.id) canEdit = true;
      if (data.claimed_by === session.user.id) canEdit = true;

      if (!canEdit) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.role_id) {
          const { data: role } = await supabase
            .from('user_roles')
            .select('name')
            .eq('id', profile.role_id)
            .single();
          if (role?.name === 'admin') canEdit = true;
        }
      }

      if (!canEdit) {
        alert('Acesso negado. Você não é o administrador desta página nem do sistema.');
        router.push(`/empresa/${params.slug}`);
        return;
      }

      setEmpresa(data);
      setNome(data.nome || '');
      setDescricao(data.descricao || '');
      setTelefone(data.telefone || '');
      setEndereco(data.endereco || '');
      setHorarioFuncionamento(data.horario_funcionamento || data.horario || '');
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
        horario: horarioFuncionamento,
        site,
        instagram,
        facebook,
        categoria,
        logo: finalLogoUrl,
        capa: finalCapaUrl,
      };

      if (tipo === 'Entidade') {
        const entidadeData = {
          ...empresa,
          ...atualizacao
        };
        const { error: insertError } = await supabase.from('entidades').insert([entidadeData]);
        if (insertError) throw insertError;
        
        const { error: deleteError } = await supabase.from('empresas').delete().eq('id', empresa.id);
        if (deleteError) throw deleteError;

        alert('Tipo alterado e informações atualizadas com sucesso!');
        router.push(`/entidade/${empresa.slug}`);
      } else {
        const { error } = await supabase
          .from('empresas')
          .update(atualizacao)
          .eq('id', empresa.id);

        if (error) throw error;
        
        alert('Informações atualizadas com sucesso!');
        router.push(`/empresa/${empresa.slug}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao atualizar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-offwhite)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} style={{ animation: 'edit-spin 0.8s linear infinite', display: 'block', margin: '0 auto 12px' }} />
          <span style={{ fontSize: '0.95rem' }}>Carregando dados…</span>
        </div>
      </div>
    );
  }

  return (
    <main className="edit-page">
      <style>{`
        @keyframes edit-spin { to { transform: rotate(360deg); } }

        .edit-page {
          min-height: 100vh;
          background-color: var(--bg-offwhite);
          padding: 48px 20px 80px;
        }

        .edit-container {
          max-width: 760px;
          margin: 0 auto;
        }

        /* ── Cabeçalho ── */
        .edit-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 32px;
        }

        .edit-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-light);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          text-decoration: none;
          transition: border-color 0.2s ease, color 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .edit-back-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .edit-title-wrap {
          flex: 1;
          min-width: 0;
        }

        .edit-eyebrow {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--primary-color);
          margin-bottom: 4px;
        }

        .edit-title {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        /* ── Card de seção ── */
        .edit-card {
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          margin-bottom: 20px;
        }

        .edit-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-color);
          background: #fafafa;
        }

        .edit-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          flex-shrink: 0;
        }

        .edit-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .edit-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Grid 2 colunas ── */
        .edit-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .edit-grid-full {
          grid-column: 1 / -1;
        }

        /* ── Campo ── */
        .edit-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .edit-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .edit-label-hint {
          font-weight: 400;
          color: var(--text-tertiary);
          font-size: 0.8rem;
          margin-left: 4px;
        }

        .edit-input,
        .edit-textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          box-sizing: border-box;
        }

        .edit-input::placeholder,
        .edit-textarea::placeholder {
          color: var(--text-tertiary);
        }

        .edit-input:hover,
        .edit-textarea:hover {
          border-color: #d1d5db;
        }

        .edit-input:focus,
        .edit-textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-light);
          background-color: var(--bg-light);
        }

        .edit-textarea {
          resize: vertical;
          min-height: 110px;
          line-height: 1.6;
        }

        /* ── Upload de imagem ── */
        .edit-upload-card {
          background: var(--bg-offwhite);
          border: 1.5px dashed var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          transition: border-color 0.2s ease;
          cursor: pointer;
          text-align: center;
        }

        .edit-upload-card:hover {
          border-color: var(--primary-color);
        }

        .edit-upload-preview-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border-radius: 12px;
          border: 1.5px solid var(--border-color);
          background: #fff;
          padding: 4px;
        }

        .edit-upload-preview-capa {
          width: 100%;
          max-height: 120px;
          object-fit: cover;
          border-radius: 10px;
          border: 1.5px solid var(--border-color);
        }

        .edit-upload-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .edit-upload-hint {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-top: -8px;
        }

        .edit-upload-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--primary-light);
          color: var(--primary-color);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 99px;
        }

        .edit-file-input {
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          position: absolute;
          z-index: -1;
        }

        .edit-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--bg-light);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.15s ease;
        }

        .edit-file-btn:hover {
          border-color: var(--primary-color);
          background: var(--primary-light);
          color: var(--primary-color);
        }

        /* ── Rodapé do form ── */
        .edit-footer {
          display: flex;
          gap: 14px;
          margin-top: 8px;
        }

        .edit-cancel-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 20px;
          background: var(--bg-light);
          color: var(--text-secondary);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.95rem;
          font-family: inherit;
          text-decoration: none;
          transition: border-color 0.2s ease, color 0.2s ease;
          cursor: pointer;
        }

        .edit-cancel-btn:hover {
          border-color: var(--text-secondary);
          color: var(--text-primary);
        }

        .edit-save-btn {
          flex: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 24px;
          background: var(--primary-color);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.95rem;
          font-family: inherit;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.15s ease, opacity 0.2s ease;
        }

        .edit-save-btn:hover:not(:disabled) {
          background-color: var(--primary-color-hover);
          transform: translateY(-1px);
        }

        .edit-save-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes edit-spin { to { transform: rotate(360deg); } }
        .edit-spin { animation: edit-spin 0.8s linear infinite; }

        /* ── Responsivo ── */
        @media (max-width: 600px) {
          .edit-page { padding: 24px 16px 60px; }
          .edit-grid-2 { grid-template-columns: 1fr; }
          .edit-grid-full { grid-column: 1; }
          .edit-footer { flex-direction: column; }
          .edit-cancel-btn, .edit-save-btn { flex: none; width: 100%; }
          .edit-title { font-size: 1.2rem; }
        }
      `}</style>

      <div className="edit-container">

        {/* ── Cabeçalho ── */}
        <div className="edit-header">
          <Link href={`/empresa/${empresa.slug}`} className="edit-back-btn">
            <ArrowLeft size={15} /> Voltar
          </Link>
          <div className="edit-title-wrap">
            <p className="edit-eyebrow">Painel da Empresa</p>
            <h1 className="edit-title">Editar: {empresa.nome}</h1>
          </div>
        </div>

        <form onSubmit={handleSalvar}>

          {/* ── Seção 1: Identificação ── */}
          <div className="edit-card">
            <div className="edit-card-header">
              <div className="edit-card-icon"><Building2 size={17} /></div>
              <h2 className="edit-card-title">Identificação</h2>
            </div>
            <div className="edit-card-body">
              <div className="edit-field">
                <label className="edit-label">Nome da Empresa / Entidade <span className="edit-label-hint">*obrigatório</span></label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  placeholder="Ex: Pizzaria do João"
                  className="edit-input"
                />
              </div>
              <div className="edit-field">
                <label className="edit-label">Tipo do Cadastro</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="edit-input"
                >
                  <option value="Empresa">Empresa</option>
                  <option value="Entidade">Entidade</option>
                </select>
              </div>
              <div className="edit-field">
                <label className="edit-label">Categoria <span className="edit-label-hint">ramo de atividade</span></label>
                <input
                  type="text"
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  placeholder="Ex: Restaurante, Saúde, Educação…"
                  className="edit-input"
                  list="categorias-list"
                />
                <datalist id="categorias-list">
                  <option value="Alimentação" />
                  <option value="Saúde" />
                  <option value="Educação" />
                  <option value="Serviços" />
                  <option value="Varejo" />
                  <option value="Associação" />
                  <option value="Igreja" />
                  <option value="ONG" />
                </datalist>
              </div>
              <div className="edit-field">
                <label className="edit-label">Descrição</label>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows={4}
                  placeholder="Conte um pouco sobre a sua empresa ou entidade…"
                  className="edit-textarea"
                />
              </div>
            </div>
          </div>

          {/* ── Seção 2: Contato e Localização ── */}
          <div className="edit-card">
            <div className="edit-card-header">
              <div className="edit-card-icon"><Phone size={17} /></div>
              <h2 className="edit-card-title">Contato e Localização</h2>
            </div>
            <div className="edit-card-body">
              <div className="edit-field">
                <label className="edit-label">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="edit-input"
                />
              </div>
              <div className="edit-field">
                <label className="edit-label">Endereço Completo</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  className="edit-input"
                />
              </div>
              <div className="edit-field">
                <label className="edit-label">Horário de Atendimento / Funcionamento</label>
                <textarea
                  value={horarioFuncionamento}
                  onChange={e => setHorarioFuncionamento(e.target.value)}
                  rows={3}
                  placeholder="Ex: Segunda a Sexta: 08:00 às 18:00&#10;Sábado: 08:00 às 12:00"
                  className="edit-textarea"
                />
              </div>
            </div>
          </div>

          {/* ── Seção 3: Redes Sociais ── */}
          <div className="edit-card">
            <div className="edit-card-header">
              <div className="edit-card-icon"><Globe size={17} /></div>
              <h2 className="edit-card-title">Presença Online</h2>
            </div>
            <div className="edit-card-body">
              <div className="edit-grid-2">
                <div className="edit-field">
                  <label className="edit-label">Website</label>
                  <input
                    type="text"
                    value={site}
                    onChange={e => setSite(e.target.value)}
                    placeholder="https://suaempresa.com.br"
                    className="edit-input"
                  />
                </div>
                <div className="edit-field">
                  <label className="edit-label">Instagram</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="@usuario"
                    className="edit-input"
                  />
                </div>
                <div className="edit-field edit-grid-full">
                  <label className="edit-label">Facebook</label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={e => setFacebook(e.target.value)}
                    placeholder="Link do perfil ou @página"
                    className="edit-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Seção 4: Imagens ── */}
          <div className="edit-card">
            <div className="edit-card-header">
              <div className="edit-card-icon"><ImagePlus size={17} /></div>
              <h2 className="edit-card-title">Imagens</h2>
            </div>
            <div className="edit-card-body">
              <div className="edit-grid-2">

                {/* Logo */}
                <div className="edit-field">
                  <label className="edit-label">Logo</label>
                  <div className="edit-upload-card">
                    {(previewLogo || empresa.logo) && (
                      <img
                        src={previewLogo || empresa.logo}
                        alt="Logo"
                        className="edit-upload-preview-logo"
                      />
                    )}
                    {!previewLogo && !empresa.logo && (
                      <ImagePlus size={28} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                    <p className="edit-upload-label">
                      {fotoLogo ? fotoLogo.name : (empresa.logo ? 'Logo atual' : 'Nenhuma logo')}
                    </p>
                    {fotoLogo && <span className="edit-upload-tag">✓ Nova imagem selecionada</span>}
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        className="edit-file-input"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          setFotoLogo(file);
                          if (file) setPreviewLogo(URL.createObjectURL(file));
                        }}
                      />
                      <span className="edit-file-btn"><ImagePlus size={14} /> Escolher arquivo</span>
                    </label>
                    <p className="edit-upload-hint">JPG, PNG ou WebP · recomendado 400×400</p>
                  </div>
                </div>

                {/* Capa */}
                <div className="edit-field">
                  <label className="edit-label">Foto de Capa</label>
                  <div className="edit-upload-card">
                    {(previewCapa || empresa.capa) && (
                      <img
                        src={previewCapa || empresa.capa}
                        alt="Capa"
                        className="edit-upload-preview-capa"
                      />
                    )}
                    {!previewCapa && !empresa.capa && (
                      <ImagePlus size={28} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                    <p className="edit-upload-label">
                      {fotoCapa ? fotoCapa.name : (empresa.capa ? 'Capa atual' : 'Nenhuma capa')}
                    </p>
                    {fotoCapa && <span className="edit-upload-tag">✓ Nova imagem selecionada</span>}
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        className="edit-file-input"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          setFotoCapa(file);
                          if (file) setPreviewCapa(URL.createObjectURL(file));
                        }}
                      />
                      <span className="edit-file-btn"><ImagePlus size={14} /> Escolher arquivo</span>
                    </label>
                    <p className="edit-upload-hint">JPG, PNG ou WebP · recomendado 1200×400</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── Rodapé ── */}
          <div className="edit-footer">
            <Link href={`/empresa/${empresa.slug}`} className="edit-cancel-btn">
              <ArrowLeft size={15} style={{ marginRight: 4 }} /> Cancelar
            </Link>
            <button type="submit" disabled={saving} className="edit-save-btn">
              {saving
                ? <><Loader2 size={17} className="edit-spin" /> Salvando…</>
                : <><Save size={17} /> Salvar Alterações</>
              }
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
