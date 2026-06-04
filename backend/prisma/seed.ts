import { PrismaClient, TipoUtilizador, TipoDocumento, EstadoQuarto } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('A iniciar seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const gestor = await prisma.utilizador.upsert({
    where: { email: 'gestor@hotel.com' },
    update: {},
    create: {
      email: 'gestor@hotel.com',
      password: hashedPassword,
      nome: 'Gestor Principal',
      tipo: TipoUtilizador.GESTOR,
    },
  });

  const rececionista = await prisma.utilizador.upsert({
    where: { email: 'rececionista@hotel.com' },
    update: {},
    create: {
      email: 'rececionista@hotel.com',
      password: hashedPassword,
      nome: 'Rececionista',
      tipo: TipoUtilizador.RECECIONISTA,
    },
  });

  const cliente = await prisma.utilizador.upsert({
    where: { email: 'cliente@example.com' },
    update: {},
    create: {
      email: 'cliente@example.com',
      password: hashedPassword,
      nome: 'Cliente Teste',
      tipo: TipoUtilizador.CLIENTE,
    },
  });

  await prisma.hospede.upsert({
    where: { utilizadorId: cliente.id },
    update: {},
    create: {
      utilizadorId: cliente.id,
      nome: cliente.nome,
      tipoDocumento: TipoDocumento.OUTRO,
      numeroDocumento: cliente.email,
    },
  });

  console.log('Utilizadores criados');

  const tipoDuplo = await prisma.tipoQuarto.upsert({
    where: { nome: 'Quarto Duplo' },
    update: {},
    create: {
      nome: 'Quarto Duplo',
      descricao: 'Quarto confortável com cama de casal, ideal para casais.',
      valorBaseDiaria: 80.0,
      capacidadeBase: 2,
      suplementoHospedeExtra: 15.0,
      custoPequenoAlmoco: 8.0,
    },
  });

  const tipoSuite = await prisma.tipoQuarto.upsert({
    where: { nome: 'Suite' },
    update: {},
    create: {
      nome: 'Suite',
      descricao: 'Suite luxuosa com sala de estar separada e varanda.',
      valorBaseDiaria: 150.0,
      capacidadeBase: 2,
      suplementoHospedeExtra: 25.0,
      custoPequenoAlmoco: 12.0,
    },
  });

  const tipoFamiliar = await prisma.tipoQuarto.upsert({
    where: { nome: 'Quarto Familiar' },
    update: {},
    create: {
      nome: 'Quarto Familiar',
      descricao: 'Quarto espaçoso com camas extras, perfeito para famílias.',
      valorBaseDiaria: 120.0,
      capacidadeBase: 4,
      suplementoHospedeExtra: 20.0,
      custoPequenoAlmoco: 10.0,
    },
  });

  const tipoSolteiro = await prisma.tipoQuarto.upsert({
    where: { nome: 'Quarto Solteiro' },
    update: {},
    create: {
      nome: 'Quarto Solteiro',
      descricao: 'Quarto compacto com cama de solteiro, ideal para viajantes individuais.',
      valorBaseDiaria: 50.0,
      capacidadeBase: 1,
      suplementoHospedeExtra: 20.0,
      custoPequenoAlmoco: 6.0,
    },
  });

  console.log('Tipos de quarto criados');

  const quartos = [];
  for (let i = 1; i <= 5; i++) {
    quartos.push(
      await prisma.quarto.upsert({
        where: { numero: `101${i}` },
        update: {},
        create: {
          numero: `101${i}`,
          tipoQuartoId: tipoDuplo.id,
          estado: EstadoQuarto.LIVRE,
        },
      })
    );
  }

  for (let i = 1; i <= 3; i++) {
    quartos.push(
      await prisma.quarto.upsert({
        where: { numero: `201${i}` },
        update: {},
        create: {
          numero: `201${i}`,
          tipoQuartoId: tipoSuite.id,
          estado: EstadoQuarto.LIVRE,
        },
      })
    );
  }

  for (let i = 1; i <= 2; i++) {
    quartos.push(
      await prisma.quarto.upsert({
        where: { numero: `301${i}` },
        update: {},
        create: {
          numero: `301${i}`,
          tipoQuartoId: tipoFamiliar.id,
          estado: EstadoQuarto.LIVRE,
        },
      })
    );
  }

  for (let i = 1; i <= 4; i++) {
    quartos.push(
      await prisma.quarto.upsert({
        where: { numero: `401${i}` },
        update: {},
        create: {
          numero: `401${i}`,
          tipoQuartoId: tipoSolteiro.id,
          estado: EstadoQuarto.LIVRE,
        },
      })
    );
  }

  console.log('Quartos criados');

  await prisma.hospede.upsert({
    where: {
      tipoDocumento_numeroDocumento: {
        tipoDocumento: TipoDocumento.CARTAO_CIDADAO,
        numeroDocumento: '12345678',
      },
    },
    update: {},
    create: {
      nome: 'João Silva',
      tipoDocumento: TipoDocumento.CARTAO_CIDADAO,
      numeroDocumento: '12345678',
      nif: '123456789',
    },
  });

  await prisma.hospede.upsert({
    where: {
      tipoDocumento_numeroDocumento: {
        tipoDocumento: TipoDocumento.PASSAPORTE,
        numeroDocumento: 'AB123456',
      },
    },
    update: {},
    create: {
      nome: 'Maria Santos',
      tipoDocumento: TipoDocumento.PASSAPORTE,
      numeroDocumento: 'AB123456',
    },
  });

  console.log('Hospedes criados');
  console.log('Seed concluido');
  console.log('Gestor: gestor@hotel.com / password123');
  console.log('Rececionista: rececionista@hotel.com / password123');
  console.log('Cliente: cliente@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
