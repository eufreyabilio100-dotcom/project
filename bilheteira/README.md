# Bilheteira — Venda de Bilhetes Digitais para Eventos

Aplicação web completa para compra e venda de bilhetes digitais para eventos em Moçambique, com pagamento via M-Pesa.

## Funcionalidades

- **Catálogo de Eventos** — Listagem, pesquisa e filtros de eventos disponíveis
- **Compra de Bilhetes** — Pagamento via M-Pesa com validação de número
- **Autenticação** — Registo e login de utilizadores com JWT
- **Painel do Utilizador** — Histórico de bilhetes comprados e perfil editável
- **Painel de Administração** — CRUD completo de eventos com upload de imagens e estatísticas de vendas
- **Níveis de Acesso** — Diferenciação entre utilizador comum e administrador
- **Responsivo** — Interface adaptada a desktop, tablet e smartphone
- **Preços em MZN** — Valores em Metical Moçambicano

## Arquitectura

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   Frontend (React)      │  ←──→   │   Supabase (Backend)    │
│                         │  REST   │                         │
│   - React + Vite        │   API   │   - PostgreSQL (BD)     │
│   - Tailwind CSS        │         │   - Auth (JWT)          │
│   - React Router        │         │   - Storage (Imagens)   │
│   - Supabase Client     │         │   - RLS (Segurança)     │
└─────────────────────────┘         └─────────────────────────┘
           │                                    │
           ▼                                    ▼
      Deploy: Vercel                    Hospedagem: Supabase
```

A aplicação segue uma arquitectura cliente-servidor desacoplada onde o frontend React comunica com o backend Supabase via API REST. O Supabase fornece autenticação JWT, base de dados PostgreSQL com Row Level Security (RLS) e armazenamento de imagens.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite |
| Estilos | Tailwind CSS v4 |
| Roteamento | React Router DOM v7 |
| Backend/BD | Supabase (PostgreSQL + REST API) |
| Autenticação | Supabase Auth (JWT) |
| Armazenamento | Supabase Storage |
| Deploy | Vercel (Frontend) |

## Modelo de Dados (E-R)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   profiles   │       │    events    │       │   tickets    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK, FK)  │←──┐   │ id (PK)      │   ┌──→│ id (PK)      │
│ full_name    │   │   │ title        │   │   │ event_id (FK)│──┐
│ phone        │   │   │ description  │   │   │ user_id (FK) │──┤
│ role         │   │   │ date         │   │   │ quantity     │  │
│ created_at   │   │   │ location     │   │   │ total_price  │  │
└──────────────┘   │   │ price        │   │   │ payment_method│  │
                   │   │ available_   │   │   │ payment_phone│  │
                   │   │   tickets    │   │   │ purchased_at │  │
                   │   │ image_url    │   │   └──────────────┘  │
                   │   │ created_by   │───┘          │          │
                   │   │ created_at   │              │          │
                   │   └──────────────┘              │          │
                   │                                 │          │
                   └─────────────────────────────────┘          │
                   └────────────────────────────────────────────┘
```

### Descrição das Tabelas

**profiles** — Perfis dos utilizadores
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária, referencia auth.users |
| full_name | TEXT | Nome completo do utilizador |
| phone | TEXT | Número de telefone (M-Pesa) |
| role | TEXT | Papel: 'user' ou 'admin' |
| created_at | TIMESTAMPTZ | Data de criação |

**events** — Eventos disponíveis
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| title | TEXT | Título do evento |
| description | TEXT | Descrição do evento |
| date | TIMESTAMPTZ | Data e hora do evento |
| location | TEXT | Local do evento |
| price | DECIMAL(10,2) | Preço em MZN |
| available_tickets | INTEGER | Bilhetes disponíveis |
| image_url | TEXT | URL da imagem do evento |
| created_by | UUID | Referência ao criador |
| created_at | TIMESTAMPTZ | Data de criação |

**tickets** — Bilhetes comprados
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária |
| event_id | UUID | Referência ao evento |
| user_id | UUID | Referência ao utilizador |
| quantity | INTEGER | Quantidade de bilhetes |
| total_price | DECIMAL(10,2) | Preço total em MZN |
| payment_method | TEXT | Método de pagamento (mpesa) |
| payment_phone | TEXT | Número usado no pagamento |
| purchased_at | TIMESTAMPTZ | Data da compra |

