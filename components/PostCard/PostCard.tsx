import Link from 'next/link';
import styles from './PostCard.module.css';
import { Noticia } from '../../lib/data';
import { Calendar, User } from 'lucide-react';

export default function PostCard({ noticia }: { noticia: Noticia }) {
  // Format date simply
  const dataFormatada = new Date(noticia.data).toLocaleDateString('pt-BR');

  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={noticia.capa} alt={noticia.titulo} className={styles.image} />
        <div className={styles.categoryTag}>{noticia.categoria}</div>
      </div>
      
      <div className={styles.content}>
        <Link href={`/publicacao/${noticia.slug}`} className={styles.title}>
          {noticia.titulo}
        </Link>
        <p className={styles.summary}>{noticia.resumo}</p>
        
        <div className={styles.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={14} />
            <span>{noticia.autor}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} />
            <span>{dataFormatada}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
