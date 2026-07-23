import styles from './PostCard.module.css';
import { Noticia } from '../../lib/types';
import { Calendar, User } from 'lucide-react';

export default function PostCard({ noticia }: { noticia: Noticia }) {
  // Format date simply
  const dataFormatada = new Date(noticia.data).toLocaleDateString('pt-BR');

  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        <img src={noticia.capa} alt={noticia.titulo} className={styles.image} />
        <div className={styles.categoryTag}>{noticia.categoria}</div>
      </div>
      
      <div className={styles.content}>
        <a href={`/publicacao/${noticia.slug}`} className={styles.title}>
          {noticia.titulo}
        </a>
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
