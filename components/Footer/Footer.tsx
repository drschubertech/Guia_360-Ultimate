import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.column}>
          <h3>Guia 1555</h3>
          <p>
            O maior portal de conteúdo e guia comercial da região. Encontre empresas, serviços e fique por dentro das notícias e eventos locais.
          </p>
        </div>
        
        <div className={styles.column}>
          <h3>Links Rápidos</h3>
          <ul className={styles.links}>
            <li><Link href="/">Início</Link></li>
            <li><Link href="/guia-comercial">Guia Comercial</Link></li>
            <li><Link href="/empresas">Empresas</Link></li>
            <li><Link href="/cadastro-empresa">Anuncie seu Negócio</Link></li>
          </ul>
        </div>
        
        <div className={styles.column}>
          <h3>Contato</h3>
          <p>Email: contato@guia1555.com</p>
          <p>Telefone: (11) 1234-5678</p>
          <div style={{ marginTop: '15px' }}>
             <button className="btn-theme btn-pill">Fale Conosco</button>
          </div>
        </div>
      </div>
      
      <div className={`container ${styles.bottomBar}`}>
        <p>&copy; {new Date().getFullYear()} Guia Comercial 1555. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