## Segurança

### Autenticação
- JWT (JSON Web Tokens) via Supabase Auth
- Sessões geridas automaticamente
- Trigger cria perfil automaticamente ao registar

### Row Level Security (RLS)
- **profiles**: Utilizadores veem todos os perfis, editam apenas o seu
- **events**: Qualquer pessoa vê eventos, só admins criam/editam/eliminam
- **tickets**: Utilizadores veem os seus bilhetes, admins veem todos
- **storage**: Utilizadores autenticados fazem upload, qualquer pessoa vê imagens

## Pré-requisitos

- Node.js >= 18
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (para deploy)

## Instruções de Execução

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd bilheteira
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o Supabase

1. Criar um novo projecto no [Supabase](https://supabase.com)
2. Ir a **SQL Editor** e executar todo o conteúdo do ficheiro `supabase-schema.sql`
3. Ir a **Storage** e criar um bucket chamado `event-images` com acesso público
4. Copiar as credenciais em **Settings > API**:
   - `Project URL`
   - `anon public key`

### 4. Configurar variáveis de ambiente

Criar o ficheiro `.env` na raiz do projecto:

```env
VITE_SUPABASE_URL=https://seu-projecto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 5. Executar em desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### 6. Criar utilizador administrador

1. Registar um utilizador na aplicação
2. No Supabase, ir a **Table Editor > profiles**
3. Alterar o campo `role` do utilizador para `admin`

### 7. Deploy no Vercel

1. Fazer push do código para o GitHub
2. Importar o repositório na Vercel
3. Adicionar as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Fazer deploy

## Estrutura do Projecto

```
bilheteira/
├── public/
│   ├── favicon.svg              # Ícone do site
│   ├── mpesa-logo.png           # Logo M-Pesa
│   ├── image_eventos.jpg        # Imagem fundo eventos
│   ├── inicio.jpg               # Imagem fundo inicial
│   ├── meusbilhetes.png         # Imagem fundo bilhetes
│   └── images/                  # Imagens de placeholder
│       ├── event-concert.svg
│       ├── event-conference.svg
│       ├── event-party.svg
│       └── event-sports.svg
├── src/
│   ├── components/
│   │   ├── EventCard.jsx        # Cartão de evento
│   │   ├── MpesaIcon.jsx        # Ícone M-Pesa
│   │   ├── Navbar.jsx           # Barra de navegação
│   │   └── ProtectedRoute.jsx   # Rota protegida
│   ├── context/
│   │   └── AuthContext.jsx      # Contexto de autenticação
│   ├── lib/
│   │   └── supabase.js          # Configuração do Supabase
│   ├── pages/
│   │   ├── Admin.jsx            # Painel de administração
│   │   ├── EventDetail.jsx      # Detalhe + compra de bilhete
│   │   ├── Events.jsx           # Listagem de eventos
│   │   ├── Home.jsx             # Página inicial
│   │   ├── Login.jsx            # Login
│   │   ├── MyTickets.jsx        # Bilhetes do utilizador
│   │   ├── Profile.jsx          # Perfil do utilizador
│   │   └── Register.jsx         # Registo
│   ├── App.jsx                  # Componente principal com rotas
│   ├── main.jsx                 # Ponto de entrada
│   └── index.css                # Estilos Tailwind
├── supabase-schema.sql          # Schema completo da base de dados
├── .env.example                 # Exemplo de variáveis de ambiente
├── index.html
├── package.json
└── vite.config.js
```

## Rotas da Aplicação

| Rota | Página | Acesso |
|------|--------|--------|
| `/` | Página inicial | Público |
| `/eventos` | Listagem de eventos | Público |
| `/eventos/:id` | Detalhe do evento | Público |
| `/login` | Login | Público |
| `/registo` | Registo | Público |
| `/meus-bilhetes` | Bilhetes do utilizador | Autenticado |
| `/perfil` | Perfil do utilizador | Autenticado |
| `/admin` | Painel de administração | Admin |

## Licença

Projecto académico — Desenvolvido para fins educacionais.
