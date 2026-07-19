# Manual de Diretrizes de Design - Guia Comercial 1555
- https://1555.elevamodelos.com.br/

Este documento serve como base para a equipe de design e desenvolvimento do aplicativo, garantindo que a identidade visual, usabilidade e experiência do usuário (UX) do site original (Guia Comercial 1555) sejam replicadas e estendidas com consistência em todas as telas e fluxos.

---

## 1. Identidade Visual e Paleta de Cores

A paleta de cores deve transmitir dinamismo, frescor e clareza, facilitando a navegação do usuário que busca informações locais de forma rápida.

### 1.1. Cores Principais
- **Verde Tema (Primary/Brand Color):** `#34a853` (ou verde vibrante correspondente ao `btn-theme` / `btn-success`).
  - *Uso:* Botões de ação principal, botões de busca, links ativos, tags de categorias principais, botões de envio em formulários, status ativos de navegação.
- **Preto/Cinza Escuro (Text Primary):** `#222222` ou `#333333`.
  - *Uso:* Títulos principais de seções, cabeçalhos de cards, menus de navegação.
- **Cinza Médio (Text Secondary):** `#666666` ou `#777777`.
  - *Uso:* Descrição de cards, textos de apoio, placeholders, datas de postagens, subtítulos informativos.
- **Branco (Background Light):** `#ffffff`.
  - *Uso:* Fundo de modais, fundo de inputs de formulários, fundo de cards de anúncios em grids.

### 1.2. Cores de Fundo e Seções
- **Off-White (Fundo Geral):** Cinza extremamente claro (`#f9f9f9` ou `#f5f5f5`).
  - *Uso:* Fundo principal da página por trás de carrosséis e listas de novos comércios para criar contraste limpo com os cards brancos.
- **Fundo Escuro (Footer/Hero Overlay):** Cinza escuro ou preto fosco (`#1a1a1a` ou `#2a2a2a`).
  - *Uso:* Fundo do rodapé e overlay da imagem principal no banner hero (para garantir legibilidade do texto branco sobreposto).

---

## 2. Tipografia

A tipografia deve focar na legibilidade em telas de diferentes tamanhos (responsividade), utilizando fontes modernas sem serifa (Sans-serif).

- **Fontes Recomendadas:** Roboto, Open Sans ou Montserrat (para títulos).
- **Hierarquia Visual:**
  - **Títulos Principais de Seção:** Caixa alta (Uppercase), peso negrito (bold / 700), tamanho grande (ex: `24px` a `28px` no desktop, `20px` a `22px` no mobile).
  - **Títulos de Cards/Anúncios:** Mistos (Titlecase), peso semi-negrito (semi-bold / 600), tamanho médio (ex: `16px` a `18px`).
  - **Textos de Corpo e Descrição:** Peso regular (400), tamanho confortável para leitura (ex: `14px` no desktop, `13px` no mobile).
  - **Tags e Micro-textos (Status, Categorias, Datas):** Caixa alta ou títulos pequenos, peso médio (500), tamanho reduzido (ex: `11px` a `12px`).

---

## 3. Botões e Componentes Interativos

Os botões devem ter comportamento claro e estados bem definidos para guiar o usuário na jornada.

### 3.1. Botão Primário (`btn-theme`)
- **Estilo Padrão:** Fundo verde vibrante (`#34a853`), texto em branco, sem borda (ou borda invisível).
- **Formatos:**
  - *Bordas Suaves:* `border-radius: 4px` a `6px` para botões dentro de formulários (ex: "Buscar", "Entrar").
  - *Estilo Pílula (Arredondado):* `border-radius: 30px` para botões de destaque principal (ex: "CADASTRAR ANÚNCIO" no cabeçalho).
- **Estados de Interação:**
  - **Normal:** Fundo verde brilhante.
  - **Hover (Passar o mouse):** Escurecimento sutil do verde (cerca de 10% mais escuro) ou efeito de opacidade suave.
  - **Active/Focus (Clicado):** Leve contorno ou feedback visual imediato.
  - **Loading:** Exibição de um spinner de carregamento circular (`has-spinner`) ao enviar formulários (como no botão de contato).

