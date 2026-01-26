# Relatório Técnico - Sistema de Gestão de Reservas Hoteleiras

## 1. Introdução

### 1.1. Objetivo do Projeto
Sistema web completo para gestão integral de um hotel, desenvolvido como projeto académico. O sistema permite a gestão de reservas, quartos, hóspedes, pagamentos e relatórios, com diferentes níveis de acesso para clientes, rececionistas e gestores.

### 1.2. Escopo
- Área do Cliente: pesquisa, reserva e gestão de reservas
- Área da Gerência: administração completa do hotel (quartos, reservas, pagamentos, relatórios)
- Sistema de autenticação e autorização baseado em roles
- API RESTful completa
- Interface web responsiva

## 2. Arquitetura do Sistema

### 2.1. Arquitetura Geral
O sistema segue uma arquitetura de três camadas:

```
┌─────────────────────────────────────┐
│         Frontend (Next.js)           │
│     React + TypeScript + Tailwind    │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│      Backend (Node.js/Express)       │
│     TypeScript + Prisma ORM          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Base de Dados (MySQL)           │
│     Schema Prisma + Migrations        │
└──────────────────────────────────────┘
```

### 2.2. Stack Tecnológica

#### Frontend
- **Next.js 14.0.4**: Framework React com App Router
- **React 18.2.0**: Biblioteca UI
- **TypeScript 5.3.3**: Tipagem estática
- **Tailwind CSS 3.4.0**: Framework CSS utility-first
- **Zustand 4.4.7**: Gestão de estado global
- **Axios 1.6.2**: Cliente HTTP
- **React Hook Form 7.49.2**: Gestão de formulários
- **date-fns 3.0.6**: Manipulação de datas
- **lucide-react 0.303.0**: Ícones

#### Backend
- **Node.js**: Runtime JavaScript
- **Express 4.18.2**: Framework web
- **TypeScript 5.3.3**: Tipagem estática
- **Prisma 5.7.1**: ORM type-safe
- **MySQL**: Base de dados relacional
- **JWT (jsonwebtoken 9.0.2)**: Autenticação
- **bcrypt 5.1.1**: Hash de passwords
- **express-validator 7.0.1**: Validação de dados
- **cors 2.8.5**: Cross-Origin Resource Sharing

### 2.3. Estrutura de Pastas

