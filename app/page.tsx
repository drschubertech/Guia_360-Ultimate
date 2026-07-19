import styles from './page.module.css';
import { noticiasMock, empresasMock, categoriasMock } from '../lib/data';
import PostCard from '../components/PostCard/PostCard';
import CompanyCard from '../components/CompanyCard/CompanyCard';
import Link from 'next/link';
import { Car, Smile, ShoppingBag, Armchair, Utensils, Home as HomeIcon, Shirt, Dog } from 'lucide-react';

const IconMap: Record<string, React.ElementType> = {
  Car, Smile, ShoppingBag, Armchair, Utensils, Home: HomeIcon, Shirt, Dog
};

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Explore a sua cidade!</h1>
          <div className={styles.searchBox}>
            <input 
              type="text" 
              placeholder="O que você está procurando?" 
              className={styles.searchInput}
            />
            <button className="btn-theme">Buscar</button>
          </div>

          <div className={styles.categoriesWrapper}>
            {categoriasMock.map(cat => {
              const Icon = cat.icone ? IconMap[cat.icone] : null;
              return (
                <Link href={`/empresas?categoria=${cat.slug}`} key={cat.id} className={styles.categoryButton}>
                  <div className={styles.categoryIconBox} style={{ backgroundColor: cat.cor || 'var(--primary-color)' }}>
                    {Icon && <Icon size={32} strokeWidth={1.5} />}
                  </div>
                  <span className={styles.categoryLabel}>{cat.nome}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.content} container`}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Notícias e Eventos em Destaque</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {noticiasMock.map((noticia) => (
              <PostCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Guia Comercial: Empresas em Destaque</h2>
            <a href="/guia-comercial" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Ver todas &rarr;</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {empresasMock.map((empresa) => (
              <CompanyCard key={empresa.id} empresa={empresa} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
