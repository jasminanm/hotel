import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireAdmin);

router.get('/ocupacao-diaria', async (req, res) => {
  try {
    const { data } = req.query;
    const dataConsulta = data ? new Date(data as string) : new Date();

    const reservas = await prisma.reserva.findMany({
      where: {
        estado: 'ATIVA',
        dataInicio: { lte: dataConsulta },
        dataFim: { gte: dataConsulta },
        checkInEfetuado: true,
      },
      include: {
        quartos: {
          include: {
            quarto: {
              include: {
                tipoQuarto: true,
              },
            },
          },
        },
      },
    });

    const quartosOcupados = reservas.reduce((acc, r) => acc + r.quartos.length, 0);

    // Total de quartos
    const totalQuartos = await prisma.quarto.count({
      where: {
        estado: { not: 'MANUTENCAO' },
      },
    });

    const percentagemOcupacao = totalQuartos > 0 ? (quartosOcupados / totalQuartos) * 100 : 0;

    res.json({
      data: dataConsulta.toISOString().split('T')[0],
      quartosOcupados,
      totalQuartos,
      percentagemOcupacao: Math.round(percentagemOcupacao * 100) / 100,
      reservas: reservas.map((r) => ({
        id: r.id,
        quartos: r.quartos.map((rq) => ({
          numero: rq.quarto.numero,
          tipo: rq.quarto.tipoQuarto.nome,
        })),
      })),
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório de ocupação diária:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

router.get('/ocupacao-mensal', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesConsulta = mes ? parseInt(mes as string) : new Date().getMonth() + 1;
    const anoConsulta = ano ? parseInt(ano as string) : new Date().getFullYear();

    const dataInicio = new Date(anoConsulta, mesConsulta - 1, 1);
    const dataFim = new Date(anoConsulta, mesConsulta, 0);

    const reservas = await prisma.reserva.findMany({
      where: {
        OR: [
          {
            dataInicio: { lte: dataFim },
            dataFim: { gte: dataInicio },
          },
        ],
      },
      include: {
        quartos: true,
      },
    });

    const ocupacaoPorDia: { [key: string]: number } = {};

    for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
      const dataStr = d.toISOString().split('T')[0];
      const ocupados = reservas.filter((r) => {
        const inicio = new Date(r.dataInicio);
        const fim = new Date(r.dataFim);
        return inicio <= d && fim >= d && r.estado === 'ATIVA' && r.checkInEfetuado;
      }).reduce((acc, r) => acc + r.quartos.length, 0);

      ocupacaoPorDia[dataStr] = ocupados;
    }

    const totalQuartos = await prisma.quarto.count({
      where: {
        estado: { not: 'MANUTENCAO' },
      },
    });

    const mediaOcupacao = Object.values(ocupacaoPorDia).reduce((a, b) => a + b, 0) / Object.keys(ocupacaoPorDia).length;
    const percentagemMedia = totalQuartos > 0 ? (mediaOcupacao / totalQuartos) * 100 : 0;

    res.json({
      mes: mesConsulta,
      ano: anoConsulta,
      ocupacaoPorDia,
      totalQuartos,
      mediaOcupacao: Math.round(mediaOcupacao * 100) / 100,
      percentagemMedia: Math.round(percentagemMedia * 100) / 100,
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório de ocupação mensal:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

router.get('/reservas-periodo', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'Data de início e data de fim são obrigatórias' });
    }

    const inicio = new Date(dataInicio as string);
    const fim = new Date(dataFim as string);

    const reservas = await prisma.reserva.findMany({
      where: {
        OR: [
          {
            dataInicio: { lte: fim },
            dataFim: { gte: inicio },
          },
        ],
      },
      include: {
        tipoQuarto: true,
        utilizador: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        dataInicio: 'asc',
      },
    });

    const ativas = reservas.filter((r) => r.estado === 'ATIVA');
    const canceladas = reservas.filter((r) => r.estado === 'CANCELADA');
    const concluidas = reservas.filter((r) => r.estado === 'CONCLUIDA');

    res.json({
      periodo: {
        dataInicio: inicio.toISOString().split('T')[0],
        dataFim: fim.toISOString().split('T')[0],
      },
      total: reservas.length,
      ativas: ativas.length,
      canceladas: canceladas.length,
      concluidas: concluidas.length,
      reservas: reservas.map((r) => ({
        id: r.id,
        dataInicio: r.dataInicio,
        dataFim: r.dataFim,
        estado: r.estado,
        totalCalculado: r.totalCalculado,
        tipoQuarto: r.tipoQuarto.nome,
        cliente: r.utilizador.nome,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório de reservas:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

router.get('/receita-periodo', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'Data de início e data de fim são obrigatórias' });
    }

    const inicio = new Date(dataInicio as string);
    const fim = new Date(dataFim as string);

    const pagamentos = await prisma.pagamento.findMany({
      where: {
        data: {
          gte: inicio,
          lte: fim,
        },
      },
      include: {
        reserva: {
          include: {
            tipoQuarto: true,
          },
        },
      },
    });

    const totalReceita = pagamentos.reduce((sum, p) => sum + p.montante, 0);

    // Agrupar por tipo de quarto
    const receitaPorTipo: { [key: string]: number } = {};
    pagamentos.forEach((p) => {
      const tipo = p.reserva.tipoQuarto.nome;
      receitaPorTipo[tipo] = (receitaPorTipo[tipo] || 0) + p.montante;
    });

    res.json({
      periodo: {
        dataInicio: inicio.toISOString().split('T')[0],
        dataFim: fim.toISOString().split('T')[0],
      },
      totalReceita: Math.round(totalReceita * 100) / 100,
      receitaPorTipo,
      totalPagamentos: pagamentos.length,
      pagamentos: pagamentos.map((p) => ({
        id: p.id,
        montante: p.montante,
        data: p.data,
        tipo: p.tipo,
        tipoQuarto: p.reserva.tipoQuarto.nome,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatório de receita:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

router.get('/historico-hospedes', async (req, res) => {
  try {
    const { hospedeId } = req.query;

    const where: any = {};
    if (hospedeId) {
      where.hospedes = {
        some: {
          hospedeId: hospedeId as string,
        },
      };
    }

    const reservas = await prisma.reserva.findMany({
      where: {
        ...where,
        estado: 'CONCLUIDA',
      },
      include: {
        hospedes: {
          include: {
            hospede: true,
          },
        },
        tipoQuarto: true,
        quartos: {
          include: {
            quarto: true,
          },
        },
      },
      orderBy: {
        dataFim: 'desc',
      },
    });

    // Agrupar por hóspede
    const historicoPorHospede: { [key: string]: any } = {};

    reservas.forEach((reserva) => {
      reserva.hospedes.forEach((rh) => {
        const hospedeId = rh.hospede.id;
        if (!historicoPorHospede[hospedeId]) {
          historicoPorHospede[hospedeId] = {
            hospede: {
              id: rh.hospede.id,
              nome: rh.hospede.nome,
              tipoDocumento: rh.hospede.tipoDocumento,
              numeroDocumento: rh.hospede.numeroDocumento,
            },
            reservas: [],
            totalReservas: 0,
            totalGasto: 0,
          };
        }

        historicoPorHospede[hospedeId].reservas.push({
          id: reserva.id,
          dataInicio: reserva.dataInicio,
          dataFim: reserva.dataFim,
          tipoQuarto: reserva.tipoQuarto.nome,
          total: reserva.totalCalculado,
        });

        historicoPorHospede[hospedeId].totalReservas += 1;
        historicoPorHospede[hospedeId].totalGasto += reserva.totalCalculado;
      });
    });

    res.json({
      historico: Object.values(historicoPorHospede),
    });
  } catch (error: any) {
    console.error('Erro ao gerar histórico de hóspedes:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

router.get('/logs-auditoria', async (req, res) => {
  try {
    const { acao, entidade, dataInicio, dataFim, limit } = req.query;

    const where: any = {};

    if (acao) where.acao = acao;
    if (entidade) where.entidade = entidade;
    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt.gte = new Date(dataInicio as string);
      if (dataFim) where.createdAt.lte = new Date(dataFim as string);
    }

    const logs = await prisma.logAuditoria.findMany({
      where,
      include: {
        utilizador: {
          select: {
            nome: true,
            email: true,
            tipo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit as string) : 100,
    });

    res.json({
      total: logs.length,
      logs,
    });
  } catch (error: any) {
    console.error('Erro ao buscar logs de auditoria:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

export default router;
