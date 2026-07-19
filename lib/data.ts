export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  cor?: string;
  icone?: string;
};

export type Empresa = {
  id: string;
  nome: string;
  slug: string;
  categoria: string;
  tags: string[];
  descricao: string;
  avaliacao: number;
  telefone: string;
  endereco: string;
  status: 'aberto' | 'fechado';
  capa: string;
  tipo?: 'Empresa' | 'Entidade';
};

export type Noticia = {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  data: string;
  resumo: string;
  autor: string;
  capa: string;
};

export const categoriasMock: Categoria[] = [
  { id: '1', nome: 'Automotivo', slug: 'automotivo', cor: '#fc5c5c', icone: 'Car' },
  { id: '2', nome: 'Beleza e Saúde', slug: 'saude-e-beleza', cor: '#32bdf6', icone: 'Smile' },
  { id: '3', nome: 'Compras', slug: 'compras', cor: '#6ceb34', icone: 'ShoppingBag' },
  { id: '4', nome: 'Decorações', slug: 'decoracoes', cor: '#fcd32c', icone: 'Armchair' },
  { id: '5', nome: 'Gastronomia', slug: 'gastronomia', cor: '#b863ff', icone: 'Utensils' },
  { id: '6', nome: 'Imóveis', slug: 'imoveis', cor: '#ff7b00', icone: 'Home' },
  { id: '7', nome: 'Moda', slug: 'moda', cor: '#ff3388', icone: 'Shirt' },
  { id: '8', nome: 'Pet Shop', slug: 'pet-shop', cor: '#1dd195', icone: 'Dog' }
];

export const empresasMock: Empresa[] = [];

export const noticiasMock: Noticia[] = [
  {
    id: 'not-1',
    titulo: 'Prefeitura anuncia nova praça no centro',
    slug: 'nova-praca-centro',
    categoria: 'Infraestrutura',
    data: '2023-10-15',
    resumo: 'Obras devem iniciar no próximo mês e prometem revitalizar a área.',
    autor: 'Secretaria de Obras',
    capa: 'https://via.placeholder.com/400x200?text=Nova+Praca'
  }
];
