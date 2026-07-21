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
    <main style={{ padding: '60px 20px', backgroundColor: 'var(--bg-offwhite)', minHeight: 'calc(100vh - 200px)' }}>
      <style>{`
        .contato-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 40px;
        }
        @media (max-width: 768px) {
          .contato-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <h1 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--primary-color)' }}>Fale Conosco</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px' }}>
          Dúvidas, sugestões ou quer reivindicar o seu negócio? Mande uma mensagem para nossa equipe.
        </p>

        <div className="contato-grid">
          
          {/* Informações de Contato */}
          <div>
            <h3 style={{ marginBottom: '20px' }}>Nossos Contatos</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '10px', borderRadius: '50%' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#1a202c', marginBottom: '3px' }}>Endereço</h4>
                  <p>Rua Principal, 123 - Centro<br />Sua Cidade / SC</p>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '10px', borderRadius: '50%' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#1a202c', marginBottom: '3px' }}>Telefone / WhatsApp</h4>
                  <p>(00) 9 0000-0000</p>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '10px', borderRadius: '50%' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#1a202c', marginBottom: '3px' }}>E-mail</h4>
                  <p>contato@guia1555.com</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Formulário de Contato */}
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Nome Completo</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome" 
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Assunto</label>
                <input 
                  type="text" 
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Dúvida, Reivindicar Empresa..." 
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Mensagem</label>
                <textarea 
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Escreva sua mensagem aqui..." 
                  required
                  rows={5}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)', resize: 'vertical' }} 
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn-theme" 
                disabled={enviando}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', opacity: enviando ? 0.7 : 1 }}
              >
                <Send size={18} />
                {enviando ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>

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
