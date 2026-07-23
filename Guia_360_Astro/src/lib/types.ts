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
