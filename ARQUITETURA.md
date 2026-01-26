# Arquitetura do Sistema

## Visão Geral

O sistema de gestão de reservas hoteleiras é composto por duas aplicações principais:

1. **Backend API** (Express + TypeScript + Prisma)
2. **Frontend** (Next.js 14 + React + TypeScript)

## Backend

### Tecnologias
- **Node.js** com **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma ORM** - Gestão da base de dados
- **MySQL** - Base de dados relacional (compatível com MySQL Workbench)
- **JWT** - Autenticação
- **bcrypt** - Hash de passwords

### Estrutura

```
backend/
├── src/
│   ├── routes/           # Rotas da API
│   │   ├── auth.routes.ts
│   │   ├── cliente.routes.ts
│   │   ├── gerencia.routes.ts
│   │   └── relatorios.routes.ts
│   ├── middleware/       # Middleware
│   │   └── auth.middleware.ts
│   ├── utils/            # Utilitários
│   │   ├── logger.util.ts
│   │   └── reserva.util.ts
│   └── server.ts         # Servidor principal
├── prisma/
│   ├── schema.prisma     # Schema da BD
│   └── seed.ts           # Dados iniciais
└── package.json
```

### Endpoints da API

#### Autenticação (`/api/auth`)
- `POST /registro` - Registro de novo utilizador
- `POST /login` - Login
- `GET /perfil` - Perfil do utilizador autenticado

#### Cliente (`/api/cliente`)
- `GET /tipos-quarto` - Listar tipos de quarto
- `POST /verificar-disponibilidade` - Verificar disponibilidade
- `POST /reservas` - Criar reserva
- `GET /reservas` - Listar reservas do cliente
- `GET /reservas/:id` - Detalhes da reserva
- `POST /reservas/:id/cancelar` - Cancelar reserva

#### Gerência (`/api/gerencia`)
- **Tipos de Quarto** (apenas Gestor)
  - `GET /tipos-quarto`
  - `POST /tipos-quarto`
  - `PUT /tipos-quarto/:id`

- **Quartos**
  - `GET /quartos`
  - `POST /quartos`
  - `PUT /quartos/:id`

- **Hóspedes**
  - `GET /hospedes`
  - `POST /hospedes`
  - `PUT /hospedes/:id`

- **Reservas**
  - `GET /reservas`
  - `GET /reservas/:id`
  - `POST /reservas/:id/cancelar`
  - `POST /reservas/:id/checkin`
  - `POST /reservas/:id/checkout`

- **Pagamentos**
  - `GET /pagamentos`
  - `POST /pagamentos`

- **Utilizadores** (apenas Gestor)
  - `GET /utilizadores`
  - `POST /utilizadores`

#### Relatórios (`/api/relatorios`)
- `GET /ocupacao-diaria` - Ocupação diária
- `GET /ocupacao-mensal` - Ocupação mensal
- `GET /reservas-periodo` - Reservas por período
- `GET /receita-periodo` - Receita por período
- `GET /historico-hospedes` - Histórico de hóspedes
- `GET /logs-auditoria` - Logs de auditoria

## Frontend

### Tecnologias
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gestão de estado
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas

### Estrutura

```
frontend/
├── src/
│   ├── app/              # Páginas Next.js (App Router)
│   │   ├── page.tsx      # Página inicial
│   │   ├── login/        # Login
│   │   ├── registro/     # Registro
│   │   ├── cliente/      # Área do cliente
│   │   │   ├── page.tsx
│   │   │   ├── reservar/
│   │   │   └── reservas/
│   │   └── gerencia/     # Área da gerência
│   │       ├── page.tsx
│   │       └── relatorios/
│   ├── lib/              # Bibliotecas
│   │   └── api.ts        # Cliente Axios
│   ├── store/            # Estado global
│   │   └── authStore.ts  # Store de autenticação
│   └── providers.tsx     # Providers React
└── package.json
```

### Páginas

#### Públicas
- `/` - Página inicial
- `/login` - Login
- `/registro` - Registro

#### Cliente
- `/cliente` - Lista de tipos de quarto
- `/cliente/reservar` - Criar reserva
- `/cliente/reservas` - Lista de reservas

#### Gerência
- `/gerencia` - Dashboard
- `/gerencia/relatorios` - Relatórios

## Base de Dados

### Modelos Principais

1. **Utilizador** - Utilizadores do sistema (Cliente, Rececionista, Gestor)
2. **TipoQuarto** - Tipos de quarto com preços e políticas
3. **Quarto** - Quartos individuais
4. **Hospede** - Hóspedes
5. **Reserva** - Reservas
6. **ReservaQuarto** - Relação many-to-many Reserva-Quarto
7. **ReservaHospede** - Relação many-to-many Reserva-Hóspede
8. **Pagamento** - Pagamentos registados
9. **LogAuditoria** - Logs de auditoria

### Relações

- Utilizador → Reserva (1:N)
- TipoQuarto → Quarto (1:N)
- TipoQuarto → Reserva (1:N)
- Reserva → Quarto (N:M via ReservaQuarto)
- Reserva → Hospede (N:M via ReservaHospede)
- Reserva → Pagamento (1:N)
- Utilizador → Pagamento (1:N)
- Utilizador → LogAuditoria (1:N)

## Autenticação e Autorização

### Fluxo de Autenticação

1. Cliente faz login/registro
2. Backend valida credenciais
3. Backend gera JWT token
4. Frontend armazena token no localStorage
5. Token é enviado em todas as requisições via header `Authorization: Bearer <token>`
6. Middleware valida token e extrai informações do utilizador

### Níveis de Acesso

- **CLIENTE**: Acesso apenas à área do cliente
- **RECECIONISTA**: Acesso à gerência (exceto gestão de tipos de quarto e utilizadores)
- **GESTOR**: Acesso completo ao sistema

## Regras de Negócio Implementadas

1. **Validação de Datas**
   - Não permitir reservas com dataInicio >= dataFim
   - Não permitir reservas no passado

2. **Disponibilidade**
   - Verificar quartos livres do tipo solicitado
   - Verificar sobreposição de reservas
   - Prevenir overbooking

3. **Cálculo de Totais**
   - Diária base × número de noites × quantidade de quartos
   - Adicionar suplemento por hóspede extra
   - Adicionar custo do pequeno-almoço se selecionado

4. **Cancelamento/Edição**
   - Permitir apenas se dataInicio > agora + 24 horas

5. **Check-in/Check-out**
   - Check-in marca quartos como ocupados
   - Check-out marca quartos como livres e reserva como concluída

## Segurança

- Passwords hasheadas com bcrypt
- JWT tokens com expiração
- Validação de entrada com express-validator
- CORS configurado
- Logs de auditoria para ações críticas

## Escalabilidade

- Separação clara entre frontend e backend
- API RESTful stateless
- Base de dados relacional normalizada (MySQL)
- Prisma ORM para type-safety
- TypeScript em todo o projeto
