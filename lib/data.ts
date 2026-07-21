export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  cor?: string;
  icone?: string;
};

export type Empresa = {
  id: string;
  user_id?: string;
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

export const categoriasMock: Categoria[] = [];

export const empresasMock: Empresa[] = [];

export const noticiasMock: Noticia[] = [];