### 3.2. Outros Botões
- **Botões Secundários/Apoio:** Fundo cinza claro ou branco com bordas verdes.
- **Botão Voltar ao Topo:** Botão flutuante cinza escuro/preto posicionado no canto inferior direito, com ícone de seta para cima em branco, aparecendo após rolagem significativa da tela.

---

## 4. Estrutura de Layout e Elementos-Chave

O design deve ser modular e usar grids claros para organização do conteúdo.

### 4.1. Cabeçalho (Header)
- Barra superior fina com mensagem de boas-vindas ("Bem-vindo, selecione sua cidade") e dropdown para trocar de cidade, integrada a links sociais à direita.
- Cabeçalho principal fixo (ou sticky com boa transição de scroll) contendo o logo à esquerda, menus de navegação principais centralizados, ícone de pesquisa/login (lupa/usuário) e o botão "CADASTRAR ANÚNCIO" destacado.

### 4.2. Banner Hero (Área de Busca)
- Imagem de fundo atraente com overlay escuro.
- Título inspirador ("Explore a sua cidade!") em letras brancas de grande destaque.
- Caixa de pesquisa integrada com campos claros de busca (Input de Texto para localidade com ícone de pin, Dropdown estilizado com Select2 para Categorias, e o Botão "Buscar" em verde).

### 4.3. Cards de Anúncio
- **Design Visual:** Caixa retangular branca (`#ffffff`) com sombra projetada suave (box-shadow) sobre o fundo off-white.
- **Elementos Internos:**
  - *Imagem de Capa:* Proporção uniforme.
  - *Tags de Status Dinâmicas:* Tags em verde para "Aberto Agora" ou "Sempre Aberto" (ou vermelha/amarela para fechado, se aplicável).
  - *Categoria:* Link discreto acima do título indicando o segmento (ex: "Beleza e Saúde").
  - *Título:* Link para a página do anúncio.
  - *Ações rápidas no rodapé do card:* Ícone de marcador de mapa (localização), ícone de favoritos/coração (clicável para salvar anúncio) e indicação de faixa de preço.

### 4.4. Carrosséis de Anúncios e Eventos
- Utilização de setas circulares nas laterais do carrossel para navegação manual (`owl-prev` / `owl-next`).
- Indicadores de paginação redondos (bullets/dots) na parte inferior indicando o slide ativo e os inativos.

### 4.5. Tabelas e Planos de Preços (Pacotes)
- Cards verticais minimalistas lado a lado.
- Preço em destaque na parte superior com fonte de tamanho grande.
- Lista vertical de benefícios e permissões de cada plano.
- Botão verde destacado no rodapé do card: "Escolha um Plano".

---

## 5. Modais, Formulários e Validações

A experiência de preenchimento de dados deve evitar frustrações, fornecendo feedbacks imediatos.

### 5.1. Modais de Login e Cadastro
- Design unificado: Tela com fundo branco, centralizada na tela com um fundo escuro semi-transparente cobrindo a página atrás.
- Botão "X" de fechamento claro no canto superior direito do modal.
- Alternância rápida entre os formulários de "Entrar" e "Cadastrar" por meio de links de texto na parte inferior ("Deseja se Cadastrar ?" / "Entrar").

### 5.2. Mensagens de Validação e Feedback de Erro
- **Inputs Individuais:** Mensagens de erro em vermelho logo abaixo do respectivo campo não preenchido ou inválido (ex: *"Por favor, preencha este campo."* ou *"Termos e Condições são obrigatórios."*).
- **Avisos Globais no Modal:** Caixas de texto no topo do modal com títulos informais de erro (ex: *"Opss.....!"* em negrito seguido de *"Você precisa estar logado."*).
- **Avisos em Formulários Longos (Contato):** Caixa de mensagem de erro global no topo ou rodapé do formulário destacando o problema (ex: *"Um ou mais campos contêm um erro. Por favor verifique e tente novamente."*).
- **Estado de Erro nos Campos:** Bordas dos inputs ficam destacadas (geralmente em vermelho ou tom de alerta) ao falhar na validação.
