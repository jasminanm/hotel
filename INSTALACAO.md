# Guia de Instalação - Sistema de Gestão de Reservas Hoteleiras

Este guia fornece instruções passo a passo para configurar e executar o sistema.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (versão 14 ou superior)
- **npm** ou **yarn** (gerenciador de pacotes)

## Passo 1: Configurar a Base de Dados

1. Crie uma base de dados MySQL:

**Opção A - Usando MySQL Workbench:**
   - Abra o MySQL Workbench
   - Conecte-se ao seu servidor MySQL
   - Execute o seguinte comando SQL:
   ```sql
   CREATE DATABASE hotel_db;
   ```

**Opção B - Usando linha de comando:**
```bash
mysql -u seu_usuario -p -e "CREATE DATABASE hotel_db;"
```

## Passo 2: Configurar o Backend

1. Navegue para a pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um ficheiro `.env` na pasta `backend` com o seguinte conteúdo:

```env
DATABASE_URL="mysql://seu_usuario:sua_password@localhost:3306/hotel_db"
JWT_SECRET="seu-secret-jwt-super-seguro-aqui"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

**Importante:** 
- Substitua `seu_usuario` e `sua_password` pelas suas credenciais do MySQL
- A porta padrão do MySQL é `3306` (não 5432 como no PostgreSQL)
- Formato da URL: `mysql://usuario:password@host:porta/nome_da_base`

4. Execute as migrations do Prisma:

```bash
npx prisma migrate dev --name init
```

5. Gere o cliente Prisma:

```bash
npx prisma generate
```

6. (Opcional) Popule a base de dados com dados de exemplo:

```bash
npm run seed
```

Isso criará:
- Utilizadores de teste (gestor, rececionista, cliente)
- Tipos de quarto
- Quartos
- Hóspedes de exemplo

**Credenciais criadas pelo seed:**
- Gestor: `gestor@hotel.com` / `password123`
- Rececionista: `rececionista@hotel.com` / `password123`
- Cliente: `cliente@example.com` / `password123`

7. Inicie o servidor backend:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

## Passo 3: Configurar o Frontend

1. Abra um novo terminal e navegue para a pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um ficheiro `.env.local` na pasta `frontend`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## Passo 4: Acessar a Aplicação

1. Abra o navegador e acesse: `http://localhost:3000`

2. Faça login com uma das credenciais criadas pelo seed ou crie uma nova conta.

## Estrutura do Projeto

```
Hotel/
├── backend/              # API Express + Prisma
│   ├── src/
│   │   ├── routes/      # Rotas da API
│   │   ├── middleware/  # Middleware de autenticação
│   │   ├── utils/       # Utilitários
│   │   └── server.ts    # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma # Schema da base de dados
│   │   └── seed.ts      # Script de seed
│   └── package.json
│
├── frontend/            # Aplicação Next.js
│   ├── src/
│   │   ├── app/         # Páginas Next.js
│   │   ├── lib/         # Bibliotecas (API client)
│   │   └── store/       # Estado global (Zustand)
│   └── package.json
│
└── README.md
```

## Comandos Úteis

### Backend

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm start` - Inicia o servidor em produção
- `npx prisma studio` - Abre o Prisma Studio (interface visual da BD)
- `npx prisma migrate dev` - Cria uma nova migration
- `npm run seed` - Popula a base de dados

### Frontend

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm start` - Inicia o servidor em produção
- `npm run lint` - Executa o linter

## Resolução de Problemas

### Erro de conexão com a base de dados

- Verifique se o MySQL está em execução
- Confirme que as credenciais no `.env` estão corretas
- Verifique se a base de dados `hotel_db` existe
- Certifique-se de que a porta está correta (3306 para MySQL)

### Erro de CORS

- Certifique-se de que `CORS_ORIGIN` no `.env` do backend corresponde à URL do frontend
- Por padrão: `http://localhost:3000`

### Erro ao executar migrations

- Certifique-se de que a base de dados está vazia ou use `npx prisma migrate reset` para resetar

### Porta já em uso

- Altere a `PORT` no `.env` do backend ou pare o processo que está a usar a porta

## Próximos Passos

Após a instalação bem-sucedida:

1. Explore a interface do cliente para fazer reservas
2. Acesse a área de gerência para administrar o sistema
3. Consulte os relatórios disponíveis
4. Revise os logs de auditoria

## Suporte

Para questões ou problemas, consulte:
- Documentação do Prisma: https://www.prisma.io/docs
- Documentação do Next.js: https://nextjs.org/docs
- Documentação do Express: https://expressjs.com/
