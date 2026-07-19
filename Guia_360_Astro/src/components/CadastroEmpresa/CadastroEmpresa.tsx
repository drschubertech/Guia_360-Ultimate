import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const categorias = {
  Empresa: {
    "Alimentação": ["Restaurante", "Pizzaria", "Lanchonete", "Cafeteria"],
    "Saúde e Beleza": ["Salão de Beleza", "Clínica Médica", "Barbearia", "Academia"],
    "Comércio": ["Supermercado", "Loja de Roupas", "Eletrônicos"],
    "Serviços": ["Mecânica", "Assistência Técnica", "Limpeza"]
  },
  Entidade: {
    "Entidades Sociais": ["ONG", "Associação de Moradores", "Sindicato"],
    "Entidades Públicas": ["Posto de Saúde", "Prefeitura", "Secretaria", "Escola Pública"],
    "Religioso": ["Igreja", "Templo", "Centro Espírita"]
  }
};

export default function CadastroEmpresa() {
  const [etapa, setEtapa] = useState(1);
  const [tipo, setTipo] = useState<'Empresa' | 'Entidade'>('Empresa');
  const [categoria, setCategoria] = useState('');
  const [subCategoria, setSubCategoria] = useState('');
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

  const handleConcluir = () => {
    alert('Cadastro enviado para aprovação!');
    window.location.href = '/empresa/nova-empresa';
  };

  return (
    <main style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
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
                <input type="text" placeholder={`Ex: ${tipo === 'Empresa' ? 'Pizzaria do Mário' : 'Associação Bairro X'}`} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Categoria</label>
                  <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setSubCategoria(''); }} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }}>
                    <option value="">Selecione...</option>
                    {Object.keys(categorias[tipo]).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {categoria && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Sub-categoria</label>
                    <select value={subCategoria} onChange={(e) => setSubCategoria(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }}>
                      <option value="">Selecione...</option>
                      {(categorias[tipo] as Record<string, string[]>)[categoria]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '3px' }}>CEP</label>
                    <input 
                      type="text" 
                      value={cep} 
                      onChange={handleCep} 
                      placeholder="00000-000" 
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
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
            </div>
          )}

          {etapa === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3>Etapa 3: Horário e Galeria</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Faça upload da logo e fotos do seu negócio (Mock)</p>
              <div style={{ border: '2px dashed #ccc', padding: '30px', textAlign: 'center', borderRadius: 'var(--radius-sm)' }}>
                Arraste imagens aqui
              </div>
            </div>
          )}

          {etapa === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3>Etapa 4: Conta de Acesso</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Os dados do administrador da empresa</p>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nome Completo</label>
                <input type="text" placeholder="Seu nome completo" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>E-mail para Login</label>
                <input type="email" placeholder="seu@email.com" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
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
            <button className="btn-theme" onClick={handleConcluir}>
              Concluir Cadastro
            </button>
          )}
        </div>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p>Já tem uma conta? <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Faça Login</a></p>
        </div>

      </div>
    </main>
  );
}
