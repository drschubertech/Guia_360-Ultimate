'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import Link from 'next/link';
import {
  Building2, Phone, MapPin, Globe, Instagram, Facebook,
  ImagePlus, Save, ArrowLeft, Loader2, Tag, Clock, HeartHandshake
} from 'lucide-react';

export default function EditarEntidade({ params }: { params: { slug: string } }) {
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
  const [fotoLogo, setFotoLogo] = useState<File | null>(null);
  const [fotoCapa, setFotoCapa] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Você precisa estar logado para editar esta entidade.');
        router.push('/login');
        return;
      }

      const { data, error } = await supabase.from('entidades').select('*').eq('slug', params.slug).single();

      if (error || !data) {
        alert('Entidade não encontrada.');
        router.push('/');
        return;
      }

      if (data.user_id !== session.user.id) {
        alert('Acesso negado. Você não é o responsável por esta entidade.');
        router.push(`/entidade/${params.slug}`);
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
        finalLogoUrl = await uploadImage(fotoLogo, `entidades/${empresa.slug}/logo`);
      }

      if (fotoCapa) {
        finalCapaUrl = await uploadImage(fotoCapa, `entidades/${empresa.slug}/capa`);
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

      const { error } = await supabase
        .from('entidades')
        .update(atualizacao)
        .eq('id', empresa.id);

      if (error) throw error;

      alert('Informações da entidade atualizadas com sucesso!');
      router.push(`/entidade/${empresa.slug}`);
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
          <span style={{ fontSize: '0.95rem' }}>Carregando dados da entidade…</span>
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
          letter-spacing: 0.05em;
          color: var(--primary-color);
          margin-bottom: 2px;
        }

        .edit-title {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .edit-card {
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
          overflow: hidden;
        }

        .edit-card-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: var(--bg-offwhite);
        }

        .edit-card-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background-color: var(--primary-light);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .edit-card-title {
          font-size: 1rem;
          font-weight: 700;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0;
        }

        .edit-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .edit-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .edit-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .edit-label-hint {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          font-weight: 400;
        }

        .edit-input, .edit-textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.925rem;
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          box-sizing: border-box;
        }

        .edit-textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .edit-input:hover, .edit-textarea:hover {
          border-color: #d1d5db;
        }

        .edit-input:focus, .edit-textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-light);
          background-color: var(--bg-light);
        }

        .edit-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

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
      `}</style>

      <div className="edit-container">

        {/* ── Cabeçalho ── */}
        <div className="edit-header">
          <Link href={`/entidade/${empresa.slug}`} className="edit-back-btn">
            <ArrowLeft size={15} /> Voltar
          </Link>
          <div className="edit-title-wrap">
            <p className="edit-eyebrow">Painel da Entidade</p>
            <h1 className="edit-title">Editar: {empresa.nome}</h1>
          </div>
        </div>

        <form onSubmit={handleSalvar}>

          {/* ── Seção 1: Identificação ── */}
          <div className="edit-card">
            <div className="edit-card-header">
              <div className="edit-card-icon"><HeartHandshake size={17} /></div>
              <h2 className="edit-card-title">Identificação da Entidade</h2>
            </div>
            <div className="edit-card-body">
              <div className="edit-field">
                <label className="edit-label">Nome da Entidade / ONG <span className="edit-label-hint">*obrigatório</span></label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  placeholder="Ex: Associação de Bairro X"
                  className="edit-input"
                />
              </div>
              <div className="edit-field">
                <label className="edit-label">Categoria <span className="edit-label-hint">área de atuação</span></label>
                <input
                  type="text"
                  value={categoria}
                  onChange={e => setCategoria(e.target.value)}
                  placeholder="Ex: Assistência Social, Meio Ambiente, Educação…"
                  className="edit-input"
                />
              </div>
              <div className="edit-field">
                <label className="edit-label">Descrição</label>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows={4}
                  placeholder="Conte sobre a missão e atuação da entidade…"
                  className="edit-textarea"
                />
              </div>
            </div>
          </div>

          {/* ── Seção 2: Contato e Funcionamento ── */}
          <div className="edit-card">
            <div className="edit-card-header">
              <div className="edit-card-icon"><Phone size={17} /></div>
              <h2 className="edit-card-title">Contato e Horários</h2>
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
                <label className="edit-label">Horário de Atendimento</label>
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
                    placeholder="https://suaentidade.org.br"
                    className="edit-input"
                  />
                </div>
                <div className="edit-field">
                  <label className="edit-label">Instagram</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="@suaentidade"
                    className="edit-input"
                  />
                </div>
              </div>
              <div className="edit-field">
                <label className="edit-label">Facebook</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={e => setFacebook(e.target.value)}
                  placeholder="facebook.com/suaentidade"
                  className="edit-input"
                />
              </div>
            </div>
          </div>

          {/* ── Rodapé de Ações ── */}
          <div className="edit-footer">
            <Link href={`/entidade/${empresa.slug}`} className="edit-cancel-btn">
              Cancelar
            </Link>
            <button type="submit" disabled={saving} className="edit-save-btn">
              {saving ? <><Loader2 size={16} className="edit-spin" /> Salvando…</> : <><Save size={16} /> Salvar Alterações</>}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