```
Hotel/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Schema da base de dados
│   │   ├── seed.ts                # Script de seed
│   │   └── migrations/            # Migrations do Prisma
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts  # Autenticação e autorização
│   │   ├── routes/
│   │   │   ├── auth.routes.ts      # Autenticação
│   │   │   ├── cliente.routes.ts   # Rotas do cliente
│   │   │   ├── gerencia.routes.ts  # Rotas da gerência
│   │   │   └── relatorios.routes.ts # Relatórios
│   │   ├── utils/
│   │   │   ├── logger.util.ts      # Logs de auditoria
│   │   │   └── reserva.util.ts     # Lógica de negócio
│   │   └── server.ts               # Servidor Express
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                    # App Router do Next.js
│   │   │   ├── cliente/            # Páginas do cliente
│   │   │   ├── gerencia/          # Páginas da gerência
│   │   │   ├── login/             # Autenticação
│   │   │   └── registro/          # Registo
│   │   ├── lib/
│   │   │   └── api.ts             # Cliente Axios configurado
│   │   ├── store/
│   │   │   └── authStore.ts       # Estado de autenticação
│   │   └── globals.css            # Estilos globais
│   ├── public/                     # Ficheiros estáticos
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 3. Base de Dados

### 3.1. Modelo de Dados

O sistema utiliza MySQL como base de dados, com schema definido através do Prisma ORM. O modelo de dados inclui as seguintes entidades principais:

#### 3.1.1. Utilizador
- **Propósito**: Autenticação e autorização de utilizadores
- **Campos**:
  - `id`: Identificador único (CUID)
  - `email`: Email único
  - `password`: Hash da password (bcrypt)
  - `tipo`: Enum (CLIENTE, RECECIONISTA, GESTOR)
  - `nome`: Nome completo
  - `ativo`: Estado ativo/inativo
- **Relações**: Reservas, Pagamentos, LogsAuditoria

#### 3.1.2. TipoQuarto
- **Propósito**: Definição de tipos de quarto e preços
- **Campos**:
  - `id`: Identificador único
  - `nome`: Nome do tipo (único)
  - `descricao`: Descrição opcional
  - `valorBaseDiaria`: Preço base por noite
  - `capacidadeBase`: Número de hóspedes base
  - `suplementoHospedeExtra`: Valor por hóspede extra
  - `custoPequenoAlmoco`: Custo do pequeno-almoço por hóspede
  - `ativo`: Estado ativo/inativo
- **Relações**: Quartos, Reservas

#### 3.1.3. Quarto
- **Propósito**: Quartos físicos do hotel
- **Campos**:
  - `id`: Identificador único
  - `numero`: Número do quarto (único)
  - `tipoQuartoId`: Referência ao tipo de quarto
  - `estado`: Enum (LIVRE, OCUPADO, MANUTENCAO)
- **Relações**: TipoQuarto, ReservaQuarto

#### 3.1.4. Hospede
- **Propósito**: Informação dos hóspedes
- **Campos**:
  - `id`: Identificador único
  - `nome`: Nome completo
  - `tipoDocumento`: Enum (CARTAO_CIDADAO, PASSAPORTE, OUTRO)
  - `numeroDocumento`: Número do documento (único com tipoDocumento)
  - `nif`: NIF opcional para faturação
  - `ativo`: Estado ativo/inativo
- **Relações**: ReservaHospede

#### 3.1.5. Reserva
- **Propósito**: Reservas de quartos
- **Campos**:
  - `id`: Identificador único
  - `utilizadorId`: Cliente que fez a reserva
  - `tipoQuartoId`: Tipo de quarto reservado
  - `dataInicio`: Data de check-in
  - `dataFim`: Data de check-out
  - `quantidadeQuartos`: Número de quartos
  - `hospedesPorQuarto`: Número de hóspedes por quarto
  - `incluirPequenoAlmoco`: Boolean
  - `estado`: Enum (ATIVA, CANCELADA, CONCLUIDA)
  - `totalCalculado`: Total calculado da reserva
  - `checkInEfetuado`: Boolean
  - `checkOutEfetuado`: Boolean
- **Relações**: Utilizador, TipoQuarto, ReservaQuarto, ReservaHospede, Pagamento

#### 3.1.6. ReservaQuarto (Tabela de Junção)
- **Propósito**: Relação many-to-many entre Reserva e Quarto
- **Campos**:
  - `id`: Identificador único
  - `reservaId`: Referência à reserva
  - `quartoId`: Referência ao quarto
- **Constraint**: Unique (reservaId, quartoId)

#### 3.1.7. ReservaHospede (Tabela de Junção)
- **Propósito**: Relação many-to-many entre Reserva e Hospede
- **Campos**:
  - `id`: Identificador único
  - `reservaId`: Referência à reserva
  - `hospedeId`: Referência ao hóspede
- **Constraint**: Unique (reservaId, hospedeId)

#### 3.1.8. Pagamento
- **Propósito**: Registro de pagamentos
- **Campos**:
  - `id`: Identificador único
  - `reservaId`: Referência à reserva
  - `utilizadorId`: Operador que registou o pagamento
  - `montante`: Valor pago
  - `data`: Data do pagamento
  - `tipo`: Enum (PARCIAL, TOTAL)
  - `observacoes`: Observações opcionais
- **Relações**: Reserva, Utilizador

#### 3.1.9. LogAuditoria
- **Propósito**: Logs de auditoria para rastreabilidade
- **Campos**:
  - `id`: Identificador único
  - `acao`: Tipo de ação (string)
  - `entidade`: Entidade afetada (string)
  - `entidadeId`: ID da entidade afetada
  - `utilizadorId`: Utilizador que executou a ação
  - `detalhes`: Detalhes adicionais (text)
  - `ip`: Endereço IP
  - `userAgent`: User agent do browser
  - `createdAt`: Data/hora da ação
- **Índices**: acao, entidade, createdAt

### 3.2. Enums

- **TipoDocumento**: CARTAO_CIDADAO, PASSAPORTE, OUTRO
- **TipoUtilizador**: CLIENTE, RECECIONISTA, GESTOR
- **EstadoQuarto**: LIVRE, OCUPADO, MANUTENCAO
- **EstadoReserva**: ATIVA, CANCELADA, CONCLUIDA
- **TipoPagamento**: PARCIAL, TOTAL

### 3.3. Migrations

O sistema utiliza Prisma Migrate para gestão de versões do schema. As migrations são versionadas e aplicadas automaticamente através do comando `prisma migrate dev`.

## 4. Backend

### 4.1. Servidor Express

O servidor Express está configurado em `backend/src/server.ts`:

- **Porta**: 3001 (configurável via `PORT` env)
- **CORS**: Configurado para permitir requisições do frontend
- **Middleware**: JSON parser, URL encoded parser
- **Rotas**:
  - `/api/auth`: Autenticação
  - `/api/cliente`: Operações do cliente
  - `/api/gerencia`: Operações da gerência
  - `/api/relatorios`: Relatórios
- **Error Handling**: Middleware global para tratamento de erros
- **Health Check**: Endpoint `/health` para verificação de status

### 4.2. Autenticação e Autorização

#### 4.2.1. Middleware de Autenticação
Localizado em `backend/src/middleware/auth.middleware.ts`:

- **authenticate**: Verifica token JWT e valida utilizador
- **requireRole**: Middleware genérico para verificação de roles
- **requireGestor**: Apenas Gestor
- **requireRececionista**: Rececionista ou Gestor
- **requireAdmin**: Rececionista ou Gestor (alias)

#### 4.2.2. JWT (JSON Web Tokens)
- **Algoritmo**: HS256
- **Expiração**: 7 dias (configurável via `JWT_EXPIRES_IN`)
- **Payload**: `{ userId, userType }`
- **Secret**: Configurado via `JWT_SECRET` env

#### 4.2.3. Hash de Passwords
- **Biblioteca**: bcrypt
- **Rounds**: 10
- **Armazenamento**: Hash no campo `password` da tabela `utilizadores`

### 4.3. Rotas da API

#### 4.3.1. Autenticação (`/api/auth`)

**POST /api/auth/registro**
- Registo de novos utilizadores (sempre como CLIENTE)
- Validação: email único, password mínimo 6 caracteres
- Retorna: token JWT e dados do utilizador

**POST /api/auth/login**
- Autenticação de utilizadores existentes
- Validação: email e password
- Retorna: token JWT e dados do utilizador

**GET /api/auth/perfil**
- Obtém perfil do utilizador autenticado
- Requer: autenticação

#### 4.3.2. Cliente (`/api/cliente`)

Todas as rotas requerem autenticação.

**GET /api/cliente/tipos-quarto**
- Lista tipos de quarto disponíveis
- Retorna: lista de tipos de quarto ativos

**POST /api/cliente/verificar-disponibilidade**
- Verifica disponibilidade de quartos para um período
- Parâmetros: tipoQuartoId, dataInicio, dataFim, quantidadeQuartos
- Retorna: disponibilidade, quartos disponíveis, preço estimado

**POST /api/cliente/reservas**
- Cria nova reserva
- Validações:
  - Datas válidas (início < fim, não no passado)
  - Disponibilidade de quartos
  - Capacidade de hóspedes
- Atribui quartos automaticamente
- Calcula total automaticamente
- Cria/atualiza hóspedes
- Retorna: reserva criada

**GET /api/cliente/reservas**
- Lista reservas do utilizador autenticado
- Retorna: lista de reservas com detalhes

**GET /api/cliente/reservas/:id**
- Obtém detalhes de uma reserva específica
- Validação: reserva pertence ao utilizador

**POST /api/cliente/reservas/:id/cancelar**
- Cancela uma reserva
- Validação: regra das 24 horas
- Libera quartos associados
- Retorna: reserva cancelada

**PUT /api/cliente/reservas/:id**
- Edita uma reserva existente
- Validações:
  - Regra das 24 horas
  - Disponibilidade para novas datas/quantidade
  - Reserva deve estar ATIVA
- Recalcula total
- Reatribui quartos se necessário
- Retorna: reserva atualizada

#### 4.3.3. Gerência (`/api/gerencia`)

Todas as rotas requerem autenticação e permissões de admin (Rececionista ou Gestor).

**Tipos de Quarto**

**GET /api/gerencia/tipos-quarto**
- Lista todos os tipos de quarto
- Acesso: Rececionista e Gestor

**POST /api/gerencia/tipos-quarto**
- Cria novo tipo de quarto
- Acesso: Apenas Gestor
- Validação: nome único

**PUT /api/gerencia/tipos-quarto/:id**
- Atualiza tipo de quarto
- Acesso: Apenas Gestor

**Quartos**

**GET /api/gerencia/quartos**
- Lista todos os quartos
- Inclui: tipo de quarto, estado, reservas

**POST /api/gerencia/quartos**
- Cria novo quarto
- Validação: número único

**PUT /api/gerencia/quartos/:id**
- Atualiza quarto (principalmente estado)

**Hóspedes**

**GET /api/gerencia/hospedes**
- Lista todos os hóspedes
- Filtros: nome, documento, NIF

**POST /api/gerencia/hospedes**
- Cria novo hóspede
- Validação: tipoDocumento + numeroDocumento único

**PUT /api/gerencia/hospedes/:id**
- Atualiza hóspede

**Reservas**

**GET /api/gerencia/reservas**
- Lista todas as reservas
- Filtros: estado, data, cliente
- Inclui: cliente, tipo de quarto, quartos, hóspedes, pagamentos

**GET /api/gerencia/reservas/:id**
- Obtém detalhes completos de uma reserva

**POST /api/gerencia/reservas/:id/checkin**
- Efetua check-in
- Atualiza estado dos quartos para OCUPADO
- Marca checkInEfetuado = true

**POST /api/gerencia/reservas/:id/checkout**
- Efetua check-out
- Atualiza estado dos quartos para LIVRE
- Marca checkOutEfetuado = true
- Atualiza estado da reserva para CONCLUIDA

**POST /api/gerencia/reservas/:id/cancelar**
- Cancela reserva (admin)
- Libera quartos

**Pagamentos**

**GET /api/gerencia/pagamentos**
- Lista todos os pagamentos
- Inclui: reserva, cliente, operador
- Filtros: data, tipo, reserva

**POST /api/gerencia/pagamentos**
- Registra novo pagamento
- Validação: montante > 0, reserva existe
- Calcula saldo pendente

**GET /api/gerencia/pagamentos/:id/comprovativo**
- Gera comprovativo de pagamento
- Retorna: dados do pagamento, reserva, saldo

**Utilizadores**

**GET /api/gerencia/utilizadores**
- Lista todos os utilizadores
- Acesso: Apenas Gestor
- Não retorna passwords

**POST /api/gerencia/utilizadores**
- Cria novo utilizador (Rececionista ou Gestor)
- Acesso: Apenas Gestor
- Validação: email único

#### 4.3.4. Relatórios (`/api/relatorios`)

Todas as rotas requerem autenticação e permissões de admin.

**GET /api/relatorios/ocupacao-diaria**
- Ocupação diária para uma data específica
- Parâmetros: data (query)
- Retorna: quartos ocupados, taxa de ocupação

**GET /api/relatorios/ocupacao-mensal**
- Ocupação mensal para um mês/ano
- Parâmetros: mes, ano (query)
- Retorna: ocupação por dia do mês

**GET /api/relatorios/reservas-periodo**
- Reservas em um período
- Parâmetros: dataInicio, dataFim (query)
- Retorna: lista de reservas com detalhes

**GET /api/relatorios/receita-periodo**
- Receita em um período
- Parâmetros: dataInicio, dataFim (query)
- Retorna: receita total, por tipo de quarto, por dia

**GET /api/relatorios/historico-hospedes**
- Histórico de hóspedes
- Filtros: nome, documento
- Retorna: hóspedes com suas reservas

**GET /api/relatorios/logs-auditoria**
- Logs de auditoria
- Filtros: acao, entidade, data
- Retorna: lista de logs com detalhes

### 4.4. Lógica de Negócio

#### 4.4.1. Cálculo de Total da Reserva
Função: `calcularTotalReserva` em `backend/src/utils/reserva.util.ts`

**Fórmula**:
```
Número de noites = dataFim - dataInicio
Valor base por quarto por noite = tipoQuarto.valorBaseDiaria

