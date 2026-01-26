# Sistema de Permissões - Gestor e Rececionista

## 📋 Resumo das Permissões

Este documento detalha as permissões implementadas para cada perfil de utilizador conforme especificado no briefing.

---

## 👤 Perfil: GESTOR

### ✅ Permissões Completas

O Gestor tem acesso a **todas** as funcionalidades do sistema:

#### Gestão de Tipos de Quarto e Preços
- ✅ **Ver** tipos de quarto
- ✅ **Criar** novos tipos de quarto
- ✅ **Editar** tipos de quarto existentes
- ✅ **Alterar** preços e configurações

#### Gestão de Quartos
- ✅ **Listar** todos os quartos
- ✅ **Criar** novos quartos
- ✅ **Editar** quartos existentes
- ✅ **Alterar** estado dos quartos (LIVRE, OCUPADO, MANUTENCAO)

#### Gestão de Hóspedes
- ✅ **Listar** todos os hóspedes
- ✅ **Criar** novos hóspedes
- ✅ **Editar** hóspedes existentes
- ✅ **Inativar** hóspedes

#### Gestão de Reservas
- ✅ **Listar** todas as reservas
- ✅ **Criar** reservas
- ✅ **Editar** reservas
- ✅ **Cancelar** reservas
- ✅ **Efetuar** check-in
- ✅ **Efetuar** check-out

#### Faturação Simulada
- ✅ **Registar** pagamentos
- ✅ **Ver** todos os pagamentos
- ✅ **Emitir** comprovativos de pagamento

#### Relatórios
- ✅ **Acessar** todos os relatórios:
  - Ocupação diária
  - Ocupação mensal
  - Reservas por período
  - Receita por período
  - Histórico de hóspedes
  - Logs de auditoria

#### Configurações e Utilizadores
- ✅ **Gerir** utilizadores do sistema
- ✅ **Criar** novos utilizadores (Cliente, Rececionista, Gestor)
- ✅ **Editar** utilizadores
- ✅ **Inativar** utilizadores

---

## 👤 Perfil: RECECIONISTA

### ✅ Permissões Operacionais

O Rececionista tem acesso às funcionalidades operacionais, mas **não pode** alterar configurações globais:

#### ❌ NÃO PODE (Restrições)
- ❌ **Criar** tipos de quarto
- ❌ **Editar** tipos de quarto
- ❌ **Alterar** preços e configurações globais
- ❌ **Gerir** utilizadores do sistema
- ❌ **Criar/editar** outros utilizadores

#### ✅ PODE (Permissões Operacionais)

##### Gestão de Reservas
- ✅ **Listar** todas as reservas
- ✅ **Criar** reservas para clientes
- ✅ **Editar** reservas existentes
- ✅ **Cancelar** reservas
- ✅ **Efetuar** check-in
- ✅ **Efetuar** check-out

##### Faturação Simulada
- ✅ **Registar** pagamentos
- ✅ **Ver** todos os pagamentos
- ✅ **Emitir** comprovativos de pagamento

##### Gestão de Quartos (Operacional)
- ✅ **Ver** todos os quartos
- ✅ **Criar** novos quartos (se necessário)
- ✅ **Editar** quartos existentes
- ✅ **Alterar** estado dos quartos (para check-in/check-out)

##### Gestão de Hóspedes
- ✅ **Listar** todos os hóspedes
- ✅ **Criar** novos hóspedes
- ✅ **Editar** hóspedes existentes
- ✅ **Inativar** hóspedes

##### Relatórios Básicos
- ✅ **Consultar** relatórios:
  - Ocupação diária
  - Ocupação mensal
  - Reservas por período
  - Receita por período
  - Histórico de hóspedes
  - Logs de auditoria

##### Ver Tipos de Quarto (Apenas Leitura)
- ✅ **Ver** tipos de quarto disponíveis (necessário para criar reservas)
- ❌ **Não pode** criar ou editar tipos de quarto

---

## 🔒 Implementação Técnica

### Backend (API Routes)

#### Middleware de Autenticação
- `authenticate`: Verifica token JWT
- `requireAdmin`: Permite GESTOR e RECECIONISTA
- `requireGestor`: Permite apenas GESTOR

