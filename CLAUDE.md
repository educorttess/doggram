# DOGGRAM — Rede Social para Cachorros 🐕

## Visão do Projeto

Doggram é uma rede social exclusiva para cachorros, onde donos criam perfis para seus pets, compartilham fotos, interagem com outros dogs e formam uma comunidade canina. É como o Instagram, mas 100% focado em cachorros.

## Stack Tecnológica

- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 3+
- **Banco de dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth (Google, email/senha)
- **Storage:** Supabase Storage (fotos dos dogs)
- **Real-time:** Supabase Realtime (notificações, feed)
- **Deploy:** Vercel
- **Gerenciador:** pnpm

## Identidade Visual

### Paleta de Cores

--doggram-orange:     #FF8C42    (primária — botões, CTAs, destaques)
--doggram-amber:      #FFB347    (secundária — gradientes, acentos)
--doggram-cream:      #FFFAF5    (background principal)
--doggram-warm-white: #FFF5EB    (cards, superfícies)
--doggram-brown-dark: #2D1B08    (texto principal)
--doggram-brown-mid:  #5C3D1E    (texto secundário)
--doggram-brown-soft: #9E8A76    (texto terciário, placeholders)
--doggram-border:     #F0E6D8    (bordas, divisores)
--doggram-coral:      #FF5E78    (likes, corações, stories)
--doggram-success:    #4CAF50    (confirmações)
--doggram-error:      #E8453C    (erros, alertas)

### Tipografia

- Font principal: Nunito (Google Fonts) — weights: 400, 600, 700, 800, 900
- Font alternativa: system-ui, sans-serif
- Tamanhos: 11px (caption), 13px (small), 14px (body), 16px (subtitle), 20px (title), 26px (logo)

### Design Principles

- Cantos arredondados generosos (border-radius: 12-24px)
- Sombras suaves e quentes (box-shadow com tons de laranja)
- Gradientes sutis de laranja para âmbar
- Ícones com stroke, não preenchidos (exceto quando ativos)
- Animações suaves (0.2-0.3s ease) em interações
- Espaçamento generoso entre elementos
- Imagens sempre com aspect-ratio 1:1 nos posts

## Estrutura de Pastas

doggram/
├── src/
│   ├── app/                    # App Router (Next.js)
│   │   ├── (auth)/             # Grupo de rotas de autenticação
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (main)/             # Grupo de rotas principais (logado)
│   │   │   ├── feed/
│   │   │   ├── explore/
│   │   │   ├── create/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── [username]/      # Perfil público do dog
│   │   │   ├── post/[id]/
│   │   │   ├── messages/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # Componentes base reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Badge.tsx
│   │   ├── feed/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostActions.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   └── FeedList.tsx
│   │   ├── stories/
│   │   │   ├── StoryBar.tsx
│   │   │   ├── StoryRing.tsx
│   │   │   └── StoryViewer.tsx
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileStats.tsx
│   │   │   └── ProfileGrid.tsx
│   │   ├── navigation/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── NavItem.tsx
│   │   └── shared/
│   │       ├── DogAvatar.tsx
│   │       ├── BreedBadge.tsx
│   │       ├── LikeButton.tsx
│   │       └── ImageUpload.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Cliente browser
│   │   │   ├── server.ts         # Cliente server-side
│   │   │   ├── middleware.ts     # Auth middleware
│   │   │   └── types.ts         # Tipos gerados do DB
│   │   ├── utils/
│   │   │   ├── format.ts        # Formatação (números, datas)
│   │   │   ├── image.ts         # Resize, crop, compressão
│   │   │   └── validators.ts    # Validações de formulários
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── usePosts.ts
│   │       ├── useProfile.ts
│   │       ├── useLike.ts
│   │       ├── useFollow.ts
│   │       └── useInfiniteScroll.ts
│   ├── types/
│   │   ├── database.ts           # Tipos do Supabase
│   │   ├── post.ts
│   │   ├── profile.ts
│   │   └── comment.ts
│   └── constants/
│       ├── breeds.ts             # Lista de raças
│       └── config.ts             # Configurações da app
├── public/
│   ├── logo.svg
│   ├── icons/
│   └── images/
├── supabase/
│   └── migrations/               # SQL migrations
├── tailwind.config.ts
├── next.config.ts
├── .env.local.example
└── package.json

## Schema do Banco de Dados (Supabase/PostgreSQL)

### Tabelas Principais

-- Perfis dos cachorros (vinculados ao owner via auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  dog_name TEXT NOT NULL,
  breed TEXT,
  bio TEXT,
  avatar_url TEXT,
  birth_date DATE,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts (fotos dos dogs)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, post_id)
);

-- Comentários
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Stories
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens diretas
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

### RLS (Row Level Security) — OBRIGATÓRIO

Todas as tabelas DEVEM ter RLS ativado com policies adequadas.

## Funcionalidades (por ordem de implementação)

### Fase 1 — MVP
1. Autenticação (login, cadastro, logout)
2. Criar perfil do cachorro (nome, raça, foto, bio)
3. Feed com posts
4. Criar post (upload de foto + legenda)
5. Like/unlike em posts
6. Comentários em posts
7. Perfil público do dog
8. Follow/unfollow
9. Busca por dogs (nome, raça)

### Fase 2 — Social
10. Stories (24h)
11. Notificações
12. Explore/descoberta
13. Hashtags (#goldenretriever, #dogsofinstagram)

### Fase 3 — Engajamento
14. Mensagens diretas
15. Múltiplos perfis de dogs por conta
16. Raças verificadas (badge)
17. Compartilhar posts

## Convenções de Código

- Componentes: PascalCase (PostCard.tsx)
- Hooks: camelCase com prefixo "use" (useAuth.ts)
- Utilitários: camelCase (formatDate.ts)
- Constantes: SCREAMING_SNAKE_CASE
- Tipos/Interfaces: PascalCase com prefixo descritivo (PostWithProfile)
- Arquivos CSS: kebab-case
- Commits: conventional commits (feat:, fix:, refactor:, etc.)
- Sempre usar TypeScript strict mode
- Sempre usar "use client" ou "use server" explicitamente
- Componentes do servidor por padrão, cliente apenas quando necessário
- Tratamento de erros com try/catch em todas as operações async
- Loading states com Skeleton components

## Comandos Úteis

pnpm dev          # Rodar em desenvolvimento
pnpm build        # Build de produção
pnpm lint         # Lint do código
pnpm db:generate  # Gerar tipos do Supabase
pnpm db:migrate   # Rodar migrations

## Notas Importantes

- Todas as imagens devem ser otimizadas antes do upload (max 1MB, WebP)
- Feed usa infinite scroll com cursor-based pagination
- Likes usam optimistic updates (atualiza UI antes do servidor)
- Avatar padrão é um emoji de cachorro enquanto não tem foto
- Username deve ser único e alfanumérico (sem espaços)
- Um owner pode ter múltiplos perfis de dogs (fase 3)