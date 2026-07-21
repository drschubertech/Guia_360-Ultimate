'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function ContatoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // Preenche o assunto automaticamente se vier via URL (ex: Reivindicar Empresa)
    const assuntoUrl = searchParams.get('assunto');
    if (assuntoUrl) {
      setAssunto(assuntoUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    // Auto-preenche nome e email se o usuário estiver logado
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        if (session.user.email) setEmail(session.user.email);
        
        const meta = session.user.user_metadata;
        if (meta) {
          const nomeUsuario = meta.full_name || meta.nome || meta.name || '';
          if (nomeUsuario) setNome(nomeUsuario);
        }
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (window.confirm('Para prosseguir com essa ação você deve ser cadastrado. Deseja se cadastrar agora?')) {
          router.push('/cadastro-cidadao');
        }
        setEnviando(false);
        return;
      }
      
      const userId = session.user.id;
      const companyId = searchParams.get('company_id') || null;
      const tipo = searchParams.get('tipo') || null;

      const { error } = await supabase.from('contact_messages').insert([{
        name: nome,
        email: email,
        subject: assunto,
        message: mensagem,
        user_id: userId,
        company_id: companyId,
        tipo_empresa: tipo,
        status: 'pending'
      }]);

      if (error) throw error;

      alert('Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.');
      setNome('');
      setEmail('');
      setAssunto('');
      setMensagem('');
    } catch (error: any) {
      alert('Erro ao enviar mensagem: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="contato-page">
      <style>{`
        .contato-page {
          background-color: var(--bg-offwhite);
          min-height: calc(100vh - 100px);
          display: flex;
          align-items: center;
          padding: 80px 20px;
        }

        .contato-container {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
          align-items: start;
        }

        .contato-header {
          margin-bottom: 40px;
        }

        .contato-title {
          font-size: 3rem;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .contato-title span {
          color: var(--primary-color);
        }

        .contato-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .info-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }

        .info-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-pill);
          background-color: var(--primary-light);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .info-item:hover .info-icon-wrapper {
          transform: scale(1.1);
        }

        .info-content h4 {
          color: var(--text-primary);
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .info-content p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .form-card {
          background: var(--bg-light);
          padding: 40px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 1rem;
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          background-color: var(--bg-light);
          box-shadow: 0 0 0 4px var(--primary-light);
        }

        .form-input::placeholder {
          color: var(--text-tertiary);
        }

        textarea.form-input {
          resize: vertical;
          min-height: 120px;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          font-size: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        @media (max-width: 900px) {
          .contato-container {
            grid-template-columns: 1fr;
            gap: 50px;
          }
          
          .contato-title {
            font-size: 2.5rem;
          }
          
          .form-card {
            padding: 30px 20px;
          }
        }
      `}</style>
      
      <div className="contato-container">
        
        {/* Lado Esquerdo - Mensagem e Info */}
        <div className="contato-info">
          <div className="contato-header">
            <h1 className="contato-title">Como podemos <span>ajudar?</span></h1>
            <p className="contato-subtitle">
              Seja para tirar uma dúvida, enviar uma sugestão ou reivindicar a página do seu negócio, nossa equipe está pronta para ouvir você.
            </p>
          </div>

          <ul className="info-list">
            <li className="info-item">
              <div className="info-icon-wrapper">
                <MapPin size={24} strokeWidth={1.5} />
              </div>
              <div className="info-content">
                <h4>Onde estamos</h4>
                <p>Rua Principal, 123 - Centro<br />Sua Cidade / SC</p>
              </div>
            </li>
            <li className="info-item">
              <div className="info-icon-wrapper">
                <Phone size={24} strokeWidth={1.5} />
              </div>
              <div className="info-content">
                <h4>Fale diretamente</h4>
                <p>(00) 9 0000-0000</p>
              </div>
            </li>
            <li className="info-item">
              <div className="info-icon-wrapper">
                <Mail size={24} strokeWidth={1.5} />
              </div>
              <div className="info-content">
                <h4>Escreva para nós</h4>
                <p>contato@guia1555.com</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome" className="form-label">Nome Completo</label>
              <input 
                id="nome"
                type="text" 
                className="form-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como devemos chamar você?" 
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input 
                id="email"
                type="email" 
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@melhoremail.com" 
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="assunto" className="form-label">Assunto</label>
              <input 
                id="assunto"
                type="text" 
                className="form-input"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Sobre o que vamos conversar?" 
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="mensagem" className="form-label">Mensagem</label>
              <textarea 
                id="mensagem"
                className="form-input"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva todos os detalhes aqui..." 
                required
                rows={5}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn-theme submit-btn" 
              disabled={enviando}
              style={{ opacity: enviando ? 0.7 : 1 }}
            >
              <Send size={20} strokeWidth={1.5} />
              {enviando ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}

export default function Contato() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ContatoContent />
    </Suspense>
  );
}
