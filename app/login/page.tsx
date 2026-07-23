'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, User, Building2, LogIn, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'cidadao' | 'empresa'>('cidadao');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // Estados de Recuperação de Senha
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const userId = data.user?.id;
      if (!userId) {
        router.push('/');
        return;
      }

      // Verificação de perfil e role (assim como em app/perfil/page.tsx)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role_id')
        .eq('id', userId)
        .single();

      let roleName = 'user';
      if (profile?.role_id) {
        const { data: role } = await supabase
          .from('user_roles')
          .select('name')
          .eq('id', profile.role_id)
          .single();
        if (role?.name) roleName = role.name;
      }

      // Se for administrador
      if (roleName === 'admin') {
        router.push(activeTab === 'empresa' ? '/admin' : '/');
        return;
      }

      // Checar se o usuário é proprietário ou membro de empresas / entidades
      const [{ data: empData }, { data: entData }] = await Promise.all([
        supabase.from('empresas').select('id').eq('user_id', userId).limit(1),
        supabase.from('entidades').select('id').eq('user_id', userId).limit(1),
      ]);

      const isEmpresaUser = roleName === 'company' || roleName === 'empresa' || Boolean(empData?.length || entData?.length);

      // Redirecionamento inteligente baseado no perfil e na aba selecionada
      if (activeTab === 'cidadao' && isEmpresaUser) {
        // Usuário empresa entrando como cidadão -> Redireciona para o perfil para gerenciar seu cadastro
        router.push('/perfil');
      } else if (activeTab === 'empresa' && !isEmpresaUser) {
        // Cidadão comum entrando pela aba de empresa -> Redireciona para cadastrar sua empresa
        router.push('/cadastro-empresa');
      } else {
        // Correspondência perfeita -> Redireciona normalmente para a home
        router.push('/');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao realizar o login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg('');
    setForgotSuccessMsg('');
    setForgotLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setForgotSuccessMsg('Enviamos um link de recuperação para seu e-mail! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setForgotErrorMsg(err.message || 'Erro ao solicitar a redefinição de senha. Tente novamente.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="login-page">
      <style>{`
        @keyframes login-spin { to { transform: rotate(360deg); } }
        @keyframes login-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-page {
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-offwhite);
          padding: 48px 20px;
        }

        .login-card {
          background-color: var(--bg-light);
          padding: 40px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          width: 100%;
          max-width: 440px;
          animation: login-fadein 0.3s ease-out;
        }

        /* ── Header ── */
        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-icon-badge {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background-color: var(--primary-light);
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .login-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
          font-family: var(--font-outfit), sans-serif;
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        /* ── Tabs ── */
        .login-tabs {
          display: flex;
          background-color: var(--bg-offwhite);
          padding: 4px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          margin-bottom: 24px;
          gap: 4px;
        }

        .login-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-radius: calc(var(--radius-md) - 3px);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .login-tab-btn:hover {
          color: var(--text-primary);
        }

        .login-tab-btn.active {
          background-color: var(--bg-light);
          color: var(--primary-color);
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        /* ── Alert Banners ── */
        .login-error-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background-color: var(--danger-light, #fef2f2);
          border: 1.5px solid rgba(239, 68, 68, 0.3);
          color: var(--danger-text, #dc2626);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          margin-bottom: 20px;
          font-size: 0.875rem;
          line-height: 1.4;
          animation: login-fadein 0.2s ease;
        }

        .login-success-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background-color: var(--success-light, #ecfdf5);
          border: 1.5px solid rgba(16, 185, 129, 0.3);
          color: var(--success-text, #047857);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          margin-bottom: 20px;
          font-size: 0.875rem;
          line-height: 1.4;
          animation: login-fadein 0.2s ease;
        }

        .login-error-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* ── Form ── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-tertiary);
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .login-input {
          width: 100%;
          padding: 11px 14px 11px 42px;
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

        .login-input.has-toggle {
          padding-right: 44px;
        }

        .login-input::placeholder {
          color: var(--text-tertiary);
        }

        .login-input:hover {
          border-color: #d1d5db;
        }

        .login-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px var(--primary-light);
          background-color: var(--bg-light);
        }

        .login-input:focus + .login-input-icon,
        .login-input-wrap:focus-within .login-input-icon {
          color: var(--primary-color);
        }

        .login-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: color 0.15s ease, background-color 0.15s ease;
        }

        .login-toggle-btn:hover {
          color: var(--text-primary);
          background-color: rgba(0,0,0,0.04);
        }

        /* ── Action rows ── */
        .login-forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -4px;
        }

        .login-forgot-btn {
          font-size: 0.825rem;
          color: var(--primary-color);
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.15s ease, text-decoration 0.15s ease;
        }

        .login-forgot-btn:hover {
          color: var(--primary-color-hover);
          text-decoration: underline;
        }

        .login-forgot-btn:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        .login-submit-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background-color: var(--primary-color);
          color: var(--bg-light);
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.95rem;
          font-family: inherit;
          cursor: pointer;
          margin-top: 6px;
          box-shadow: var(--shadow-sm);
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .login-submit-btn:hover:not(:disabled) {
          background-color: var(--primary-color-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .login-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-spin {
          animation: login-spin 0.8s linear infinite;
        }

        /* ── Footer Link ── */
        .login-footer {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .login-signup-link {
          color: var(--primary-color);
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
          transition: color 0.15s ease, text-decoration 0.15s ease;
        }

        .login-signup-link:hover {
          color: var(--primary-color-hover);
          text-decoration: underline;
        }

        /* ── Modal de Recuperação de Senha ── */
        .login-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(17, 24, 39, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(6px);
          padding: 20px;
          animation: login-fadein 0.2s ease-out;
        }

        .login-modal {
          background: var(--bg-light);
          width: 100%;
          max-width: 440px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          padding: 28px;
          animation: login-fadein 0.25s ease-out;
        }

        .login-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .login-modal-title {
          font-size: 1.35rem;
          font-weight: 800;
          font-family: var(--font-outfit), sans-serif;
          color: var(--text-primary);
          margin: 0 0 4px;
        }

        .login-modal-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .login-modal-close {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }

        .login-modal-close:hover {
          color: var(--text-primary);
          background-color: var(--bg-offwhite);
        }

        .login-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
        }

        .login-modal-cancel {
          padding: 10px 18px;
          background: var(--bg-offwhite);
          color: var(--text-secondary);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          font-size: 0.875rem;
          transition: all 0.15s ease;
        }

        .login-modal-cancel:hover {
          border-color: var(--text-secondary);
          color: var(--text-primary);
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 24px 16px;
          }
          .login-card {
            padding: 28px 20px;
          }
        }
      `}</style>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-badge">
            <LogIn size={24} />
          </div>
          <h1 className="login-title">Acesse sua Conta</h1>
          <p className="login-subtitle">
            Escolha como deseja entrar na plataforma.
          </p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button 
            type="button"
            onClick={() => setActiveTab('cidadao')}
            className={`login-tab-btn ${activeTab === 'cidadao' ? 'active' : ''}`}
          >
            <User size={16} /> Sou Cidadão
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('empresa')}
            className={`login-tab-btn ${activeTab === 'empresa' ? 'active' : ''}`}
          >
            <Building2 size={16} /> Empresa / Entidade
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="login-error-banner" role="alert">
            <AlertCircle size={18} className="login-error-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label className="login-label" htmlFor="email-input">E-mail</label>
            <div className="login-input-wrap">
              <Mail size={18} className="login-input-icon" />
              <input 
                id="email-input"
                type="email" 
                placeholder="seu@email.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password-input">Senha</label>
            <div className="login-input-wrap">
              <Lock size={18} className="login-input-icon" />
              <input 
                id="password-input"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input has-toggle"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="login-toggle-btn"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-forgot-row">
            <button 
              type="button" 
              onClick={() => {
                setForgotEmail(email);
                setForgotSuccessMsg('');
                setForgotErrorMsg('');
                setIsForgotModalOpen(true);
              }} 
              className="login-forgot-btn"
            >
              Esqueci minha senha
            </button>
          </div>

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="login-spin" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          {activeTab === 'cidadao' ? (
            <p>Ainda não tem conta? <Link href="/cadastro-cidadao" className="login-signup-link">Cadastre-se grátis</Link></p>
          ) : (
            <p>Quer anunciar seu negócio? <Link href="/cadastro-empresa" className="login-signup-link">Crie sua conta</Link></p>
          )}
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {isForgotModalOpen && (
        <div className="login-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsForgotModalOpen(false)}>
          <div className="login-modal">
            <div className="login-modal-header">
              <div>
                <h2 className="login-modal-title">Recuperar Senha</h2>
                <p className="login-modal-subtitle">Digite seu e-mail para receber um link de redefinição.</p>
              </div>
              <button 
                type="button" 
                className="login-modal-close" 
                onClick={() => setIsForgotModalOpen(false)}
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            {forgotSuccessMsg && (
              <div className="login-success-banner" role="status">
                <CheckCircle2 size={18} className="login-error-icon" />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {forgotErrorMsg && (
              <div className="login-error-banner" role="alert">
                <AlertCircle size={18} className="login-error-icon" />
                <span>{forgotErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="login-form">
              <div className="login-field">
                <label className="login-label" htmlFor="forgot-email-input">E-mail Cadastrado</label>
                <div className="login-input-wrap">
                  <Mail size={18} className="login-input-icon" />
                  <input 
                    id="forgot-email-input"
                    type="email" 
                    placeholder="seu@email.com" 
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="login-input"
                  />
                </div>
              </div>

              <div className="login-modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsForgotModalOpen(false)} 
                  className="login-modal-cancel"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={forgotLoading}
                  className="login-submit-btn"
                  style={{ width: 'auto', marginTop: 0 }}
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 size={16} className="login-spin" />
                      Enviando…
                    </>
                  ) : (
                    'Enviar Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
