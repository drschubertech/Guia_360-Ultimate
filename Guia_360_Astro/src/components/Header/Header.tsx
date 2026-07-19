import { useState } from 'react';
import { Menu, X, MapPin } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      {/* Top Bar (Opcional - Conforme Diretrizes) */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContainer}`}>
          <span>Bem-vindo, selecione sua cidade</span>
          <div>
            <span>Siga-nos nas redes sociais</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={styles.mainHeader}>
        <div className={`container ${styles.mainHeaderContainer}`}>
          <a href="/" className={styles.logo}>
            <MapPin size={36} className={styles.logoIcon} />
            <span>GUIA LOCAL 360º</span>
          </a>

          <button className={styles.menuButton} onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
            <a href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Início</a>
            <a href="/guia-comercial" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Guia Comercial</a>
            <a href="/empresas" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Empresas</a>
            <a href="/entidades" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Entidades</a>
            
            <div className={styles.mobileActions}>
              <a href="/login" className={styles.loginBtn} onClick={() => setIsMenuOpen(false)}>Entrar</a>
              <a href="/cadastro-empresa" className="btn-theme btn-pill" onClick={() => setIsMenuOpen(false)}>
                ANUNCIAR GRÁTIS
              </a>
            </div>
          </nav>

          <div className={styles.desktopActions}>
            <a href="/login" className={styles.loginBtn}>Entrar</a>
            <a href="/cadastro-empresa" className="btn-theme btn-pill">
              ANUNCIAR GRÁTIS
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
