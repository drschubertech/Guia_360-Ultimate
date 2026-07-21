'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2, UserRound, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --- Lógica de força de senha (puramente visual, não altera o fluxo de envio) ---
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Fraca', color: '#ef4444' };
  if (score === 2) return { score: 2, label: 'Razoável', color: '#f97316' };
  if (score === 3) return { score: 3, label: 'Boa', color: '#3b82f6' };
  return { score: 4, label: 'Forte', color: '#22c55e' };
}

export default function CadastroCidadao() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados do formulário
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleConcluir = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem!');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        throw error;
      }

      alert('Cadastro realizado com sucesso! Verifique seu e-mail ou faça login.');
      router.push('/');
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao realizar o cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cadastro-page">
      <style>{`
        .cadastro-page {
          background-color: var(--bg-offwhite);
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .cadastro-card {
          background: var(--bg-light);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 480px;
          padding: 48px 40px 40px;
        }

        /* --- Cabeçalho --- */
        .cadastro-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .cadastro-icon-badge {
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

        .cadastro-title {
          font-size: 1.75rem;
          font-family: var(--font-outfit), sans-serif;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .cadastro-title span {
          color: var(--primary-color);
        }

        .cadastro-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* --- Mensagem de erro --- */
        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          margin-bottom: 24px;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .error-banner svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* --- Campos do formulário --- */
        .cad-form-group {
          margin-bottom: 20px;
        }

        .cad-form-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .cad-form-label svg {
          color: var(--text-tertiary);
        }

        .cad-input-wrapper {
          position: relative;
        }

        .cad-form-input {
          width: 100%;
          padding: 13px 16px;
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

        .cad-form-input::placeholder {
          color: var(--text-tertiary);
        }

        .cad-form-input:hover {
          border-color: #d1d5db;
        }

        .cad-form-input:focus {
          border-color: var(--primary-color);
          background-color: var(--bg-light);
          box-shadow: 0 0 0 4px var(--primary-light);
        }

        .cad-form-input.input-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px #fee2e2;
        }

        .cad-form-input.input-success {
          border-color: #22c55e;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        .cad-form-input-toggle {
          padding-right: 48px;
        }

        /* --- Toggle de senha --- */
        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }

        .password-toggle:hover {
          color: var(--text-secondary);
        }

        .password-toggle:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        /* --- Medidor de força de senha --- */
        .password-strength {
          margin-top: 10px;
        }

        .strength-bars {
          display: flex;
          gap: 4px;
          margin-bottom: 5px;
        }

        .strength-bar {
          height: 4px;
          flex: 1;
          border-radius: 99px;
          background-color: var(--border-color);
          transition: background-color 0.3s ease;
        }

        .strength-label {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          font-weight: 500;
          transition: color 0.3s ease;
        }

        /* --- Feedback de correspondência de senhas --- */
        .confirm-feedback {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 0.82rem;
          font-weight: 500;
        }

        .confirm-feedback.match {
          color: #16a34a;
        }

        .confirm-feedback.mismatch {
          color: #dc2626;
        }

        /* --- Divisor de seção --- */
        .section-divider {
          height: 1px;
          background: var(--border-color);
          margin: 8px 0 20px;
        }

        /* --- Botão de submit --- */
        .submit-btn {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          font-size: 1rem;
          border-radius: var(--radius-sm);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .btn-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cad-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes cad-spin {
          to { transform: rotate(360deg); }
        }

        /* --- Rodapé do card --- */
        .cadastro-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .cadastro-footer a {
          color: var(--primary-color);
          font-weight: 600;
          transition: color 0.15s ease;
        }

        .cadastro-footer a:hover {
          color: var(--primary-color-hover);
        }

        /* --- Responsivo --- */
        @media (max-width: 520px) {
          .cadastro-card {
            padding: 36px 24px 32px;
          }
          .cadastro-title {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="cadastro-card">

        {/* Cabeçalho */}
        <div className="cadastro-header">
          <div className="cadastro-icon-badge">
            <UserRound size={28} strokeWidth={1.5} />
          </div>
          <h1 className="cadastro-title">
            Crie sua <span>Conta</span>
          </h1>
          <p className="cadastro-subtitle">
            Preencha seus dados para acessar como cidadão.
          </p>
        </div>

        {/* Banner de erro */}
        {errorMsg && (
          <div className="error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleConcluir} noValidate>

          {/* Nome */}
          <div className="cad-form-group">
            <label htmlFor="fullName" className="cad-form-label">
              <UserRound size={15} />
              Nome Completo
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="João da Silva"
              className="cad-form-input"
              autoComplete="name"
            />
          </div>

          {/* E-mail */}
          <div className="cad-form-group">
            <label htmlFor="email" className="cad-form-label">
              <Mail size={15} />
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="cad-form-input"
              autoComplete="email"
            />
          </div>

          {/* Divisor entre dados pessoais e segurança */}
          <div className="section-divider" />

          {/* Senha */}
          <div className="cad-form-group">
            <label htmlFor="password" className="cad-form-label">
              <Lock size={15} />
              Senha
            </label>
            <div className="cad-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="cad-form-input cad-form-input-toggle"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {/* Medidor de força */}
            {password.length > 0 && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="strength-bar"
                      style={{
                        backgroundColor: level <= passwordStrength.score
                          ? passwordStrength.color
                          : undefined,
                      }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: passwordStrength.color }}>
                  Senha {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className="cad-form-group">
            <label htmlFor="confirmPassword" className="cad-form-label">
              <Lock size={15} />
              Confirmar Senha
            </label>
            <div className="cad-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha acima"
                className={`cad-form-input cad-form-input-toggle${passwordsMatch ? ' input-success' : passwordsMismatch ? ' input-error' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {/* Feedback de correspondência */}
            {passwordsMatch && (
              <div className="confirm-feedback match">
                <CheckCircle2 size={14} />
                As senhas coincidem
              </div>
            )}
            {passwordsMismatch && (
              <div className="confirm-feedback mismatch">
                <AlertCircle size={14} />
                As senhas não coincidem
              </div>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="btn-theme submit-btn"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" aria-hidden="true" style={{ marginRight: '8px' }} />}
            {loading ? 'Criando conta…' : 'Criar Conta'}
          </button>
        </form>

        {/* Rodapé */}
        <div className="cadastro-footer">
          <p>Já tem uma conta? <Link href="/login">Faça Login</Link></p>
        </div>
      </div>
    </main>
  );
}
