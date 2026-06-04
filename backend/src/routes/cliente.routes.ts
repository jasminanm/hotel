import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { verificarDisponibilidade, calcularTotalReserva, atribuirQuartos, podeEditarCancelar } from '../utils/reserva.util';
import { createLog, getClientInfo } from '../utils/logger.util';
import {
  garantirHospedeDoCliente,
  criarNotificacao,
} from '../utils/relacao.util';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/tipos-quarto', async (req, res) => {
  try {
    const tiposQuarto = await prisma.tipoQuarto.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        valorBaseDiaria: true,
        capacidadeBase: true,
        suplementoHospedeExtra: true,
        custoPequenoAlmoco: true,
      },
    });

    res.json(tiposQuarto);
  } catch (error: any) {
    console.error('Erro ao buscar tipos de quarto:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de quarto' });
  }
});

router.post('/verificar-disponibilidade', [
  body('tipoQuartoId').notEmpty().withMessage('Tipo de quarto é obrigatório'),
  body('dataInicio').isISO8601().withMessage('Data de início inválida'),
  body('dataFim').isISO8601().withMessage('Data de fim inválida'),
  body('quantidadeQuartos').isInt({ min: 1 }).withMessage('Quantidade de quartos inválida'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tipoQuartoId, dataInicio, dataFim, quantidadeQuartos } = req.body;

    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);

    // Validações
    if (dataInicioDate >= dataFimDate) {
      return res.status(400).json({ error: 'Data de início deve ser anterior à data de fim' });
    }

    if (dataInicioDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ error: 'Não é possível criar reservas com datas no passado' });
    }

    const disponibilidade = await verificarDisponibilidade({
      tipoQuartoId,
      dataInicio: dataInicioDate,
      dataFim: dataFimDate,
      quantidadeQuartos,
    });

    const tipoQuarto = await prisma.tipoQuarto.findUnique({
      where: { id: tipoQuartoId },
    });

    if (!tipoQuarto) {
      return res.status(404).json({ error: 'Tipo de quarto não encontrado' });
    }

    const precoEstimado = calcularTotalReserva(
      tipoQuarto,
      dataInicioDate,
      dataFimDate,
      quantidadeQuartos,
      tipoQuarto.capacidadeBase,
      false
    );

    res.json({
      ...disponibilidade,
      precoEstimado,
      tipoQuarto: {
        nome: tipoQuarto.nome,
        descricao: tipoQuarto.descricao,
        capacidadeBase: tipoQuarto.capacidadeBase,
      },
    });
  } catch (error: any) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
  }
});

