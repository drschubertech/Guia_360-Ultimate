import Link from 'next/link';
import styles from './CompanyCard.module.css';
import { Empresa } from '../../lib/data';
import { MapPin, Star } from 'lucide-react';

export default function CompanyCard({ empresa }: { empresa: Empresa }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={empresa.capa} alt={empresa.nome} className={styles.image} />
        <div className={`${styles.statusTag} ${empresa.status === 'aberto' ? styles.statusOpen : styles.statusClosed}`}>
          {empresa.status === 'aberto' ? 'Aberto Agora' : 'Fechado'}
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.category}>{empresa.categoria}</div>
        <Link href={`/empresa/${empresa.slug}`} className={styles.title}>
          {empresa.nome}
        </Link>
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
