'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

import PostCard from '../components/PostCard/PostCard';
import CompanyCard from '../components/CompanyCard/CompanyCard';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Car, Smile, ShoppingBag, Armchair, Utensils, Home as HomeIcon, Shirt, Dog, Bike, Search, X } from 'lucide-react';

const IconMap: Record<string, React.ElementType> = {
  Car, Smile, ShoppingBag, Armchair, Utensils, Home: HomeIcon, Shirt, Dog, Bike, Motorbike: Bike, motorbike: Bike
};

const POPULAR_TAGS = ['Restaurantes', 'Farmácias', 'Oficinas', 'Eventos'];

export default function Home() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [noticias, setNoticias] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data: empData, error: empError } = await supabase.from('empresas').select('*');
        const { data: entData, error: entError } = await supabase.from('entidades').select('*');
        
        const empresasFormatadas = (!empError && empData) ? empData.map(e => ({ ...e, tipo: 'Empresa' })) : [];
        const entidadesFormatadas = (!entError && entData) ? entData.map(e => ({ ...e, tipo: 'Entidade' })) : [];

        setEmpresas([...empresasFormatadas, ...entidadesFormatadas]);

        const { data: notData, error: notError } = await supabase.from('noticias').select('*').order('created_at', { ascending: false }).limit(4);
        if (!notError && notData && notData.length > 0) setNoticias(notData);

        const { data: catData, error: catError } = await supabase.from('categorias').select('*').order('nome');
        if (!catError && catData && catData.length > 0) setCategorias(catData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
    carregarDados();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/guia-comercial?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    window.location.href = `/guia-comercial?q=${encodeURIComponent(tag)}`;
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Explore a <span>sua cidade!</span></h1>
          
          <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
            <div className={styles.searchInputWrapper}>
              <input
                type="text"
                placeholder="O que você está procurando?"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpar busca"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button type="submit" className={styles.searchButton} aria-label="Buscar">
              <Search size={20} />
            </button>
          </form>

          <div className={styles.searchTags}>
            <span className={styles.searchTagsLabel}>Populares:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={styles.tagChip}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className={styles.categoriesWrapper}>
            {categorias.map(cat => {
              const Icon = cat.icone ? IconMap[cat.icone] : null;
              return (
                <Link href={`/guia-comercial?categoria=${cat.slug}`} key={cat.id} className={styles.categoryButton}>
                  <div className={styles.categoryIconBox} style={{ backgroundColor: cat.cor || 'var(--primary-color)' }}>
                    {Icon && <Icon size={18} strokeWidth={2} />}
                  </div>
                  <span className={styles.categoryLabel}>{cat.nome}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.content} container`}>
        <div style={{ marginBottom: '64px' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Notícias e Eventos</h2>
          </div>
          <div className={styles.grid}>
            {noticias.map((noticia) => (
              <PostCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '64px' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Empresas em Destaque</h2>
            <Link href="/guia-comercial" className={styles.sectionLink}>Ver todas &rarr;</Link>
          </div>
          <div className={styles.grid}>
            {empresas.map((empresa) => (
              <CompanyCard key={empresa.id} empresa={empresa} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
