'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
          <Link href="/" className={styles.logo}>
            <img src="/logo.png" alt="Guia 360º Logo" width={40} height={40} style={{ objectFit: 'contain', borderRadius: '8px' }} />
            <span>GUIA LOCAL 360º</span>
          </Link>

          <button className={styles.menuButton} onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Início</Link>
            <Link href="/guia-comercial" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Guia Comercial</Link>
            <Link href="/empresas" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Empresas</Link>
            <Link href="/entidades" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Entidades</Link>
            
            <div className={styles.mobileActions}>
              <Link href="/login" className={styles.loginBtn} onClick={() => setIsMenuOpen(false)}>Entrar</Link>
              <Link href="/cadastro-empresa" className="btn-theme btn-pill" onClick={() => setIsMenuOpen(false)}>
                ANUNCIAR GRÁTIS
              </Link>
            </div>
          </nav>

          <div className={styles.desktopActions}>
            <Link href="/login" className={styles.loginBtn}>Entrar</Link>
            <Link href="/cadastro-empresa" className="btn-theme btn-pill">
              ANUNCIAR GRÁTIS
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
