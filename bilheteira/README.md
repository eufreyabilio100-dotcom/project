# Bilheteira — Venda de Bilhetes para Eventos

Aplicação web para compra e venda de bilhetes digitais para eventos, desenvolvida com React, Tailwind CSS e Supabase.

## Funcionalidades

- **Catálogo de eventos** — listagem com pesquisa e filtros
- **Compra de bilhetes** — selecção de quantidade e preços em MZN
- **Autenticação** — registo e login com JWT (Supabase Auth)
- **Painel do utilizador** — histórico de bilhetes comprados
- **Painel de administração** — CRUD de eventos e estatísticas de vendas
- **Responsivo** — adapta-se a desktop, tablet e smartphone

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite |
| Estilos | Tailwind CSS v4 |
| Backend | Supabase (Auth + PostgreSQL + API REST) |
| Deploy | Vercel (frontend) |

## Pré-requisitos

- Node.js >= 18
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (para deploy)

## Instruções de Execução

### 1. Configurar o Supabase

1. Criar um novo projeto no Supabase
2. Ir ao **Editor SQL** e executar o conteúdo do ficheiro `supabase-schema.sql`
3. Ir a **Settings > API** e copiar:
   - `Project URL`
   - `anon public key`

### 2. Configurar variáveis de ambiente

Criar o ficheiro `.env` na raiz do projecto:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Instalar e executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### 4. Criar um utilizador administrador

Após registar a primeira conta, execute no Editor SQL do Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'ID_DO_UTILIZADOR';
```

Para encontrar o ID, vá a **Authentication > Users** no painel do Supabase.

### 5. Deploy na Vercel

1. Fazer push do código para o GitHub
2. Importar o repositório na Vercel
3. Adicionar as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)
4. Fazer deploy

## Estrutura do Projecto

```
bilheteira/
├── public/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   │   ├── EventCard.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/        # Contextos React
│   │   └── AuthContext.jsx
│   ├── lib/            # Configurações
│   │   └── supabase.js
│   ├── pages/          # Páginas da aplicação
│   │   ├── Admin.jsx
│   │   ├── EventDetail.jsx
│   │   ├── Events.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── MyTickets.jsx
│   │   └── Register.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase-schema.sql # Schema da base de dados
├── .env.example
└── package.json
```

## Modelo de Dados

- **profiles** — perfis dos utilizadores (nome, role)
- **events** — eventos disponíveis (título, data, local, preço, bilhetes)
- **tickets** — bilhetes comprados (evento, utilizador, quantidade, total)