router.post('/reservas', [
  body('tipoQuartoId').notEmpty().withMessage('Tipo de quarto é obrigatório'),
  body('dataInicio').isISO8601().withMessage('Data de início inválida'),
  body('dataFim').isISO8601().withMessage('Data de fim inválida'),
  body('quantidadeQuartos').isInt({ min: 1 }).withMessage('Quantidade de quartos inválida'),
  body('hospedesPorQuarto').isInt({ min: 1 }).withMessage('Hóspedes por quarto inválido'),
  body('hospedes').isArray().withMessage('Lista de hóspedes é obrigatória'),
  body('incluirPequenoAlmoco').isBoolean().withMessage('Incluir pequeno-almoço deve ser boolean'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      tipoQuartoId,
      dataInicio,
      dataFim,
      quantidadeQuartos,
      hospedesPorQuarto,
      hospedes,
      incluirPequenoAlmoco,
      nif,
    } = req.body;

    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);

    // Validações
    if (dataInicioDate >= dataFimDate) {
      return res.status(400).json({ error: 'Data de início deve ser anterior à data de fim' });
    }

    if (dataInicioDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ error: 'Não é possível criar reservas com datas no passado' });
    }

    // Buscar tipo de quarto
    const tipoQuarto = await prisma.tipoQuarto.findUnique({
      where: { id: tipoQuartoId },
    });

    if (!tipoQuarto || !tipoQuarto.ativo) {
      return res.status(404).json({ error: 'Tipo de quarto não encontrado ou inativo' });
    }

    if (hospedesPorQuarto < 1) {
      return res.status(400).json({ error: 'Número de hóspedes por quarto deve ser pelo menos 1' });
    }

    const disponibilidade = await verificarDisponibilidade({
      tipoQuartoId,
      dataInicio: dataInicioDate,
      dataFim: dataFimDate,
      quantidadeQuartos,
    });

    if (!disponibilidade.disponivel) {
      return res.status(400).json({
        error: disponibilidade.mensagem || 'Não há quartos disponíveis para o período selecionado',
      });
    }

    const totalCalculado = calcularTotalReserva(
      tipoQuarto,
      dataInicioDate,
      dataFimDate,
      quantidadeQuartos,
      hospedesPorQuarto,
      incluirPequenoAlmoco
    );

    const quartosIds = await atribuirQuartos(
      tipoQuartoId,
      dataInicioDate,
      dataFimDate,
      quantidadeQuartos
    );

    const utilizador = await prisma.utilizador.findUnique({
      where: { id: req.userId! },
    });

    if (!utilizador) {
      return res.status(401).json({ error: 'Utilizador não encontrado' });
    }

    const hospedeConta = await garantirHospedeDoCliente(
      utilizador.id,
      utilizador.nome,
      utilizador.email
    );

    const hospedesIds: string[] = [hospedeConta.id];
    for (const hospedeData of hospedes) {
      let hospede = await prisma.hospede.findUnique({
        where: {
          tipoDocumento_numeroDocumento: {
            tipoDocumento: hospedeData.tipoDocumento,
            numeroDocumento: hospedeData.numeroDocumento,
          },
        },
      });

      if (!hospede) {
        hospede = await prisma.hospede.create({
          data: {
            nome: hospedeData.nome,
            tipoDocumento: hospedeData.tipoDocumento,
            numeroDocumento: hospedeData.numeroDocumento,
            nif: hospedeData.nif || null,
          },
        });
      }

      if (!hospedesIds.includes(hospede.id)) {
        hospedesIds.push(hospede.id);
      }
    }

    const reserva = await prisma.reserva.create({
      data: {
        utilizadorId: req.userId!,
        tipoQuartoId,
        dataInicio: dataInicioDate,
        dataFim: dataFimDate,
        quantidadeQuartos,
        hospedesPorQuarto,
        incluirPequenoAlmoco,
        totalCalculado,
        quartos: {
          create: quartosIds.map((quartoId) => ({
            quartoId,
          })),
        },
        hospedes: {
          create: hospedesIds.map((hospedeId) => ({
            hospedeId,
          })),
        },
      },
      include: {
        tipoQuarto: true,
        quartos: {
          include: {
            quarto: true,
          },
        },
        hospedes: {
          include: {
            hospede: true,
          },
        },
      },
    });

    await prisma.quarto.updateMany({
      where: {
        id: { in: quartosIds },
      },
      data: {
        estado: 'OCUPADO',
      },
    });

    await createLog({
      acao: 'CRIAR_RESERVA',
      entidade: 'Reserva',
      entidadeId: reserva.id,
      utilizadorId: req.userId!,
      detalhes: `Reserva criada: ${quantidadeQuartos} quarto(s) de ${tipoQuarto.nome}`,
      ...getClientInfo(req),
    });

    const quartoId = reserva.quartos[0]?.quartoId;
    await criarNotificacao({
      utilizadorId: req.userId!,
      reservaId: reserva.id,
      quartoId,
      mensagem: `Reserva confirmada para ${tipoQuarto.nome}.`,
    });

    res.status(201).json(reserva);
  } catch (error: any) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ error: 'Erro ao criar reserva', details: error.message });
  }
});