Se hospedesPorQuarto > capacidadeBase:
  Suplemento = (hospedesPorQuarto - capacidadeBase) × suplementoHospedeExtra
  Valor por quarto por noite += Suplemento

Se incluirPequenoAlmoco:
  Valor por quarto por noite += hospedesPorQuarto × custoPequenoAlmoco

Total = Valor por quarto por noite × Número de noites × Quantidade de quartos
```

#### 4.4.2. Verificação de Disponibilidade
Função: `verificarDisponibilidade` em `backend/src/utils/reserva.util.ts`

**Lógica**:
1. Busca quartos do tipo solicitado com estado LIVRE
2. Verifica reservas ativas que se sobrepõem ao período
3. Conta quartos ocupados no período
4. Calcula quartos disponíveis = quartos livres - quartos ocupados
5. Compara com quantidade solicitada

#### 4.4.3. Atribuição de Quartos
Função: `atribuirQuartos` em `backend/src/utils/reserva.util.ts`

**Lógica**:
1. Busca quartos livres do tipo
2. Filtra quartos não ocupados no período
3. Seleciona os primeiros N quartos (onde N = quantidadeQuartos)
4. Retorna IDs dos quartos selecionados

#### 4.4.4. Regra das 24 Horas
Função: `podeEditarCancelar` em `backend/src/utils/reserva.util.ts`

**Lógica**:
- Calcula diferença entre dataInicio da reserva e agora
- Se diferença > 24 horas: permite editar/cancelar
- Se diferença ≤ 24 horas: bloqueia edição/cancelamento

### 4.5. Logs de Auditoria

Sistema completo de logs de auditoria implementado em `backend/src/utils/logger.util.ts`:

- **Ações registradas**:
  - REGISTRO_UTILIZADOR
  - LOGIN
  - CRIAR_RESERVA
  - EDITAR_RESERVA
  - CANCELAR_RESERVA
  - CHECK_IN
  - CHECK_OUT
  - REGISTRAR_PAGAMENTO
  - CRIAR_QUARTO
  - ATUALIZAR_QUARTO
  - CRIAR_TIPO_QUARTO
  - ATUALIZAR_TIPO_QUARTO
  - CRIAR_HOSPEDE
  - ATUALIZAR_HOSPEDE
  - CRIAR_UTILIZADOR

- **Informações capturadas**:
  - Ação executada
  - Entidade afetada
  - ID da entidade
  - Utilizador que executou
  - Detalhes adicionais
  - IP do cliente
  - User Agent

## 5. Frontend

### 5.1. Arquitetura Next.js

O frontend utiliza Next.js 14 com App Router:

- **Estrutura de Rotas**: Baseada em pastas em `src/app/`
- **Server Components**: Por padrão (quando possível)
- **Client Components**: Marcados com `'use client'`
- **Layouts**: Layout compartilhado em `layout.tsx`
- **Providers**: Context providers em `providers.tsx`

### 5.2. Gestão de Estado

**Zustand Store** (`src/store/authStore.ts`):
- Estado de autenticação global
- Token JWT armazenado no localStorage
- Informações do utilizador
- Funções: `setAuth`, `logout`, `isAuthenticated`

### 5.3. Cliente HTTP

**Axios Configurado** (`src/lib/api.ts`):
- Base URL configurável via `NEXT_PUBLIC_API_URL`
- Interceptor de requisições: adiciona token JWT automaticamente
- Interceptor de respostas: trata erros 401 (logout automático)

### 5.4. Páginas e Funcionalidades

#### 5.4.1. Autenticação

**Página de Login** (`/login`):
- Formulário de email e password
- Validação de campos
- Redirecionamento baseado em tipo de utilizador
- Tratamento de erros

**Página de Registo** (`/registro`):
- Formulário: nome, email, password, confirmPassword
- Validação: passwords coincidem, mínimo 6 caracteres
- Registo automático como CLIENTE

#### 5.4.2. Área do Cliente

**Página Principal** (`/cliente`):
- Dashboard com opções de navegação
- Links para: pesquisar quartos, minhas reservas

**Pesquisar e Reservar** (`/cliente/reservar`):
- Seleção de tipo de quarto
- Seleção de datas (dataInicio, dataFim)
- Seleção de quantidade de quartos
- Número de hóspedes por quarto
- Opção de incluir pequeno-almoço
- Cálculo em tempo real do total estimado
- Verificação de disponibilidade
- Formulário dinâmico de hóspedes
- Criação de reserva

**Minhas Reservas** (`/cliente/reservas`):
- Lista de reservas organizadas por:
  - Reservas Futuras
  - Reservas em Curso
  - Reservas Passadas
- Informação sobre regra das 24 horas
- Botão para editar reservas futuras (se permitido)
- Botão para cancelar reservas futuras (se permitido)
- Visualização de detalhes completos

**Editar Reserva** (`/cliente/reservas/[id]/editar`):
- Formulário pré-preenchido com dados atuais
- Possibilidade de alterar: datas, quantidade de quartos, hóspedes, pequeno-almoço
- Verificação de disponibilidade para novas datas
- Cálculo de novo total
- Validação da regra das 24 horas

#### 5.4.3. Área da Gerência

**Dashboard** (`/gerencia`):
- Menu de navegação para todas as funcionalidades
- Acesso baseado em permissões

**Gestão de Quartos** (`/gerencia/quartos`):
- Lista de todos os quartos
- Filtros por tipo e estado
- Criar novo quarto
- Alterar estado do quarto
- Visualização de reservas associadas

**Tipos de Quarto** (`/gerencia/tipos-quarto`):
- Lista de tipos de quarto
- Criar tipo (apenas Gestor)
- Editar tipo (apenas Gestor)
- Visualização de preços e capacidades

**Hóspedes** (`/gerencia/hospedes`):
- Lista de hóspedes
- Pesquisa por nome, documento, NIF
- Criar novo hóspede
- Editar hóspede
- Histórico de reservas do hóspede

**Reservas** (`/gerencia/reservas`):
- Lista de todas as reservas
- Filtros por estado, data, cliente
- Visualização de detalhes completos
- Check-in / Check-out
- Cancelar reserva

**Pagamentos** (`/gerencia/pagamentos`):
- Lista de pagamentos
- Registar novo pagamento
- Seleção de reserva ativa
- Cálculo de saldo pendente
- Gerar comprovativo (HTML imprimível)

**Utilizadores** (`/gerencia/utilizadores`):
- Lista de utilizadores (apenas Gestor)
- Criar utilizador (Rececionista ou Gestor)
- Visualização de permissões

**Relatórios** (`/gerencia/relatorios`):
- Ocupação diária
- Ocupação mensal
- Reservas por período
- Receita por período
- Histórico de hóspedes
- Logs de auditoria
- Visualização formatada (não JSON bruto)

### 5.5. Estilização

**Tailwind CSS**:
- Framework utility-first
- Configuração em `tailwind.config.js`
- Cores personalizadas (primary-600, etc.)
- Responsive design (mobile-first)

**Estilos Globais** (`globals.css`):
- Reset CSS
- Variáveis CSS
- Estilos para inputs (cor de texto visível)

### 5.6. Validação e Tratamento de Erros

- **Validação de Formulários**: React Hook Form
- **Validação de API**: Express Validator (backend)
- **Tratamento de Erros**: Try-catch em todas as chamadas API
- **Mensagens de Erro**: Exibidas em componentes de alerta
- **Loading States**: Indicadores de carregamento durante requisições

## 6. Regras de Negócio Implementadas

### 6.1. Validações de Reserva

1. **Datas**:
   - Data de início deve ser anterior à data de fim
   - Não permite reservas com datas no passado
   - Verificação de disponibilidade para o período

2. **Capacidade**:
   - Número de hóspedes por quarto deve ser ≥ 1
   - Máximo: capacidadeBase + 2 hóspedes extras

3. **Disponibilidade**:
   - Verifica quartos livres do tipo solicitado
   - Verifica sobreposição com reservas ativas
   - Previne overbooking

4. **Regra das 24 Horas**:
   - Edição/cancelamento permitido apenas se dataInicio > agora + 24h
   - Aplicada tanto no backend quanto no frontend

### 6.2. Cálculo de Preços

1. **Diária Base**: valorBaseDiaria × número de noites × quantidade de quartos
2. **Suplemento Hóspede Extra**: (hóspedesExtras × suplementoHospedeExtra) × noites × quartos
3. **Pequeno-Almoço**: (hóspedesPorQuarto × custoPequenoAlmoco) × noites × quartos
4. **Total**: Soma de todos os componentes, arredondado para 2 casas decimais

### 6.3. Gestão de Quartos

1. **Estados**:
   - LIVRE: Disponível para reserva
   - OCUPADO: Atualmente ocupado
   - MANUTENCAO: Indisponível para manutenção

2. **Atribuição Automática**:
   - Quartos são atribuídos automaticamente na criação da reserva
   - Seleciona quartos livres não ocupados no período
   - Atualiza estado para OCUPADO no check-in

3. **Liberação**:
   - Quartos são liberados no cancelamento ou check-out
   - Estado atualizado para LIVRE

### 6.4. Pagamentos

1. **Tipos**:
   - PARCIAL: Pagamento parcial da reserva
   - TOTAL: Pagamento total da reserva

2. **Cálculo de Saldo**:
   - Total pago = soma de todos os pagamentos da reserva
   - Saldo pendente = totalCalculado - totalPago

3. **Comprovativo**:
   - Geração de comprovativo HTML imprimível
   - Inclui: dados do pagamento, reserva, cliente, saldo

### 6.5. Permissões e Acesso

1. **CLIENTE**:
   - Ver tipos de quarto
   - Criar/editar/cancelar próprias reservas
   - Ver próprias reservas

2. **RECECIONISTA**:
   - Todas as permissões de visualização
   - Criar/editar/cancelar reservas (de qualquer cliente)
   - Check-in/Check-out
   - Registar pagamentos
   - Ver relatórios
   - Ver tipos de quarto (mas não criar/editar)

3. **GESTOR**:
   - Todas as permissões do Rececionista
   - Criar/editar tipos de quarto
   - Criar/editar utilizadores
   - Acesso completo a todos os relatórios

## 7. Segurança

### 7.1. Autenticação

- **JWT Tokens**: Tokens assinados com secret
- **Expiração**: Tokens expiram após 7 dias
- **Validação**: Token validado em cada requisição protegida
- **Armazenamento**: Token no localStorage (frontend)

### 7.2. Autorização

- **Role-Based Access Control (RBAC)**: Baseado em tipos de utilizador
- **Middleware de Autorização**: Verificação de roles em rotas protegidas
- **Validação de Propriedade**: Clientes só acedem às próprias reservas

### 7.3. Validação de Dados

- **Backend**: Express Validator para validação de entrada
- **Frontend**: React Hook Form para validação de formulários
- **Sanitização**: Validação de tipos, formatos, ranges

### 7.4. Passwords

- **Hash**: bcrypt com 10 rounds
- **Armazenamento**: Apenas hash armazenado, nunca password em texto
- **Validação**: Comparação com hash na autenticação

### 7.5. CORS

- **Configuração**: CORS configurado para permitir apenas origem do frontend
- **Credentials**: Suporte a credenciais habilitado

### 7.6. Logs de Auditoria

- **Rastreabilidade**: Todas as ações críticas são registadas
- **Informações**: IP, User Agent, utilizador, timestamp
- **Consulta**: Logs disponíveis para gestores

## 8. Performance e Otimizações

### 8.1. Base de Dados

- **Índices**: Índices em campos frequentemente consultados (logs, reservas)
- **Queries Otimizadas**: Uso de includes do Prisma para evitar N+1 queries
- **Cascading Deletes**: Configurado para manter integridade

### 8.2. Frontend

- **Next.js App Router**: Renderização otimizada
- **Lazy Loading**: Componentes carregados sob demanda
- **Cálculo em Tempo Real**: Total estimado calculado no cliente

### 8.3. API

- **Validação Rápida**: Validações feitas antes de queries pesadas
- **Error Handling**: Tratamento eficiente de erros

## 9. Testes e Validação

### 9.1. Validações Implementadas

- **Validação de Formulários**: Frontend e backend
- **Validação de Negócio**: Regras implementadas e testadas
- **Validação de Permissões**: Middleware testado

### 9.2. Dados de Teste

Script de seed (`backend/prisma/seed.ts`) cria:
- Tipos de quarto (Standard, Deluxe, Suite, Solteiro)
- Quartos de cada tipo
- Utilizadores de teste (Cliente, Rececionista, Gestor)
- Reservas de exemplo

## 10. Deploy e Configuração

### 10.1. Variáveis de Ambiente

**Backend (.env)**:
```
DATABASE_URL="mysql://user:password@localhost:port/hotel_db"
JWT_SECRET="secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 10.2. Comandos de Instalação

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### 10.3. Requisitos do Sistema

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

## 11. Conclusão

O sistema de gestão de reservas hoteleiras foi desenvolvido com uma arquitetura moderna, utilizando tecnologias atuais e boas práticas de desenvolvimento. O sistema oferece:

- **Funcionalidades Completas**: Todas as funcionalidades solicitadas implementadas
- **Segurança**: Autenticação e autorização robustas
- **Usabilidade**: Interface intuitiva e responsiva
- **Manutenibilidade**: Código organizado e documentado
- **Escalabilidade**: Arquitetura preparada para crescimento

O projeto demonstra competência em desenvolvimento full-stack, gestão de bases de dados, autenticação, e implementação de regras de negócio complexas.

---

**Data de Conclusão**: 26 de Janeiro de 2025
**Versão**: 1.0.0
