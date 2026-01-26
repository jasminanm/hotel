# Sistema de Gestão de Reservas Hoteleiras

Aplicação web completa para gestão integral de um hotel, desenvolvida como projeto de Desenvolvimento de Software.

## 📋 Descrição

Sistema que permite:
- **Clientes**: pesquisar e reservar quartos, gerir reservas mediante autenticação
- **Gerência do Hotel**: administrar quartos, tipos de quarto, hóspedes, reservas, pagamentos, check-in/check-out e relatórios

## 🏗️ Arquitetura

- **Frontend**: Next.js 14 (React) com TypeScript
- **Backend**: Node.js com Express e TypeScript
- **Base de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT (JSON Web Tokens)

### Estrutura do Projeto

```
Hotel/
├── frontend/          # Aplicação Next.js
├── backend/           # API Express
├── database/          # Migrations e seeds
└── docs/             # Documentação
```

## 🚀 Tecnologias Escolhidas

### Frontend
- **Next.js 14**: Framework React com App Router para melhor performance e SEO
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Estilização moderna e responsiva
- **React Hook Form**: Gestão de formulários
- **Zustand**: Gestão de estado

### Backend
- **Node.js + Express**: API RESTful robusta
- **TypeScript**: Consistência e segurança de tipos
- **Prisma ORM**: Type-safe database access
- **JWT**: Autenticação segura
- **bcrypt**: Hash de passwords

### Base de Dados
- **MySQL**: Base de dados relacional (compatível com MySQL Workbench)
- **Prisma**: ORM moderno com migrations automáticas

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+ (ou MySQL Workbench)
- npm ou yarn

### Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/hotel_db"
JWT_SECRET="seu-secret-jwt"
PORT=3001

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

4. Execute as migrations:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. Inicie os servidores:
```bash
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

## 👥 Perfis de Utilizador

### Cliente
- Registar-se e autenticar-se
- Pesquisar e reservar quartos
- Gerir reservas (editar/cancelar até 24h antes)
- Consultar histórico de reservas

### Gestor
- Todas as permissões do Rececionista
- Gestão de tipos de quarto e preços
- Configurações globais
- Relatórios completos

### Rececionista
- Criar/editar/cancelar reservas
- Registar pagamentos
- Check-in/Check-out
- Consultar relatórios básicos

## 📊 Entidades Principais

- **Quarto**: número, tipo, capacidade, estado
- **Tipo de Quarto**: nome, descrição, valor base, suplementos
- **Hóspede**: nome, documento, NIF (opcional)
- **Reserva**: datas, quartos, hóspedes, estado, total
- **Pagamento**: montante, data, tipo, operador

## 🔒 Regras de Negócio

- Validação de disponibilidade de quartos
- Cálculo automático de totais (diárias + suplementos + pequeno-almoço)
- Cancelamento/edição permitido até 24h antes do check-in
- Prevenção de overbooking
- Validação de capacidade por tipo de quarto

## 📈 Relatórios

- Ocupação diária/mensal
- Reservas ativas, futuras e canceladas
- Receita por período e tipo de quarto
- Histórico de hóspedes
- Logs de auditoria

## 📝 Documentação

Consulte o ficheiro `INSTALACAO.md` para instruções detalhadas de instalação e configuração.

## 🔑 Credenciais de Teste

Após executar o seed da base de dados, pode usar as seguintes credenciais:

- **Gestor**: `gestor@hotel.com` / `password123`
- **Rececionista**: `rececionista@hotel.com` / `password123`
- **Cliente**: `cliente@example.com` / `password123`

## 📋 Funcionalidades Implementadas

### Área do Cliente
- ✅ Registro e autenticação
- ✅ Pesquisa de tipos de quarto
- ✅ Verificação de disponibilidade
- ✅ Criação de reservas
- ✅ Listagem de reservas
- ✅ Cancelamento de reservas (com validação de 24h)
- ✅ Visualização de detalhes da reserva

### Área da Gerência
- ✅ Gestão de tipos de quarto (apenas Gestor)
- ✅ Gestão de quartos
- ✅ Gestão de hóspedes
- ✅ Gestão de reservas
- ✅ Check-in/Check-out
- ✅ Registro de pagamentos
- ✅ Gestão de utilizadores (apenas Gestor)
- ✅ Relatórios:
  - Ocupação diária/mensal
  - Reservas por período
  - Receita por período
  - Histórico de hóspedes
  - Logs de auditoria

## 🛡️ Regras de Negócio Implementadas

- ✅ Validação de datas (não permitir reservas no passado)
- ✅ Verificação de disponibilidade de quartos
- ✅ Prevenção de overbooking
- ✅ Cálculo automático de totais (diárias + suplementos + pequeno-almoço)
- ✅ Regra das 24 horas para cancelamento/edição
- ✅ Validação de capacidade por tipo de quarto
- ✅ Suporte a hóspedes extras
- ✅ Gestão de estados de quartos (LIVRE, OCUPADO, MANUTENCAO)
- ✅ Logs de auditoria para ações críticas

## 👨‍💻 Desenvolvido por

Projeto desenvolvido no âmbito da Licenciatura em Engenharia Informática - Universidade Europeia

## 📅 Data de Entrega

26/01/2025
