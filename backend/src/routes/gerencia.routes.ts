import express from 'express';
import { PrismaClient, TipoUtilizador } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin, requireGestor } from '../middleware/auth.middleware';
import { createLog, getClientInfo } from '../utils/logger.util';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireAdmin);

router.get('/tipos-quarto', async (req, res) => {
  try {
    const tiposQuarto = await prisma.tipoQuarto.findMany({
      include: {
        _count: {
          select: { quartos: true },
        },
      },
      orderBy: { nome: 'asc' },
    });
    res.json(tiposQuarto);
  } catch (error: any) {
    console.error('Erro ao buscar tipos de quarto:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de quarto' });
  }
});

router.post('/tipos-quarto', requireGestor, [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('valorBaseDiaria').isFloat({ min: 0 }).withMessage('Valor base inválido'),
  body('capacidadeBase').isInt({ min: 1 }).withMessage('Capacidade base inválida'),
  body('custoPequenoAlmoco').isFloat({ min: 0 }).withMessage('Custo do pequeno-almoço inválido'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tipoQuarto = await prisma.tipoQuarto.create({
      data: req.body,
    });

    await createLog({
      acao: 'CRIAR_TIPO_QUARTO',
      entidade: 'TipoQuarto',
      entidadeId: tipoQuarto.id,
      utilizadorId: req.userId!,
      detalhes: `Tipo de quarto criado: ${tipoQuarto.nome}`,
      ...getClientInfo(req),
    });

    res.status(201).json(tipoQuarto);
  } catch (error: any) {
    console.error('Erro ao criar tipo de quarto:', error);
    res.status(500).json({ error: 'Erro ao criar tipo de quarto' });
  }
});

router.put('/tipos-quarto/:id', requireGestor, async (req: AuthRequest, res) => {
  try {
    const tipoQuarto = await prisma.tipoQuarto.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await createLog({
      acao: 'ATUALIZAR_TIPO_QUARTO',
      entidade: 'TipoQuarto',
      entidadeId: tipoQuarto.id,
      utilizadorId: req.userId!,
      detalhes: `Tipo de quarto atualizado: ${tipoQuarto.nome}`,
      ...getClientInfo(req),
    });

    res.json(tipoQuarto);
  } catch (error: any) {
    console.error('Erro ao atualizar tipo de quarto:', error);
    res.status(500).json({ error: 'Erro ao atualizar tipo de quarto' });
  }
});

router.get('/quartos', async (req, res) => {
  try {
    const { tipoQuartoId, estado } = req.query;
    const where: any = {};

    if (tipoQuartoId) where.tipoQuartoId = tipoQuartoId as string;
    if (estado) where.estado = estado;

    const quartos = await prisma.quarto.findMany({
      where,
      include: {
        tipoQuarto: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: { numero: 'asc' },
    });

    res.json(quartos);
  } catch (error: any) {
    console.error('Erro ao buscar quartos:', error);
    res.status(500).json({ error: 'Erro ao buscar quartos' });
  }
});

router.post('/quartos', [
  body('numero').notEmpty().withMessage('Número do quarto é obrigatório'),
  body('tipoQuartoId').notEmpty().withMessage('Tipo de quarto é obrigatório'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const quarto = await prisma.quarto.create({
      data: req.body,
      include: {
        tipoQuarto: true,
      },
    });

    await createLog({
      acao: 'CRIAR_QUARTO',
      entidade: 'Quarto',
      entidadeId: quarto.id,
      utilizadorId: req.userId!,
      detalhes: `Quarto criado: ${quarto.numero}`,
      ...getClientInfo(req),
    });

    res.status(201).json(quarto);
  } catch (error: any) {
    console.error('Erro ao criar quarto:', error);
    res.status(500).json({ error: 'Erro ao criar quarto' });
  }
});

router.put('/quartos/:id', async (req: AuthRequest, res) => {
  try {
    const quarto = await prisma.quarto.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        tipoQuarto: true,
      },
    });

    await createLog({
      acao: 'ATUALIZAR_QUARTO',
      entidade: 'Quarto',
      entidadeId: quarto.id,
      utilizadorId: req.userId!,
      detalhes: `Quarto atualizado: ${quarto.numero}`,
      ...getClientInfo(req),
    });

    res.json(quarto);
  } catch (error: any) {
    console.error('Erro ao atualizar quarto:', error);
    res.status(500).json({ error: 'Erro ao atualizar quarto' });
  }
});

router.get('/hospedes', async (req, res) => {
  try {
    const { ativo, search } = req.query;
    const where: any = {};

    if (ativo !== undefined) where.ativo = ativo === 'true';
    if (search) {
      where.OR = [
        { nome: { contains: search as string, mode: 'insensitive' } },
        { numeroDocumento: { contains: search as string } },
      ];
    }

    const hospedes = await prisma.hospede.findMany({
      where,
      orderBy: { nome: 'asc' },
    });

    res.json(hospedes);
  } catch (error: any) {
    console.error('Erro ao buscar hóspedes:', error);
    res.status(500).json({ error: 'Erro ao buscar hóspedes' });
  }
});

