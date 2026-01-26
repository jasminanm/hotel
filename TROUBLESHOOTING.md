# Guia de Resolução de Problemas

## Problema: Não consigo fazer login / Letras brancas nos campos

### Solução 1: Verificar se o backend está rodando

1. Abra um terminal e verifique se o backend está rodando:
```bash
lsof -ti:3001
```

Se não retornar nada, o backend não está rodando. Inicie-o:
```bash
cd /Users/nayukamalebo/Hotel/backend
npm run dev
```

Deve aparecer: `🚀 Servidor rodando na porta 3001`

### Solução 2: Verificar se os utilizadores foram criados

Execute o seed para criar os utilizadores de teste:

```bash
cd /Users/nayukamalebo/Hotel/backend
npm run seed
```

Deve aparecer:
```
✅ Utilizadores criados
🎉 Seed concluído com sucesso!
```

### Solução 3: Verificar se o frontend está rodando

Em outro terminal:
```bash
cd /Users/nayukamalebo/Hotel/frontend
npm run dev
```

Deve aparecer algo como: `Ready - started server on 0.0.0.0:3000`

### Solução 4: Verificar conexão com a base de dados

1. Verifique se o MySQL está rodando (porta 8889 para MAMP)
2. Verifique o ficheiro `.env` no backend:
```bash
cd /Users/nayukamalebo/Hotel/backend
cat .env
```

Deve ter:
```
DATABASE_URL="mysql://root:root@localhost:8889/hotel_db"
```

### Solução 5: Testar a API diretamente

Teste se a API está respondendo:

```bash
curl http://localhost:3001/health
```

Deve retornar: `{"status":"ok","timestamp":"..."}`

### Solução 6: Verificar logs do backend

Quando tentar fazer login, verifique o terminal do backend para ver se há erros.

### Credenciais de Teste

Após executar o seed, use:
- **Cliente**: `cliente@example.com` / `password123`
- **Rececionista**: `rececionista@hotel.com` / `password123`
- **Gestor**: `gestor@hotel.com` / `password123`

## Problema: Erro "Cannot connect to server"

### Verificar se ambos os servidores estão rodando:

1. **Backend** (porta 3001):
```bash
cd /Users/nayukamalebo/Hotel/backend
npm run dev
```

2. **Frontend** (porta 3000):
```bash
cd /Users/nayukamalebo/Hotel/frontend
npm run dev
```

## Problema: Erro de conexão com a base de dados

1. Verifique se o MySQL está rodando (MAMP deve estar ativo)
2. Verifique se a base de dados existe:
```sql
-- No MySQL Workbench
SHOW DATABASES;
-- Deve aparecer hotel_db
```

3. Se não existir, crie:
```sql
CREATE DATABASE hotel_db;
```

4. Execute as migrations novamente:
```bash
cd /Users/nayukamalebo/Hotel/backend
npx prisma migrate dev
```

## Problema: Porta já em uso

Se aparecer `EADDRINUSE`:

1. Encontre o processo:
```bash
lsof -ti:3001  # Para backend
lsof -ti:3000  # Para frontend
```

2. Pare o processo:
```bash
kill -9 <PID>
```

Ou mude a porta no `.env` (backend) ou `next.config.js` (frontend).
