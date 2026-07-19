'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'cidadao' | 'empresa'>('cidadao');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ backgroundColor: 'var(--bg-light)', padding: '40px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--primary-color)' }}>Acesse sua Conta</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Escolha como deseja entrar na plataforma.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eaeaea', marginBottom: '25px' }}>
          <button 
            onClick={() => setActiveTab('cidadao')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'cidadao' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'cidadao' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
            Sou Cidadão
          </button>
          <button 
            onClick={() => setActiveTab('empresa')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'empresa' ? '3px solid var(--primary-color)' : '3px solid transparent',
              color: activeTab === 'empresa' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
            Empresa / Entidade
          </button>
        </div>

        {/* Formulário */}
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>E-mail</label>
            <input type="email" placeholder="seu@email.com" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Senha</label>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>Esqueci minha senha</a>
          </div>

          <button type="button" className="btn-theme" style={{ marginTop: '10px', padding: '12px' }}>Entrar</button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {activeTab === 'cidadao' ? (
            <p>Ainda não tem conta? <Link href="/cadastro-cidadao" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Cadastre-se grátis</Link></p>
          ) : (
            <p>Quer anunciar seu negócio? <Link href="/cadastro-empresa" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Crie sua conta</Link></p>
          )}
        </div>
      </div>
    </main>
  );
}
