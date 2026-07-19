import Link from 'next/link';
import styles from './PostCard.module.css';
import { Noticia } from '../../lib/data';
import { Calendar, User } from 'lucide-react';

export default function PostCard({ noticia }: { noticia: any }) {
  // Format date simply
  const dataPost = noticia.data_publicacao || noticia.created_at || noticia.data;
  const dataFormatada = dataPost ? new Date(dataPost).toLocaleDateString('pt-BR') : 'Data desconhecida';

  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={noticia.imagem_url || noticia.capa || 'https://via.placeholder.com/400x200?text=Notícia'} alt={noticia.titulo} className={styles.image} />
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
