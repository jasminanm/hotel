# Guia de Verificação - Próximos Passos

## ✅ O que já está funcionando

- Frontend rodando na porta 3000
- Backend rodando na porta 3001
- Login funcionando
- Página de reserva acessível

## 🔧 Correções Aplicadas

1. **Letras brancas corrigidas** - Adicionei `text-gray-900 bg-white` em todos os inputs da página de reserva

## 📋 Próximos Passos Essenciais

### 1. Executar o Seed (CRÍTICO)

Se ainda não executou, precisa criar os dados iniciais:

```bash
cd /Users/nayukamalebo/Hotel/backend
npm run seed
```

**O que o seed cria:**
- ✅ 3 utilizadores de teste (Cliente, Rececionista, Gestor)
- ✅ 3 tipos de quarto (Duplo, Suite, Familiar)
- ✅ 10 quartos (5 duplos, 3 suites, 2 familiares)
- ✅ 2 hóspedes de exemplo

**Sem o seed, não há:**
- ❌ Tipos de quarto para reservar
- ❌ Quartos disponíveis
- ❌ Dados para testar

### 2. Verificar se o Seed foi Executado

No MySQL Workbench, execute:

```sql
-- Verificar utilizadores
SELECT * FROM utilizadores;

-- Verificar tipos de quarto
SELECT * FROM tipos_quarto;

-- Verificar quartos
SELECT * FROM quartos;
```

Se estas tabelas estiverem vazias, execute o seed.

### 3. Testar a Criação de Reserva

1. **Acesse:** `http://localhost:3000`
2. **Faça login** com: `cliente@example.com` / `password123`
3. **Escolha um tipo de quarto** e clique em "Reservar"
4. **Preencha o formulário:**
   - Selecione datas futuras
   - Escolha quantidade de quartos
   - Preencha dados dos hóspedes
5. **Clique em "Verificar Disponibilidade"** primeiro
6. **Se disponível, clique em "Confirmar Reserva"**

### 4. Verificar Erros

Se a reserva não for criada:

1. **Abra o Console do Desenvolvedor** no navegador (Cmd+Option+I)
2. **Vá para a aba "Console"**
3. **Tente criar a reserva novamente**
4. **Veja os erros que aparecem**

Erros comuns:
- `Não há quartos disponíveis` → Execute o seed
- `Tipo de quarto não encontrado` → Execute o seed
- `Erro de conexão` → Verifique se o backend está rodando

### 5. Verificar Logs do Backend

No terminal onde o backend está rodando, veja as mensagens quando tentar criar uma reserva. Deve aparecer:
- Requisições recebidas
- Erros (se houver)
- Logs de auditoria

## 🐛 Resolução de Problemas

### Problema: "Não há quartos disponíveis"

**Solução:**
```bash
cd /Users/nayukamalebo/Hotel/backend
npm run seed
```

### Problema: Erro ao criar reserva

1. Verifique o Console do navegador (Cmd+Option+I)
2. Verifique o terminal do backend
3. Verifique se o MySQL está rodando (MAMP ativo)
4. Verifique se a base de dados `hotel_db` existe

### Problema: Letras ainda brancas

1. Recarregue a página (Cmd+R)
2. Limpe o cache do navegador (Cmd+Shift+R)
3. Verifique se o frontend foi reiniciado após as alterações

## ✅ Checklist Final

- [ ] Seed executado com sucesso
- [ ] Utilizadores criados (verificar no MySQL)
- [ ] Tipos de quarto criados (verificar no MySQL)
- [ ] Quartos criados (verificar no MySQL)
- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3000
- [ ] Login funcionando
- [ ] Página de reserva carregando
- [ ] Campos de texto visíveis (não brancos)
- [ ] Verificação de disponibilidade funcionando
- [ ] Criação de reserva funcionando

## 📞 Se ainda não funcionar

1. Execute o seed novamente
2. Verifique os logs do backend
3. Verifique o Console do navegador
4. Envie os erros específicos que aparecem
