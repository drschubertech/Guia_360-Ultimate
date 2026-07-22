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
  conteudo?: string;
  autor: string;
  capa: string;
};

export const categoriasMock: Categoria[] = [];

export const empresasMock: Empresa[] = [];

export const noticiasMock: Noticia[] = [
  {
    id: '1',
    titulo: 'Rio Piçarras fica mais navegável após obras de desassoreamento e revitalização',
    slug: 'rio-pi-arras-mais-navegavel',
    categoria: 'Infraestrutura',
    data: '2026-07-20T10:00:00Z',
    resumo: 'Ação de limpeza e dragagem melhora o fluxo de embarcações e fortalece o turismo e o transporte local na região.',
    conteudo: 'As obras de revitalização e desassoreamento no leito do Rio Piauí atingiram uma marca histórica nesta semana. Com o avanço das escavações e remoção de sedimentos acumulos ao longo dos anos, o canal navegável recuperou sua profundidade ideal.\n\nSegundo os engenheiros responsáveis pela obra, as intervenções não apenas melhoram a navegabilidade para embarcações de pequeno e médio porte, mas também diminuem significativamente o risco de alagamentos durante o período chuvoso.\n\nComunidades ribeirinhas e comerciantes locais comemoram os resultados. O transporte de mercadorias e os passeios turísticos regionais já operam com maior segurança e fluidez.',
    autor: 'Redação Guia 360',
    capa: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: '2',
    titulo: 'Inauguração da nova praça central traz mais lazer para a família',
    slug: 'nova-praca-centro',
    categoria: 'Cidade',
    data: '2026-07-18T14:30:00Z',
    resumo: 'Espaço conta com playground infantil, academia ao ar livre e área verde totalmente renovada.',
    conteudo: 'A cidade celebrou neste sábado a entrega oficial da nova praça no centro da cidade. O projeto modernizou a infraestrutura urbana trazendo iluminação LED, pista de caminhada, equipamentos de ginástica e parque infantil adaptado.\n\nMoradores compareceram em peso à solenidade de abertura, que contou com apresentações culturais e feira de artesanato local.',
    autor: 'Jornalismo Local',
    capa: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80'
  }
];
