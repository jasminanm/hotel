import { PrismaClient, TipoQuarto } from '@prisma/client';

const prisma = new PrismaClient();

export interface DisponibilidadeParams {
  tipoQuartoId: string;
  dataInicio: Date;
  dataFim: Date;
  quantidadeQuartos: number;
}

export const calcularTotalReserva = (
  tipoQuarto: TipoQuarto,
  dataInicio: Date,
  dataFim: Date,
  quantidadeQuartos: number,
  hospedesPorQuarto: number,
  incluirPequenoAlmoco: boolean
): number => {
  const diffTime = dataFim.getTime() - dataInicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const numeroNoites = diffDays;

  let valorPorQuartoPorNoite = tipoQuarto.valorBaseDiaria;

  if (hospedesPorQuarto > tipoQuarto.capacidadeBase && tipoQuarto.suplementoHospedeExtra) {
    const hospedesExtras = hospedesPorQuarto - tipoQuarto.capacidadeBase;
    valorPorQuartoPorNoite += hospedesExtras * tipoQuarto.suplementoHospedeExtra;
  }

  if (incluirPequenoAlmoco) {
    valorPorQuartoPorNoite += hospedesPorQuarto * tipoQuarto.custoPequenoAlmoco;
  }

  const total = valorPorQuartoPorNoite * numeroNoites * quantidadeQuartos;

  return Math.round(total * 100) / 100;
};

export const verificarDisponibilidade = async (
  params: DisponibilidadeParams
): Promise<{ disponivel: boolean; quartosDisponiveis: number; mensagem?: string }> => {
  const { tipoQuartoId, dataInicio, dataFim, quantidadeQuartos } = params;

  const quartosLivres = await prisma.quarto.findMany({
    where: {
      tipoQuartoId,
      estado: 'LIVRE',
    },
  });

  if (quartosLivres.length < quantidadeQuartos) {
    return {
      disponivel: false,
      quartosDisponiveis: quartosLivres.length,
      mensagem: `Apenas ${quartosLivres.length} quarto(s) disponível(eis) deste tipo.`,
    };
  }

  const reservasSobrepostas = await prisma.reserva.findMany({
    where: {
      tipoQuartoId,
      estado: 'ATIVA',
      OR: [
        {
          AND: [
            { dataInicio: { lte: dataFim } },
            { dataFim: { gte: dataInicio } },
          ],
        },
      ],
    },
    include: {
      quartos: true,
    },
  });

  const quartosOcupados = new Set<string>();
  reservasSobrepostas.forEach((reserva) => {
    reserva.quartos.forEach((rq) => {
      quartosOcupados.add(rq.quartoId);
    });
  });

  const quartosDisponiveisNoPeriodo = quartosLivres.filter(
    (q) => !quartosOcupados.has(q.id)
  ).length;

  if (quartosDisponiveisNoPeriodo < quantidadeQuartos) {
    return {
      disponivel: false,
      quartosDisponiveis: quartosDisponiveisNoPeriodo,
      mensagem: `Apenas ${quartosDisponiveisNoPeriodo} quarto(s) disponível(eis) para o período selecionado.`,
    };
  }

  return {
    disponivel: true,
    quartosDisponiveis: quartosDisponiveisNoPeriodo,
  };
};

export const atribuirQuartos = async (
  tipoQuartoId: string,
  dataInicio: Date,
  dataFim: Date,
  quantidadeQuartos: number
): Promise<string[]> => {
  const quartosLivres = await prisma.quarto.findMany({
    where: {
      tipoQuartoId,
      estado: 'LIVRE',
    },
  });

  const reservasSobrepostas = await prisma.reserva.findMany({
    where: {
      tipoQuartoId,
      estado: 'ATIVA',
      OR: [
        {
          AND: [
            { dataInicio: { lte: dataFim } },
            { dataFim: { gte: dataInicio } },
          ],
        },
      ],
    },
    include: {
      quartos: true,
    },
  });

  const quartosOcupados = new Set<string>();
  reservasSobrepostas.forEach((reserva) => {
    reserva.quartos.forEach((rq) => {
      quartosOcupados.add(rq.quartoId);
    });
  });

  const quartosDisponiveis = quartosLivres
    .filter((q) => !quartosOcupados.has(q.id))
    .slice(0, quantidadeQuartos);

  if (quartosDisponiveis.length < quantidadeQuartos) {
    throw new Error('Não há quartos suficientes disponíveis');
  }

  return quartosDisponiveis.map((q) => q.id);
};

export const podeEditarCancelar = (dataInicio: Date): boolean => {
  const agora = new Date();
  const diferencaHoras = (dataInicio.getTime() - agora.getTime()) / (1000 * 60 * 60);
  return diferencaHoras > 24;
};
