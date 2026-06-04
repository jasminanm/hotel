import { PrismaClient, TipoUtilizador } from '@prisma/client';

const prisma = new PrismaClient();

export async function garantirHospedeDoCliente(
  utilizadorId: string,
  nome: string,
  email: string
) {
  const existente = await prisma.hospede.findUnique({
    where: { utilizadorId },
  });

  if (existente) {
    return existente;
  }

  return prisma.hospede.create({
    data: {
      utilizadorId,
      nome,
      tipoDocumento: 'OUTRO',
      numeroDocumento: email,
    },
  });
}

export async function associarStaffReserva(
  reservaId: string,
  utilizadorId: string,
  tipo: TipoUtilizador
) {
  if (tipo !== 'RECECIONISTA' && tipo !== 'GESTOR') {
    return;
  }

  await prisma.reservaRececionista.upsert({
    where: {
      reservaId_utilizadorId: {
        reservaId,
        utilizadorId,
      },
    },
    create: {
      reservaId,
      utilizadorId,
    },
    update: {},
  });
}

export async function associarStaffPagamento(
  pagamentoId: string,
  utilizadorId: string,
  tipo: TipoUtilizador,
  outroOperadorId?: string
) {
  if (tipo !== 'RECECIONISTA' && tipo !== 'GESTOR') {
    return;
  }

  const ids = new Set<string>([utilizadorId]);
  if (outroOperadorId) {
    ids.add(outroOperadorId);
  }

  for (const id of ids) {
    await prisma.pagamentoRececionista.upsert({
      where: {
        pagamentoId_utilizadorId: {
          pagamentoId,
          utilizadorId: id,
        },
      },
      create: {
        pagamentoId,
        utilizadorId: id,
      },
      update: {},
    });
  }
}

export async function criarNotificacao(params: {
  utilizadorId: string;
  mensagem: string;
  reservaId?: string;
  quartoId?: string;
}) {
  await prisma.notificacao.create({
    data: {
      utilizadorId: params.utilizadorId,
      mensagem: params.mensagem,
      reservaId: params.reservaId,
      quartoId: params.quartoId,
    },
  });
}