router.post('/hospedes', [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('tipoDocumento').notEmpty().withMessage('Tipo de documento é obrigatório'),
  body('numeroDocumento').notEmpty().withMessage('Número de documento é obrigatório'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hospede = await prisma.hospede.create({
      data: req.body,
    });

    await createLog({
      acao: 'CRIAR_HOSPEDE',
      entidade: 'Hospede',
      entidadeId: hospede.id,
      utilizadorId: req.userId!,
      detalhes: `Hóspede criado: ${hospede.nome}`,
      ...getClientInfo(req),
    });

    res.status(201).json(hospede);
  } catch (error: any) {
    console.error('Erro ao criar hóspede:', error);
    res.status(500).json({ error: 'Erro ao criar hóspede' });
  }
});

router.put('/hospedes/:id', async (req: AuthRequest, res) => {
  try {
    const hospede = await prisma.hospede.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await createLog({
      acao: 'ATUALIZAR_HOSPEDE',
      entidade: 'Hospede',
      entidadeId: hospede.id,
      utilizadorId: req.userId!,
      detalhes: `Hóspede atualizado: ${hospede.nome}`,
      ...getClientInfo(req),
    });

    res.json(hospede);
  } catch (error: any) {
    console.error('Erro ao atualizar hóspede:', error);
    res.status(500).json({ error: 'Erro ao atualizar hóspede' });
  }
});

