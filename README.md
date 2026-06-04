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



## Credenciais de teste

| Perfil | Email | Password |
|--------|-------|----------|
| Gestor | gestor@hotel.com | password123 |
| Rececionista | rececionista@hotel.com | password123 |
| Cliente | cliente@example.com | password123 |

## Autora

Nayuka Malebo
