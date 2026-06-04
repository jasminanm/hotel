# Sistema de Gestão de Reservas Hoteleiras

Projeto de Programação Web — gestão de reservas de um hotel.


## Estrutura

```
Hotel/
├── frontend/
├── backend/
└── hotel_db.sql
```

## Instalação

1. MySQL

2. Backend:
```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```

3. Frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Abrir http://localhost:3000 (API em http://localhost:3001)

### .env do backend

```
DATABASE_URL="mysql://utilizador:password@localhost:3306/hotel_db"
JWT_SECRET="alterar-este-valor"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

## Credenciais de teste

| Perfil | Email | Password |
|--------|-------|----------|
| Gestor | gestor@hotel.com | password123 |
| Rececionista | rececionista@hotel.com | password123 |
| Cliente | cliente@example.com | password123 |

## Autor

Nayuka Malebo