router.get('/reservas', async (req, res) => {
  try {
    const { estado, dataInicio, dataFim, utilizadorId } = req.query;
    const where: any = {};

    if (estado) where.estado = estado;
    if (utilizadorId) where.utilizadorId = utilizadorId as string;
    if (dataInicio || dataFim) {
      where.dataInicio = {};
      if (dataInicio) where.dataInicio.gte = new Date(dataInicio as string);
      if (dataFim) where.dataInicio.lte = new Date(dataFim as string);
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        utilizador: {
          select: {
            nome: true,
            email: true,
          },
        },
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

router.get('/reservas/:id', async (req, res) => {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: req.params.id },
      include: {
        utilizador: true,
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
        pagamentos: {
          include: {
            utilizador: {
              select: {
                nome: true,
              },
            },
          },
        },
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
    const reserva = await prisma.reserva.findUnique({
      where: { id: req.params.id },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    const reservaAtualizada = await prisma.reserva.update({
      where: { id: reserva.id },
      data: { estado: 'CANCELADA' },
    });

    // Liberar quartos
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
      detalhes: 'Reserva cancelada pela gerência',
      ...getClientInfo(req),
    });

    res.json({ message: 'Reserva cancelada com sucesso', reserva: reservaAtualizada });
  } catch (error: any) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
});

router.post('/reservas/:id/checkin', async (req: AuthRequest, res) => {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: req.params.id },
      include: {
        quartos: true,
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    if (reserva.checkInEfetuado) {
      return res.status(400).json({ error: 'Check-in já foi efetuado' });
    }

    const reservaAtualizada = await prisma.reserva.update({
      where: { id: reserva.id },
      data: { checkInEfetuado: true },
    });

    // Garantir que os quartos estão ocupados
    await prisma.quarto.updateMany({
      where: {
        id: { in: reserva.quartos.map((q) => q.quartoId) },
      },
      data: {
        estado: 'OCUPADO',
      },
    });

    await createLog({
      acao: 'CHECK_IN',
      entidade: 'Reserva',
      entidadeId: reserva.id,
      utilizadorId: req.userId!,
      detalhes: 'Check-in efetuado',
      ...getClientInfo(req),
    });

    res.json({ message: 'Check-in efetuado com sucesso', reserva: reservaAtualizada });
  } catch (error: any) {
    console.error('Erro ao efetuar check-in:', error);
    res.status(500).json({ error: 'Erro ao efetuar check-in' });
  }
});

router.post('/reservas/:id/checkout', async (req: AuthRequest, res) => {
  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id: req.params.id },
      include: {
        quartos: true,
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    if (!reserva.checkInEfetuado) {
      return res.status(400).json({ error: 'Check-in deve ser efetuado antes do check-out' });
    }

    if (reserva.checkOutEfetuado) {
      return res.status(400).json({ error: 'Check-out já foi efetuado' });
    }

    const reservaAtualizada = await prisma.reserva.update({
      where: { id: reserva.id },
      data: {
        checkOutEfetuado: true,
        estado: 'CONCLUIDA',
      },
    });

    // Liberar quartos
    await prisma.quarto.updateMany({
      where: {
        id: { in: reserva.quartos.map((q) => q.quartoId) },
      },
      data: {
        estado: 'LIVRE',
      },
    });

    await createLog({
      acao: 'CHECK_OUT',
      entidade: 'Reserva',
      entidadeId: reserva.id,
      utilizadorId: req.userId!,
      detalhes: 'Check-out efetuado',
      ...getClientInfo(req),
    });

    res.json({ message: 'Check-out efetuado com sucesso', reserva: reservaAtualizada });
  } catch (error: any) {
    console.error('Erro ao efetuar check-out:', error);
    res.status(500).json({ error: 'Erro ao efetuar check-out' });
  }
});

router.get('/pagamentos', async (req, res) => {
  try {
    const { reservaId } = req.query;
    const where: any = {};

    if (reservaId) where.reservaId = reservaId as string;

    const pagamentos = await prisma.pagamento.findMany({
      where,
      include: {
        reserva: {
          include: {
            tipoQuarto: {
              select: {
                nome: true,
              },
            },
            utilizador: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        utilizador: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });

    res.json(pagamentos);
  } catch (error: any) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar pagamentos' });
  }
});

router.post('/pagamentos', [
  body('reservaId').notEmpty().withMessage('ID da reserva é obrigatório'),
  body('montante').isFloat({ min: 0.01 }).withMessage('Montante inválido'),
  body('tipo').isIn(['PARCIAL', 'TOTAL']).withMessage('Tipo de pagamento inválido'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reservaId, montante, tipo, observacoes } = req.body;

    // Verificar se a reserva existe
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        pagamentos: true,
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    // Calcular total já pago
    const totalPago = reserva.pagamentos.reduce((sum, p) => sum + p.montante, 0);
    const novoTotalPago = totalPago + montante;

    if (novoTotalPago > reserva.totalCalculado) {
      return res.status(400).json({
        error: `Montante excede o total da reserva. Total: ${reserva.totalCalculado}, Já pago: ${totalPago}`,
      });
    }

    const pagamento = await prisma.pagamento.create({
      data: {
        reservaId,
        utilizadorId: req.userId!,
        montante,
        tipo,
        observacoes,
      },
      include: {
        reserva: true,
        utilizador: {
          select: {
            nome: true,
          },
        },
      },
    });

    await createLog({
      acao: 'REGISTAR_PAGAMENTO',
      entidade: 'Pagamento',
      entidadeId: pagamento.id,
      utilizadorId: req.userId!,
      detalhes: `Pagamento registado: ${montante}€ (${tipo})`,
      ...getClientInfo(req),
    });

    res.status(201).json(pagamento);
  } catch (error: any) {
    console.error('Erro ao registar pagamento:', error);
    res.status(500).json({ error: 'Erro ao registar pagamento' });
  }
});

router.get('/pagamentos/:id/comprovativo', async (req: AuthRequest, res) => {
  try {
    const pagamento = await prisma.pagamento.findUnique({
      where: { id: req.params.id },
      include: {
        reserva: {
          include: {
            tipoQuarto: true,
            utilizador: {
              select: {
                nome: true,
                email: true,
              },
            },
            hospedes: {
              include: {
                hospede: true,
              },
            },
          },
        },
        utilizador: {
          select: {
            nome: true,
          },
        },
      },
    });

    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Calcular total já pago
    const todosPagamentos = await prisma.pagamento.findMany({
      where: { reservaId: pagamento.reservaId },
    });
    const totalPago = todosPagamentos.reduce((sum, p) => sum + p.montante, 0);
    const saldoPendente = pagamento.reserva.totalCalculado - totalPago;

    res.json({
      pagamento: {
        id: pagamento.id,
        montante: pagamento.montante,
        tipo: pagamento.tipo,
        data: pagamento.data,
        observacoes: pagamento.observacoes,
        operador: pagamento.utilizador.nome,
      },
      reserva: {
        id: pagamento.reserva.id,
        dataInicio: pagamento.reserva.dataInicio,
        dataFim: pagamento.reserva.dataFim,
        totalCalculado: pagamento.reserva.totalCalculado,
        tipoQuarto: pagamento.reserva.tipoQuarto.nome,
        cliente: pagamento.reserva.utilizador.nome,
        clienteEmail: pagamento.reserva.utilizador.email,
        hospedes: pagamento.reserva.hospedes.map((h) => h.hospede.nome),
      },
      saldo: {
        totalPago,
        saldoPendente,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar comprovativo:', error);
    res.status(500).json({ error: 'Erro ao gerar comprovativo' });
  }
});

router.get('/utilizadores', requireGestor, async (req, res) => {
  try {
    const utilizadores = await prisma.utilizador.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    res.json(utilizadores);
  } catch (error: any) {
    console.error('Erro ao buscar utilizadores:', error);
    res.status(500).json({ error: 'Erro ao buscar utilizadores' });
  }
});

router.post('/utilizadores', requireGestor, [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password deve ter pelo menos 6 caracteres'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('tipo').isIn(['CLIENTE', 'RECECIONISTA', 'GESTOR']).withMessage('Tipo inválido'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const utilizador = await prisma.utilizador.create({
      data: {
        ...req.body,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        ativo: true,
      },
    });

    await createLog({
      acao: 'CRIAR_UTILIZADOR',
      entidade: 'Utilizador',
      entidadeId: utilizador.id,
      utilizadorId: req.userId!,
      detalhes: `Utilizador criado: ${utilizador.email} (${utilizador.tipo})`,
      ...getClientInfo(req),
    });

    res.status(201).json(utilizador);
  } catch (error: any) {
    console.error('Erro ao criar utilizador:', error);
    res.status(500).json({ error: 'Erro ao criar utilizador' });
  }
});

export default router;
