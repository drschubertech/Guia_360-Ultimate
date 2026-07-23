import Link from 'next/link';
import styles from './PostCard.module.css';
import { Noticia } from '../../lib/types';
import { Calendar, User } from 'lucide-react';

export default function PostCard({ noticia }: { noticia: any }) {
  // Format date simply
  const dataPost = noticia.data_publicacao || noticia.created_at || noticia.data;
  const dataFormatada = dataPost ? new Date(dataPost).toLocaleDateString('pt-BR') : 'Data desconhecida';
  const slug = noticia.slug || noticia.id;
  const autor = noticia.profiles?.full_name || noticia.autor || 'Redação';
  const imagem = noticia.imagem_url || noticia.capa || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80';

  return (
    <div className={styles.card}>
      <Link href={`/publicacao/${slug}`} className={styles.imageBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagem} alt={noticia.titulo} className={styles.image} />
        {noticia.categoria && <div className={styles.categoryTag}>{noticia.categoria}</div>}
      </Link>
      
      <div className={styles.content}>
        <Link href={`/publicacao/${slug}`} className={styles.title}>
          {noticia.titulo}
        </Link>
        <p className={styles.summary}>{noticia.resumo}</p>
        
        <div className={styles.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={14} />
            <span>{autor}</span>
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
