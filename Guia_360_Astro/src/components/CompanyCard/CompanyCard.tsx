import styles from './CompanyCard.module.css';
import { Empresa } from '../../lib/types';
import { MapPin, Star } from 'lucide-react';

export default function CompanyCard({ empresa }: { empresa: Empresa }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        <img src={empresa.capa} alt={empresa.nome} className={styles.image} />
        <div className={`${styles.statusTag} ${empresa.status === 'aberto' ? styles.statusOpen : styles.statusClosed}`}>
          {empresa.status === 'aberto' ? 'Aberto Agora' : 'Fechado'}
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.category}>{empresa.categoria}</div>
        <a href={`/empresa/${empresa.slug}`} className={styles.title}>
          {empresa.nome}
        </a>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{empresa.descricao}</p>
        
        <div className={styles.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={14} />
            <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {empresa.endereco}
            </span>
          </div>
          <div className={styles.rating}>
            <Star size={14} fill="currentColor" /> {empresa.avaliacao}
          </div>
        </div>
      </div>
    </div>
  );
}