#### Rotas com Restrições de Gestor

```typescript
// Apenas GESTOR pode criar/editar tipos de quarto
router.post('/tipos-quarto', requireGestor, ...)
router.put('/tipos-quarto/:id', requireGestor, ...)

// Apenas GESTOR pode gerir utilizadores
router.get('/utilizadores', requireGestor, ...)
router.post('/utilizadores', requireGestor, ...)
router.put('/utilizadores/:id', requireGestor, ...)
```

#### Rotas Acessíveis a GESTOR e RECECIONISTA

```typescript
// Ambos podem ver tipos de quarto (para criar reservas)
router.get('/tipos-quarto', ...)

// Ambos podem gerir quartos
router.get('/quartos', ...)
router.post('/quartos', ...)
router.put('/quartos/:id', ...)

// Ambos podem gerir hóspedes
router.get('/hospedes', ...)
router.post('/hospedes', ...)
router.put('/hospedes/:id', ...)

// Ambos podem gerir reservas
router.get('/reservas', ...)
router.post('/reservas', ...)
router.put('/reservas/:id', ...)
router.post('/reservas/:id/checkin', ...)
router.post('/reservas/:id/checkout', ...)

// Ambos podem gerir pagamentos
router.get('/pagamentos', ...)
router.post('/pagamentos', ...)
router.get('/pagamentos/:id/comprovativo', ...)

// Ambos podem ver relatórios
router.get('/relatorios/*', ...)
```

### Frontend (Interface)

#### Verificação de Permissões
- Páginas verificam o tipo de utilizador antes de renderizar
- Links condicionais baseados no perfil:
  - "Tipos de Quarto" - apenas para GESTOR
  - "Utilizadores" - apenas para GESTOR
  - Outras páginas - GESTOR e RECECIONISTA

#### Exemplo de Verificação

```typescript
// Página de Tipos de Quarto
useEffect(() => {
  if (!isAuthenticated || user?.tipo !== 'GESTOR') {
    router.push('/gerencia');
    return;
  }
}, [isAuthenticated, user]);

// Dashboard de Gerência
const isGestor = user?.tipo === 'GESTOR';

{isGestor && (
  <Link href="/gerencia/tipos-quarto">Tipos de Quarto</Link>
)}
```

---

## ✅ Checklist de Conformidade

### Requisitos do Briefing

- ✅ **Gestor**: Permissões completas
  - ✅ Gestão de tipos de quarto e preços
  - ✅ Gestão de quartos
  - ✅ Gestão de hóspedes
  - ✅ Gestão de reservas
  - ✅ Faturação simulada
  - ✅ Relatórios
  - ✅ Configurações (utilizadores)

- ✅ **Rececionista**: Permissões operacionais
  - ✅ Criar/editar/cancelar reservas
  - ✅ Registar pagamentos
  - ✅ Check-in/check-out
  - ✅ Consultar relatórios básicos
  - ✅ **NÃO pode** alterar tipos de quarto
  - ✅ **NÃO pode** alterar configurações globais

---

## 🧪 Teste de Permissões

### Como Testar

1. **Login como Rececionista:**
   - Email: `rececionista@hotel.com`
   - Password: `password123`
   - Verificar que não vê link "Tipos de Quarto" no dashboard
   - Verificar que não consegue acessar `/gerencia/tipos-quarto`
   - Verificar que consegue criar reservas, registar pagamentos, etc.

2. **Login como Gestor:**
   - Email: `gestor@hotel.com`
   - Password: `password123`
   - Verificar que vê todos os links no dashboard
   - Verificar que consegue acessar todas as páginas
   - Verificar que consegue criar/editar tipos de quarto
   - Verificar que consegue gerir utilizadores

---

## 📝 Notas

- As permissões são verificadas tanto no **frontend** (interface) quanto no **backend** (API)
- Mesmo que alguém tente acessar uma rota diretamente, o backend bloqueia se não tiver permissão
- Todos os logs de auditoria registam quem executou cada ação
- O sistema usa JWT para autenticação e validação de permissões

---

**Última atualização:** 26/01/2025
