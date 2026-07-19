'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function CadastroCidadao() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleConcluir = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cadastro realizado com sucesso!');
    router.push('/login');
  };

  return (
    <main style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div style={{ backgroundColor: 'var(--bg-light)', padding: '40px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--primary-color)' }}>Crie sua Conta</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Preencha seus dados para acessar como cidadão.
        </p>

        {/* Formulário */}
        <form onSubmit={handleConcluir} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Nome Completo</label>
            <input type="text" required placeholder="João da Silva" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>E-mail</label>
            <input type="email" required placeholder="seu@email.com" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required
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
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, fontSize: '0.9rem' }}>Confirmar Senha</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                required
                placeholder="••••••••" 
                style={{ width: '100%', padding: '12px', paddingRight: '40px', border: '1px solid #ccc', borderRadius: 'var(--radius-sm)' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-theme" style={{ marginTop: '10px', padding: '12px' }}>Criar Conta</button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p>Já tem uma conta? <Link href="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Faça Login</Link></p>
        </div>
      </div>
    </main>
  );
}
