'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Categorias e Subcategorias agora vêm do Supabase

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
  const [fotosCatalogo, setFotosCatalogo] = useState<(File|null)>([null, null, null, null]);
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
    
    // Auto format XXXXX-XXX
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{1,3})/, "$1-$2");
    }
    setCep(value);

    // Fetch address from ViaCEP when CEP is complete
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

    const { error: uploadError } = await supabase.storage
      .from('imagens')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('imagens').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleConcluir = async () => {
    setUploading(true);
    const slug = nomeEntidade.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    let finalLogoUrl = fotoLogoUrl;
    let finalCapaUrl = fotoCapaUrl;
    let finalCatalogoUrls = [...fotosCatalogoUrl];
    
    try {
      if (fotoLogo) {
        finalLogoUrl = await uploadImage(fotoLogo, `empresas/${slug}/logo`);
      }
      
      if (fotoCapa) {
        finalCapaUrl = await uploadImage(fotoCapa, `empresas/${slug}/capa`);
      }
      
      for (let i = 0; i < 4; i++) {
        if (fotosCatalogo[i]) {
          const url = await uploadImage(fotosCatalogo[i]!, `empresas/${slug}/catalogo`);
          finalCatalogoUrls[i] = url;
        }
      }
      
      const fotos_catalogo = finalCatalogoUrls.filter(url => url !== '');

      // 1. Criar a conta do usuário no Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailAdmin,
        password: senhaAdmin,
        options: {
          data: {
            nome: nomeAdmin,
            telefone: whatsapp,
          }
        }
      });

      if (authError) throw authError;
      const userId = authData.user?.id;

      // 2. Inserir a empresa
      const novaEmpresa = {
        user_id: userId,
        nome: nomeEntidade || 'Empresa Sem Nome',
        slug,
        categoria: categoria || 'Serviços',
        tags: [],
        descricao: 'Descrição pendente.',
        avaliacao: 0,
        telefone: whatsapp,
        endereco: `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}`,
        status: 'fechado',
        logo: finalLogoUrl,
        site,
        instagram,
        facebook,
        reivindicada: true,
        capa: finalCapaUrl || `https://via.placeholder.com/1200x400?text=${encodeURIComponent(nomeEntidade || 'Empresa')}`,
        fotos_catalogo,
        tipo
      };

      const { error } = await supabase.from('empresas').insert([novaEmpresa]);
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
    <main style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <style>{`
        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .grid-cep {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .grid-cep-full {
          grid-column: 1 / -1;
        }
        @media (max-width: 768px) {
          .grid-2-col, .grid-cep {
            grid-template-columns: 1fr !important;
          }
          .grid-cep-full {
            grid-column: 1 / -1 !important;
          }
        }
      `}</style>
      <div style={{ backgroundColor: 'var(--bg-light)', padding: '40px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '600px' }}>
        
        <h1 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--primary-color)' }}>Anuncie Grátis</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Crie o perfil da sua {tipo.toLowerCase()} em 4 passos simples.
        </p>

        {/* Indicador de Etapas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
          {[1, 2, 3, 4].map(step => (
            <div key={step} style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              backgroundColor: etapa >= step ? 'var(--primary-color)' : '#e0e0e0', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              zIndex: 1
            }}>
              {step}
            </div>
          ))}
          {/* Linha conectora */}
          <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', height: '2px', backgroundColor: '#e0e0e0', zIndex: 0 }} />
        </div>

        {/* Formulário - Etapa Atual */}
        <div style={{ minHeight: '200px' }}>
          {etapa === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3>Etapa 1: Dados Básicos</h3>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Tipo de Cadastro</label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="radio" name="tipo" value="Empresa" checked={tipo === 'Empresa'} onChange={() => { setTipo('Empresa'); setCategoria(''); setSubCategoria(''); }} />
                    Empresa
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="radio" name="tipo" value="Entidade" checked={tipo === 'Entidade'} onChange={() => { setTipo('Entidade'); setCategoria(''); setSubCategoria(''); }} />
                    Entidade
                  </label>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nome da {tipo}</label>
                <input 
                  type="text" 
                  value={nomeEntidade}
                  onChange={(e) => setNomeEntidade(e.target.value)}
                  placeholder={`Ex: ${tipo === 'Empresa' ? 'Pizzaria do Mário' : 'Associação Bairro X'}`} 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              <div className="grid-2-col">
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Categoria</label>
                  <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setSubCategoria(''); }} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }}>
                    <option value="">Selecione...</option>
                    {categoriasDb.filter(c => c.tipo === tipo).map(cat => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                {categoria && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Sub-categoria</label>
                    <select value={subCategoria} onChange={(e) => setSubCategoria(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }}>
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

          {etapa === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3>Etapa 2: Contato e Endereço</h3>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>WhatsApp</label>
                <input 
                  type="text" 
                  value={whatsapp}
                  onChange={handleWhatsapp}
                  placeholder="(00) 0 0000-0000" 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Endereço Detalhado</label>
                <div className="grid-cep">
                  <div className="grid-cep-full">
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>CEP</label>
                    <input 
                      type="text" 
                      value={cep} 
                      onChange={handleCep} 
                      placeholder="00000-000" 
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                    />
                  </div>
                  <div className="grid-cep-full">
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>Rua</label>
                    <input type="text" name="rua" value={endereco.rua} onChange={handleChangeEndereco} placeholder="Nome da rua" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>Número</label>
                    <input type="text" name="numero" value={endereco.numero} onChange={handleChangeEndereco} placeholder="123" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>Bairro</label>
                    <input type="text" name="bairro" value={endereco.bairro} onChange={handleChangeEndereco} placeholder="Centro" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>Cidade</label>
                    <input type="text" name="cidade" value={endereco.cidade} onChange={handleChangeEndereco} placeholder="Sua Cidade" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>UF</label>
                    <input type="text" name="uf" value={endereco.uf} onChange={handleChangeEndereco} placeholder="SP" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Presença Online</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>Site</label>
                    <input type="text" value={site} onChange={(e) => setSite(e.target.value)} placeholder="www.suaempresa.com.br" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                  </div>
                  <div className="grid-2-col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>Instagram</label>
                      <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seuinstagram" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>Facebook</label>
                      <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Link ou usuário" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <h3>Etapa 3: Galeria de Fotos</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Adicione a sua Logo, Foto de capa (banner principal) e até 4 fotos para o catálogo.
              </p>
              
              <div style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '15px' }}>Logo</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem' }}>URL da Imagem</label>
                  <input type="text" value={fotoLogoUrl} onChange={(e) => setFotoLogoUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                  
                  <div style={{ margin: '10px 0', textAlign: 'center', fontWeight: 'bold' }}>OU</div>
                  
                  <label style={{ display: 'block', fontSize: '0.9rem' }}>Enviar do Dispositivo</label>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setFotoLogo(e.target.files[0]) }} style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} />
                  {fotoLogo && <span style={{ fontSize: '0.8rem', color: 'green' }}>Arquivo selecionado: {fotoLogo.name}</span>}
                </div>
              </div>

              <div style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '15px' }}>Foto de Capa</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem' }}>URL da Imagem (opcional se enviar arquivo)</label>
                  <input type="text" value={fotoCapaUrl} onChange={(e) => setFotoCapaUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
                  
                  <div style={{ margin: '10px 0', textAlign: 'center', fontWeight: 'bold' }}>OU</div>
                  
                  <label style={{ display: 'block', fontSize: '0.9rem' }}>Enviar do Dispositivo</label>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setFotoCapa(e.target.files[0]) }} style={{ width: '100%', padding: '10px', border: '1px dashed #ccc', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} />
                  {fotoCapa && <span style={{ fontSize: '0.8rem', color: 'green' }}>Arquivo selecionado: {fotoCapa.name}</span>}
                </div>
              </div>

              <div style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '15px' }}>Fotos do Catálogo (Máx. 4)</h4>
                
                <div className="grid-2-col">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px' }}>Foto {index + 1}</p>
                      
                      <input type="text" value={fotosCatalogoUrl[index]} onChange={(e) => {
                        const newUrls = [...fotosCatalogoUrl];
                        newUrls[index] = e.target.value;
                        setFotosCatalogoUrl(newUrls);
                      }} placeholder="URL da imagem" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)', marginBottom: '10px', fontSize: '0.8rem' }} />
                      
                      <input type="file" accept="image/*" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const newFiles = [...fotosCatalogo] as any[];
                          newFiles[index] = e.target.files[0];
                          setFotosCatalogo(newFiles);
                        }
                      }} style={{ width: '100%', fontSize: '0.8rem' }} />
                      
                      {fotosCatalogo[index] && <span style={{ fontSize: '0.75rem', color: 'green', display: 'block', marginTop: '5px' }}>Selecionado: {fotosCatalogo[index]?.name}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {etapa === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3>Etapa 4: Conta de Acesso</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Os dados do administrador da empresa</p>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nome Completo</label>
                <input type="text" value={nomeAdmin} onChange={(e) => setNomeAdmin(e.target.value)} placeholder="Seu nome completo" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>E-mail para Login</label>
                <input type="email" value={emailAdmin} onChange={(e) => setEmailAdmin(e.target.value)} placeholder="seu@email.com" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={senhaAdmin}
                    onChange={(e) => setSenhaAdmin(e.target.value)}
                    placeholder="••••••••" 
                    style={{ width: '100%', padding: '12px', paddingRight: '40px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          {etapa > 1 ? (
            <button 
              onClick={() => setEtapa(etapa - 1)} 
              style={{ padding: '10px 20px', border: '1px solid #ccc', background: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>
              Voltar
            </button>
          ) : (
            <div></div> // Placeholder para flex-between
          )}
          
          {etapa < 4 ? (
            <button 
              onClick={() => setEtapa(etapa + 1)} 
              className="btn-theme">
              Avançar
            </button>
          ) : (
            <button className="btn-theme" onClick={handleConcluir} disabled={uploading}>
              {uploading ? 'Enviando...' : 'Concluir Cadastro'}
            </button>
          )}
        </div>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p>Já tem uma conta? <Link href="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Faça Login</Link></p>
        </div>

      </div>
    </main>
  );
}
