'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Building2, Phone, MapPin, ImagePlus, UserRound, ChevronRight, ChevronLeft, CheckCircle2, Globe, Instagram, Facebook } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Categorias e Subcategorias agora vêm do Supabase

const STEP_LABELS = ['Dados Básicos', 'Contato', 'Galeria', 'Acesso'];
const STEP_ICONS = [Building2, Phone, ImagePlus, UserRound];

export default function CadastroEmpresa() {
  const [etapa, setEtapa] = useState(1);
  const [tipo, setTipo] = useState<'Empresa' | 'Entidade'>('Empresa');
  const [nomeEntidade, setNomeEntidade] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subCategoria, setSubCategoria] = useState('');
  
  const [categoriasDb, setCategoriasDb] = useState<any[]>([]);
  const [subcategoriasDb, setSubcategoriasDb] = useState<any[]>([]);

  useEffect(() => {
    async function loadCategorias() {
      const { data: catData } = await supabase.from('categorias').select('*');
      if (catData) setCategoriasDb(catData);
      
      const { data: subData } = await supabase.from('subcategorias').select('*');
      if (subData) setSubcategoriasDb(subData);
    }
    loadCategorias();
  }, []);

  const [whatsapp, setWhatsapp] = useState('');
  const [horarioFuncionamento, setHorarioFuncionamento] = useState('');
  const [cep, setCep] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  // Redes Sociais
  const [site, setSite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  // Imagens
  const [fotoLogo, setFotoLogo] = useState<File | null>(null);
  const [fotoLogoUrl, setFotoLogoUrl] = useState('');
  const [fotoCapa, setFotoCapa] = useState<File | null>(null);
  const [fotoCapaUrl, setFotoCapaUrl] = useState('');
  const [fotosCatalogo, setFotosCatalogo] = useState<(File|null)[]>([null, null, null, null]);
  const [fotosCatalogoUrl, setFotosCatalogoUrl] = useState<string[]>(['', '', '', '']);
  const [uploading, setUploading] = useState(false);

  // Conta de Acesso
  const [nomeAdmin, setNomeAdmin] = useState('');
  const [emailAdmin, setEmailAdmin] = useState('');
  const [senhaAdmin, setSenhaAdmin] = useState('');

  const router = useRouter();

  const handleWhatsapp = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d)(\d{4})(\d{4}).*/, "($1) $2 $3-$4");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d)(\d{0,4})/, "($1) $2 $3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    }
    setWhatsapp(value);
  };

  const handleCep = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{1,3})/, "$1-$2");
    }
    setCep(value);

    if (value.length === 9) {
      const cleanCep = value.replace("-", "");
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEndereco(prev => ({
            ...prev,
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || ''
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleChangeEndereco = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEndereco(prev => ({ ...prev, [name]: value }));
  };

  const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('imagens').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleConcluir = async () => {
    setUploading(true);
    const slug = nomeEntidade.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let finalLogoUrl = fotoLogoUrl;
    let finalCapaUrl = fotoCapaUrl;
    let finalCatalogoUrls = [...fotosCatalogoUrl];
    
    try {
      if (fotoLogo) finalLogoUrl = await uploadImage(fotoLogo, `empresas/${slug}/logo`);
      if (fotoCapa) finalCapaUrl = await uploadImage(fotoCapa, `empresas/${slug}/capa`);
      for (let i = 0; i < 4; i++) {
        if (fotosCatalogo[i]) {
          finalCatalogoUrls[i] = await uploadImage(fotosCatalogo[i]!, `empresas/${slug}/catalogo`);
        }
      }
      const fotos_catalogo = finalCatalogoUrls.filter(url => url !== '');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailAdmin,
        password: senhaAdmin,
        options: { data: { nome: nomeAdmin, telefone: whatsapp } }
      });
      if (authError) throw authError;
      const userId = authData.user?.id;

      const payload = {
        user_id: userId,
        nome: nomeEntidade || (tipo === 'Empresa' ? 'Empresa Sem Nome' : 'Entidade Sem Nome'),
        slug,
        categoria: categoria || 'Serviços',
        tags: [],
        descricao: 'Descrição pendente.',
        avaliacao: 0,
        telefone: whatsapp,
        endereco: `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}`,
        horario_funcionamento: horarioFuncionamento,
        status: 'fechado',
        logo: finalLogoUrl,
        site,
        instagram,
        facebook,
        reivindicada: true,
        capa: finalCapaUrl || `https://via.placeholder.com/1200x400?text=${encodeURIComponent(nomeEntidade || tipo)}`,
        fotos_catalogo
      };

      const tabelaDestino = tipo === 'Entidade' ? 'entidades' : 'empresas';
      const { error } = await supabase.from(tabelaDestino).insert([payload]);
      if (error) throw error;
      
      alert('Cadastro enviado com sucesso para o banco de dados!');
      router.push('/');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao cadastrar no banco: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="emp-page">
      <style>{`
        /* ---- Página e Card ---- */
        .emp-page {
          background-color: var(--bg-offwhite);
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 60px 20px;
        }

        .emp-card {
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 620px;
          padding: 48px 44px 40px;
        }

        /* ---- Cabeçalho ---- */
        .emp-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .emp-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-pill);
          background-color: var(--primary-light);
          color: var(--primary-color);
          margin-bottom: 20px;
        }

        .emp-title {
          font-size: 1.75rem;
          font-family: var(--font-outfit), sans-serif;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .emp-title span { color: var(--primary-color); }

        .emp-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* ---- Stepper ---- */
        .emp-stepper {
          margin-bottom: 40px;
        }

        .emp-stepper-track {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 12px;
        }

        .emp-step-node {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
          transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .emp-step-node.done {
          background-color: var(--primary-color);
          color: #fff;
          box-shadow: 0 0 0 4px var(--primary-light);
        }

        .emp-step-node.active {
          background-color: var(--primary-color);
          color: #fff;
          box-shadow: 0 0 0 4px var(--primary-light);
        }

        .emp-step-node.pending {
          background-color: var(--bg-offwhite);
          border: 2px solid var(--border-color);
          color: var(--text-tertiary);
        }

        .emp-step-connector {
          flex: 1;
          height: 2px;
          background-color: var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .emp-step-connector-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: var(--primary-color);
          transition: width 0.4s ease;
        }

        .emp-stepper-labels {
          display: flex;
          justify-content: space-between;
        }

        .emp-step-label {
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--text-tertiary);
          text-align: center;
          width: 36px;
          transition: color 0.3s ease;
          white-space: nowrap;
        }

        .emp-step-label.active-label {
          color: var(--primary-color);
          font-weight: 600;
        }

        /* ---- Seção de conteúdo ---- */
        .emp-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-color);
        }

        .emp-section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background-color: var(--primary-light);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emp-section-title {
          font-size: 1.05rem;
          font-weight: 700;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0;
        }

        .emp-section-sub {
          font-size: 0.82rem;
          color: var(--text-tertiary);
          margin: 0;
          margin-top: 1px;
        }

        /* ---- Tipo de cadastro (radio cards) ---- */
        .type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .type-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border: 2px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-secondary);
          user-select: none;
        }

        .type-card:hover {
          border-color: #d1d5db;
          background-color: var(--bg-offwhite);
        }

        .type-card.selected {
          border-color: var(--primary-color);
          background-color: var(--primary-light);
          color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-light);
        }

        .type-card input[type="radio"] {
          accent-color: var(--primary-color);
          width: 17px;
          height: 17px;
          flex-shrink: 0;
        }

        /* ---- Campos de formulário ---- */
        .emp-form-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .emp-form-group {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .emp-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--text-primary);
          margin-bottom: 7px;
        }

        .emp-label svg {
          color: var(--text-tertiary);
        }

        .emp-input, .emp-select {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }

        .emp-input::placeholder {
          color: var(--text-tertiary);
        }

        .emp-input:hover, .emp-select:hover {
          border-color: #d1d5db;
        }

        .emp-input:focus, .emp-select:focus {
          border-color: var(--primary-color);
          background-color: var(--bg-light);
          box-shadow: 0 0 0 4px var(--primary-light);
        }

        .emp-select {
          cursor: pointer;
          appearance: auto;
        }

        .emp-input-with-toggle {
          padding-right: 48px;
        }

        /* ---- Wrapper de input com ícone ou toggle ---- */
        .emp-input-wrapper {
          position: relative;
        }

        .emp-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .emp-input.has-icon {
          padding-left: 38px;
        }

        .emp-password-toggle {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          padding: 2px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }

        .emp-password-toggle:hover { color: var(--text-secondary); }
        .emp-password-toggle:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }

        /* ---- Grids ---- */
        .emp-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .emp-grid-3 {
          display: grid;
          grid-template-columns: 120px 1fr 80px;
          gap: 14px;
        }

        /* ---- Subseções (dentro de etapas) ---- */
        .emp-subsection {
          background-color: var(--bg-offwhite);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-top: 4px;
        }

        .emp-subsection-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ---- Upload zone ---- */
        .emp-upload-card {
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .emp-upload-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 14px;
        }

        .emp-upload-or {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 12px 0;
          color: var(--text-tertiary);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .emp-upload-or::before,
        .emp-upload-or::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-color);
        }

        .emp-file-zone {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .emp-file-zone:hover {
          border-color: var(--primary-color);
          background-color: var(--primary-light);
        }

        .emp-file-zone input[type="file"] {
          width: 100%;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .emp-file-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background-color: #dcfce7;
          color: #16a34a;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 500;
          margin-top: 8px;
        }

        .emp-catalog-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .emp-catalog-slot {
          background: var(--bg-light);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 14px;
          transition: border-color 0.2s ease;
        }

        .emp-catalog-slot:hover {
          border-color: #d1d5db;
        }

        .emp-catalog-slot-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* ---- Botões de navegação ---- */
        .emp-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
          gap: 12px;
        }

        .emp-btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 11px 20px;
          border: 1.5px solid var(--border-color);
          background: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
          transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
          font-family: inherit;
        }

        .emp-btn-back:hover {
          border-color: var(--text-secondary);
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
        }

        .emp-btn-next {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 11px 24px;
          font-size: 0.95rem;
          border-radius: var(--radius-sm);
        }

        .emp-btn-next:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .emp-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: emp-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes emp-spin { to { transform: rotate(360deg); } }

        /* ---- Rodapé ---- */
        .emp-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .emp-footer a {
          color: var(--primary-color);
          font-weight: 600;
          transition: color 0.15s ease;
        }

        .emp-footer a:hover { color: var(--primary-color-hover); }

        /* ---- Conteúdo da etapa (animação sutil) ---- */
        .emp-step-content {
          min-height: 260px;
        }

        /* ---- Responsivo ---- */
        @media (max-width: 600px) {
          .emp-card { padding: 32px 20px 28px; }
          .emp-title { font-size: 1.5rem; }
          .emp-grid-2, .emp-catalog-grid { grid-template-columns: 1fr; }
          .emp-grid-3 { grid-template-columns: 1fr 1fr; }
          .emp-step-label { display: none; }
        }
      `}</style>

      <div className="emp-card">

        {/* Cabeçalho */}
        <div className="emp-header">
          <div className="emp-badge">
            <Building2 size={28} strokeWidth={1.5} />
          </div>
          <h1 className="emp-title">Anuncie <span>Grátis</span></h1>
          <p className="emp-subtitle">Crie o perfil da sua {tipo.toLowerCase()} em 4 passos simples.</p>
        </div>

        {/* Stepper */}
        <div className="emp-stepper">
          <div className="emp-stepper-track">
            {[1, 2, 3, 4].map((step, idx) => {
              const isDone = etapa > step;
              const isActive = etapa === step;
              return (
                <>
                  <div
                    key={step}
                    className={`emp-step-node ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}
                  >
                    {isDone ? <CheckCircle2 size={16} /> : step}
                  </div>
                  {idx < 3 && (
                    <div key={`conn-${step}`} className="emp-step-connector">
                      <div
                        className="emp-step-connector-fill"
                        style={{ width: etapa > step + 1 ? '100%' : etapa === step + 1 ? '50%' : '0%' }}
                      />
                    </div>
                  )}
                </>
              );
            })}
          </div>
          <div className="emp-stepper-labels">
            {STEP_LABELS.map((label, idx) => (
              <span
                key={label}
                className={`emp-step-label ${etapa === idx + 1 ? 'active-label' : ''}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Conteúdo das etapas */}
        <div className="emp-step-content">

          {/* ── Etapa 1: Dados Básicos ── */}
          {etapa === 1 && (
            <div className="emp-form-stack">
              <div className="emp-section-header">
                <div className="emp-section-icon"><Building2 size={18} strokeWidth={1.5} /></div>
                <div>
                  <p className="emp-section-title">Dados Básicos</p>
                  <p className="emp-section-sub">Identidade e categoria da sua {tipo.toLowerCase()}</p>
                </div>
              </div>

              {/* Tipo de cadastro */}
              <div className="emp-form-group">
                <span className="emp-label">Tipo de Cadastro</span>
                <div className="type-selector">
                  <label className={`type-card ${tipo === 'Empresa' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="tipo"
                      value="Empresa"
                      checked={tipo === 'Empresa'}
                      onChange={() => { setTipo('Empresa'); setCategoria(''); setSubCategoria(''); }}
                    />
                    🏢 Empresa
                  </label>
                  <label className={`type-card ${tipo === 'Entidade' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="tipo"
                      value="Entidade"
                      checked={tipo === 'Entidade'}
                      onChange={() => { setTipo('Entidade'); setCategoria(''); setSubCategoria(''); }}
                    />
                    🤝 Entidade
                  </label>
                </div>
              </div>

              {/* Nome */}
              <div className="emp-form-group">
                <label className="emp-label">Nome da {tipo}</label>
                <input
                  type="text"
                  value={nomeEntidade}
                  onChange={(e) => setNomeEntidade(e.target.value)}
                  placeholder={`Ex: ${tipo === 'Empresa' ? 'Pizzaria do Mário' : 'Associação Bairro X'}`}
                  className="emp-input"
                />
              </div>

              {/* Categoria + Subcategoria */}
              <div className="emp-grid-2">
                <div className="emp-form-group">
                  <label className="emp-label">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => { setCategoria(e.target.value); setSubCategoria(''); }}
                    className="emp-select"
                  >
                    <option value="">Selecione...</option>
                    {categoriasDb.filter(c => c.tipo === tipo).map(cat => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                {categoria && (
                  <div className="emp-form-group">
                    <label className="emp-label">Sub-categoria</label>
                    <select
                      value={subCategoria}
                      onChange={(e) => setSubCategoria(e.target.value)}
                      className="emp-select"
                    >
                      <option value="">Selecione...</option>
                      {subcategoriasDb
                        .filter(s => {
                          const catSelecionada = categoriasDb.find(c => c.nome === categoria && c.tipo === tipo);
                          return catSelecionada && s.categoria_id === catSelecionada.id;
                        })
                        .map(sub => (
                          <option key={sub.id} value={sub.nome}>{sub.nome}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Etapa 2: Contato e Endereço ── */}
          {etapa === 2 && (
            <div className="emp-form-stack">
              <div className="emp-section-header">
                <div className="emp-section-icon"><Phone size={18} strokeWidth={1.5} /></div>
                <div>
                  <p className="emp-section-title">Contato e Endereço</p>
                  <p className="emp-section-sub">Como os clientes vão te encontrar</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="emp-form-group">
                <label className="emp-label">
                  <Phone size={14} />
                  WhatsApp
                </label>
                <div className="emp-input-wrapper">
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={handleWhatsapp}
                    placeholder="(00) 0 0000-0000"
                    className="emp-input"
                  />
                </div>
              </div>

              {/* Horário de Atendimento */}
              <div className="emp-form-group">
                <label className="emp-label">
                  Horário de Atendimento / Funcionamento
                </label>
                <textarea
                  value={horarioFuncionamento}
                  onChange={(e) => setHorarioFuncionamento(e.target.value)}
                  placeholder="Ex: Segunda a Sexta: 08:00 às 18:00&#10;Sábado: 08:00 às 12:00"
                  className="emp-input"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Endereço */}
              <div className="emp-subsection">
                <p className="emp-subsection-title">
                  <MapPin size={14} />
                  Endereço
                </p>
                <div className="emp-form-stack">
                  {/* CEP */}
                  <div className="emp-form-group">
                    <label className="emp-label">CEP</label>
                    <input
                      type="text"
                      value={cep}
                      onChange={handleCep}
                      placeholder="00000-000"
                      className="emp-input"
                      style={{ maxWidth: '180px' }}
                    />
                  </div>
                  {/* Rua */}
                  <div className="emp-form-group">
                    <label className="emp-label">Rua</label>
                    <input type="text" name="rua" value={endereco.rua} onChange={handleChangeEndereco} placeholder="Nome da rua" className="emp-input" />
                  </div>
                  {/* Número + Bairro */}
                  <div className="emp-grid-2">
                    <div className="emp-form-group">
                      <label className="emp-label">Número</label>
                      <input type="text" name="numero" value={endereco.numero} onChange={handleChangeEndereco} placeholder="123" className="emp-input" />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-label">Bairro</label>
                      <input type="text" name="bairro" value={endereco.bairro} onChange={handleChangeEndereco} placeholder="Centro" className="emp-input" />
                    </div>
                  </div>
                  {/* Cidade + UF */}
                  <div className="emp-grid-2">
                    <div className="emp-form-group">
                      <label className="emp-label">Cidade</label>
                      <input type="text" name="cidade" value={endereco.cidade} onChange={handleChangeEndereco} placeholder="Sua Cidade" className="emp-input" />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-label">UF</label>
                      <input type="text" name="uf" value={endereco.uf} onChange={handleChangeEndereco} placeholder="SP" className="emp-input" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Presença Online */}
              <div className="emp-subsection">
                <p className="emp-subsection-title">
                  <Globe size={14} />
                  Presença Online <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>(opcional)</span>
                </p>
                <div className="emp-form-stack">
                  <div className="emp-form-group">
                    <label className="emp-label"><Globe size={14} /> Site</label>
                    <input type="text" value={site} onChange={(e) => setSite(e.target.value)} placeholder="www.suaempresa.com.br" className="emp-input" />
                  </div>
                  <div className="emp-grid-2">
                    <div className="emp-form-group">
                      <label className="emp-label"><Instagram size={14} /> Instagram</label>
                      <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" className="emp-input" />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-label"><Facebook size={14} /> Facebook</label>
                      <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Link ou usuário" className="emp-input" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Etapa 3: Galeria ── */}
          {etapa === 3 && (
            <div className="emp-form-stack">
              <div className="emp-section-header">
                <div className="emp-section-icon"><ImagePlus size={18} strokeWidth={1.5} /></div>
                <div>
                  <p className="emp-section-title">Galeria de Fotos</p>
                  <p className="emp-section-sub">Logo, capa e até 4 fotos do catálogo</p>
                </div>
              </div>

              {/* Logo */}
              <div className="emp-upload-card">
                <p className="emp-upload-card-title">Logo</p>
                <div className="emp-form-group">
                  <label className="emp-label" style={{ fontSize: '0.82rem' }}>URL da imagem</label>
                  <input type="text" value={fotoLogoUrl} onChange={(e) => setFotoLogoUrl(e.target.value)} placeholder="https://..." className="emp-input" />
                </div>
                <div className="emp-upload-or">ou</div>
                <label className="emp-label" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>Enviar do dispositivo</label>
                <div className="emp-file-zone">
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setFotoLogo(e.target.files[0]) }} />
                </div>
                {fotoLogo && (
                  <span className="emp-file-badge">
                    <CheckCircle2 size={13} /> {fotoLogo.name}
                  </span>
                )}
              </div>

              {/* Capa */}
              <div className="emp-upload-card">
                <p className="emp-upload-card-title">Foto de Capa</p>
                <div className="emp-form-group">
                  <label className="emp-label" style={{ fontSize: '0.82rem' }}>URL da imagem <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(opcional)</span></label>
                  <input type="text" value={fotoCapaUrl} onChange={(e) => setFotoCapaUrl(e.target.value)} placeholder="https://..." className="emp-input" />
                </div>
                <div className="emp-upload-or">ou</div>
                <label className="emp-label" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>Enviar do dispositivo</label>
                <div className="emp-file-zone">
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setFotoCapa(e.target.files[0]) }} />
                </div>
                {fotoCapa && (
                  <span className="emp-file-badge">
                    <CheckCircle2 size={13} /> {fotoCapa.name}
                  </span>
                )}
              </div>

              {/* Catálogo */}
              <div className="emp-upload-card">
                <p className="emp-upload-card-title">Catálogo de Fotos <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>— máx. 4</span></p>
                <div className="emp-catalog-grid">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="emp-catalog-slot">
                      <p className="emp-catalog-slot-label">
                        <ImagePlus size={13} />
                        Foto {index + 1}
                      </p>
                      <input
                        type="text"
                        value={fotosCatalogoUrl[index]}
                        onChange={(e) => {
                          const newUrls = [...fotosCatalogoUrl];
                          newUrls[index] = e.target.value;
                          setFotosCatalogoUrl(newUrls);
                        }}
                        placeholder="URL..."
                        className="emp-input"
                        style={{ fontSize: '0.82rem', marginBottom: '8px' }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const newFiles = [...fotosCatalogo] as any[];
                            newFiles[index] = e.target.files[0];
                            setFotosCatalogo(newFiles);
                          }
                        }}
                        style={{ width: '100%', fontSize: '0.8rem', cursor: 'pointer' }}
                      />
                      {fotosCatalogo[index] && (
                        <span className="emp-file-badge" style={{ marginTop: '6px' }}>
                          <CheckCircle2 size={12} /> {fotosCatalogo[index]?.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Etapa 4: Conta de Acesso ── */}
          {etapa === 4 && (
            <div className="emp-form-stack">
              <div className="emp-section-header">
                <div className="emp-section-icon"><UserRound size={18} strokeWidth={1.5} /></div>
                <div>
                  <p className="emp-section-title">Conta de Acesso</p>
                  <p className="emp-section-sub">Dados do administrador da {tipo.toLowerCase()}</p>
                </div>
              </div>

              <div className="emp-form-group">
                <label htmlFor="nomeAdmin" className="emp-label">
                  <UserRound size={14} /> Nome Completo
                </label>
                <input
                  id="nomeAdmin"
                  type="text"
                  value={nomeAdmin}
                  onChange={(e) => setNomeAdmin(e.target.value)}
                  placeholder="Seu nome completo"
                  className="emp-input"
                  autoComplete="name"
                />
              </div>

              <div className="emp-form-group">
                <label htmlFor="emailAdmin" className="emp-label">
                  E-mail para Login
                </label>
                <input
                  id="emailAdmin"
                  type="email"
                  value={emailAdmin}
                  onChange={(e) => setEmailAdmin(e.target.value)}
                  placeholder="seu@email.com"
                  className="emp-input"
                  autoComplete="email"
                />
              </div>

              <div className="emp-form-group">
                <label htmlFor="senhaAdmin" className="emp-label">
                  Senha
                </label>
                <div className="emp-input-wrapper">
                  <input
                    id="senhaAdmin"
                    type={showPassword ? 'text' : 'password'}
                    value={senhaAdmin}
                    onChange={(e) => setSenhaAdmin(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="emp-input emp-input-with-toggle"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="emp-password-toggle"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navegação */}
        <div className="emp-nav">
          {etapa > 1 ? (
            <button onClick={() => setEtapa(etapa - 1)} className="emp-btn-back">
              <ChevronLeft size={17} /> Voltar
            </button>
          ) : (
            <div />
          )}

          {etapa < 4 ? (
            <button onClick={() => setEtapa(etapa + 1)} className="btn-theme emp-btn-next">
              Avançar <ChevronRight size={17} />
            </button>
          ) : (
            <button
              className="btn-theme emp-btn-next"
              onClick={handleConcluir}
              disabled={uploading}
            >
              {uploading && <span className="emp-btn-spinner" aria-hidden="true" />}
              {uploading ? 'Enviando…' : 'Concluir Cadastro'}
            </button>
          )}
        </div>

        {/* Rodapé */}
        <div className="emp-footer">
          <p>Já tem uma conta? <Link href="/login">Faça Login</Link></p>
        </div>
      </div>
    </main>
  );
}