// Listar reservas do cliente
router.get('/reservas', async (req: AuthRequest, res) => {
  try {
    const { estado, dataInicio, dataFim } = req.query;

    const where: any = {
      utilizadorId: req.userId!,
    };

    if (estado) {
      where.estado = estado;
    }

    if (dataInicio || dataFim) {
      where.dataInicio = {};
      if (dataInicio) where.dataInicio.gte = new Date(dataInicio as string);
      if (dataFim) where.dataInicio.lte = new Date(dataFim as string);
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        tipoQuarto: {
          select: {
            nome: true,
            descricao: true,
          },
        },
        quartos: {
          include: {
            quarto: {
              select: {
                numero: true,
              },
            },
          },
        },
        hospedes: {
          include: {
            hospede: true,
          },
        },
        pagamentos: true,
      },
      orderBy: {
        dataInicio: 'desc',
      },
    });

    res.json(reservas);
  } catch (error: any) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
});

router.get('/reservas/:id', async (req: AuthRequest, res) => {
  try {
    const reserva = await prisma.reserva.findFirst({
      where: {
        id: req.params.id,
        utilizadorId: req.userId!,
      },
      include: {
        tipoQuarto: true,
        quartos: {
          include: {
            quarto: true,
          },
        },
        hospedes: {
          include: {
            hospede: true,
          },
        },
        pagamentos: true,
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    res.json(reserva);
  } catch (error: any) {
    console.error('Erro ao buscar reserva:', error);
    res.status(500).json({ error: 'Erro ao buscar reserva' });
  }
});

router.post('/reservas/:id/cancelar', async (req: AuthRequest, res) => {
  try {
    const reserva = await prisma.reserva.findFirst({
      where: {
        id: req.params.id,
        utilizadorId: req.userId!,
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    if (reserva.estado === 'CANCELADA') {
      return res.status(400).json({ error: 'Reserva já está cancelada' });
    }

    // Validar regra das 24 horas
    if (!podeEditarCancelar(reserva.dataInicio)) {
      return res.status(400).json({
        error: 'Não é possível cancelar reservas com menos de 24 horas antes do check-in',
      });
    }

    // Atualizar reserva
    const reservaAtualizada = await prisma.reserva.update({
      where: { id: reserva.id },
      data: { estado: 'CANCELADA' },
    });

    const quartosIds = await prisma.reservaQuarto.findMany({
      where: { reservaId: reserva.id },
      select: { quartoId: true },
    });

    await prisma.quarto.updateMany({
      where: {
        id: { in: quartosIds.map((q) => q.quartoId) },
      },
      data: {
        estado: 'LIVRE',
      },
    });

    await createLog({
      acao: 'CANCELAR_RESERVA',
      entidade: 'Reserva',
      entidadeId: reserva.id,
      utilizadorId: req.userId!,
      detalhes: 'Reserva cancelada pelo cliente',
      ...getClientInfo(req),
    });

    await criarNotificacao({
      utilizadorId: req.userId!,
      reservaId: reserva.id,
      mensagem: 'A sua reserva foi cancelada.',
    });

    res.json({ message: 'Reserva cancelada com sucesso', reserva: reservaAtualizada });
  } catch (error: any) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
});

router.put('/reservas/:id', [
  body('tipoQuartoId').optional().notEmpty().withMessage('Tipo de quarto é obrigatório'),
  body('dataInicio').optional().isISO8601().withMessage('Data de início inválida'),
  body('dataFim').optional().isISO8601().withMessage('Data de fim inválida'),
  body('quantidadeQuartos').optional().isInt({ min: 1 }).withMessage('Quantidade de quartos inválida'),
  body('hospedesPorQuarto').optional().isInt({ min: 1 }).withMessage('Hóspedes por quarto inválido'),
  body('incluirPequenoAlmoco').optional().isBoolean().withMessage('Incluir pequeno-almoço deve ser boolean'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reserva = await prisma.reserva.findFirst({
      where: {
        id: req.params.id,
        utilizadorId: req.userId!,
      },
      include: {
        tipoQuarto: true,
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    if (reserva.estado === 'CANCELADA') {
      return res.status(400).json({ error: 'Não é possível editar reservas canceladas' });
    }

    // Validar regra das 24 horas
    if (!podeEditarCancelar(reserva.dataInicio)) {
      return res.status(400).json({
        error: 'Não é possível editar reservas com menos de 24 horas antes do check-in',
      });
    }

    const {
      tipoQuartoId = reserva.tipoQuartoId,
      dataInicio = reserva.dataInicio,
      dataFim = reserva.dataFim,
      quantidadeQuartos = reserva.quantidadeQuartos,
      hospedesPorQuarto = reserva.hospedesPorQuarto,
      incluirPequenoAlmoco = reserva.incluirPequenoAlmoco,
    } = req.body;

    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);

    // Validações
    if (dataInicioDate >= dataFimDate) {
      return res.status(400).json({ error: 'Data de início deve ser anterior à data de fim' });
    }

    // Buscar tipo de quarto
    const tipoQuarto = await prisma.tipoQuarto.findUnique({
      where: { id: tipoQuartoId },
    });

    if (!tipoQuarto || !tipoQuarto.ativo) {
      return res.status(404).json({ error: 'Tipo de quarto não encontrado ou inativo' });
    }

    // Verificar disponibilidade se mudou algo relevante
    if (
      tipoQuartoId !== reserva.tipoQuartoId ||
      dataInicioDate.getTime() !== reserva.dataInicio.getTime() ||
      dataFimDate.getTime() !== reserva.dataFim.getTime() ||
      quantidadeQuartos !== reserva.quantidadeQuartos
    ) {
      const disponibilidade = await verificarDisponibilidade({
        tipoQuartoId,
        dataInicio: dataInicioDate,
        dataFim: dataFimDate,
        quantidadeQuartos,
      });

      if (!disponibilidade.disponivel) {
        return res.status(400).json({
          error: disponibilidade.mensagem || 'Não há quartos disponíveis para o período selecionado',
        });
      }
    }

    const totalCalculado = calcularTotalReserva(
      tipoQuarto,
      dataInicioDate,
      dataFimDate,
      quantidadeQuartos,
      hospedesPorQuarto,
      incluirPequenoAlmoco
    );

    // Atualizar reserva
    const reservaAtualizada = await prisma.reserva.update({
      where: { id: reserva.id },
      data: {
        tipoQuartoId,
        dataInicio: dataInicioDate,
        dataFim: dataFimDate,
        quantidadeQuartos,
        hospedesPorQuarto,
        incluirPequenoAlmoco,
        totalCalculado,
      },
      include: {
        tipoQuarto: true,
        quartos: {
          include: {
            quarto: true,
          },
        },
        hospedes: {
          include: {
            hospede: true,
          },
        },
      },
    });

    await createLog({
      acao: 'EDITAR_RESERVA',
      entidade: 'Reserva',
      entidadeId: reserva.id,
      utilizadorId: req.userId!,
      detalhes: 'Reserva editada pelo cliente',
      ...getClientInfo(req),
    });

    res.json(reservaAtualizada);
  } catch (error: any) {
    console.error('Erro ao editar reserva:', error);
    res.status(500).json({ error: 'Erro ao editar reserva', details: error.message });
  }
});

router.get('/notificacoes', async (req: AuthRequest, res) => {
  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: { utilizadorId: req.userId! },
      include: {
        reserva: {
          select: {
            id: true,
            dataInicio: true,
            dataFim: true,
          },
        },
        quarto: {
          select: {
            numero: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notificacoes);
  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

router.patch('/notificacoes/:id/lida', async (req: AuthRequest, res) => {
  try {
    const notificacao = await prisma.notificacao.findFirst({
      where: {
        id: req.params.id,
        utilizadorId: req.userId!,
      },
    });

    if (!notificacao) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    const atualizada = await prisma.notificacao.update({
      where: { id: notificacao.id },
      data: { lida: true },
    });

    res.json(atualizada);
  } catch (error: any) {
    console.error('Erro ao marcar notificação:', error);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
});

export default router;
