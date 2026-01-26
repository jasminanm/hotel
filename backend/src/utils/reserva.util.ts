import { PrismaClient, TipoQuarto } from '@prisma/client';

const prisma = new PrismaClient();

export interface DisponibilidadeParams {
  tipoQuartoId: string;
  dataInicio: Date;
  dataFim: Date;
  quantidadeQuartos: number;
}

/**
 * Calcula o total de uma reserva
 */
export const calcularTotalReserva = (
  tipoQuarto: TipoQuarto,
  dataInicio: Date,
  dataFim: Date,
  quantidadeQuartos: number,
  hospedesPorQuarto: number,
  incluirPequenoAlmoco: boolean
): number => {
  // Calcular número de noites
  const diffTime = dataFim.getTime() - dataInicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const numeroNoites = diffDays;

  // Valor base por quarto por noite
  let valorPorQuartoPorNoite = tipoQuarto.valorBaseDiaria;

  // Adicionar suplemento por hóspede extra (se houver)
  if (hospedesPorQuarto > tipoQuarto.capacidadeBase && tipoQuarto.suplementoHospedeExtra) {
    const hospedesExtras = hospedesPorQuarto - tipoQuarto.capacidadeBase;
    valorPorQuartoPorNoite += hospedesExtras * tipoQuarto.suplementoHospedeExtra;
  }

  // Adicionar custo do pequeno-almoço se selecionado
  if (incluirPequenoAlmoco) {
    valorPorQuartoPorNoite += hospedesPorQuarto * tipoQuarto.custoPequenoAlmoco;
  }

  // Total = (valor por quarto por noite) × número de noites × quantidade de quartos
  const total = valorPorQuartoPorNoite * numeroNoites * quantidadeQuartos;

  return Math.round(total * 100) / 100; // Arredondar para 2 casas decimais
};

/**
 * Verifica disponibilidade de quartos para um período
 */
export const verificarDisponibilidade = async (
  params: DisponibilidadeParams
): Promise<{ disponivel: boolean; quartosDisponiveis: number; mensagem?: string }> => {
  const { tipoQuartoId, dataInicio, dataFim, quantidadeQuartos } = params;

  // Buscar todos os quartos do tipo solicitado que estão livres
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

  // Verificar reservas ativas que se sobrepõem ao período solicitado
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

  // Contar quantos quartos estão ocupados no período
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

/**
 * Atribui quartos disponíveis a uma reserva
 */
export const atribuirQuartos = async (
  tipoQuartoId: string,
  dataInicio: Date,
  dataFim: Date,
  quantidadeQuartos: number
): Promise<string[]> => {
  // Buscar quartos livres do tipo
  const quartosLivres = await prisma.quarto.findMany({
    where: {
      tipoQuartoId,
      estado: 'LIVRE',
    },
  });

  // Verificar reservas sobrepostas
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

  // Selecionar quartos disponíveis
  const quartosDisponiveis = quartosLivres
    .filter((q) => !quartosOcupados.has(q.id))
    .slice(0, quantidadeQuartos);

  if (quartosDisponiveis.length < quantidadeQuartos) {
    throw new Error('Não há quartos suficientes disponíveis');
  }

  return quartosDisponiveis.map((q) => q.id);
};

/**
 * Valida se pode editar/cancelar reserva (regra das 24 horas)
 */
export const podeEditarCancelar = (dataInicio: Date): boolean => {
  const agora = new Date();
  const diferencaHoras = (dataInicio.getTime() - agora.getTime()) / (1000 * 60 * 60);
  return diferencaHoras > 24;
};
