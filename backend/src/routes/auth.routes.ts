import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, TipoUtilizador } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { createLog, getClientInfo } from '../utils/logger.util';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/registro', async (req, res) => {
  try {
    const { email, password, nome } = req.body;

    if (!email || !password || !nome) {
      return res.status(400).json({ error: 'Email, password e nome são obrigatórios' });
    }

    const existingUser = await prisma.utilizador.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já registado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.utilizador.create({
      data: {
        email,
        password: hashedPassword,
        nome,
        tipo: TipoUtilizador.CLIENTE,
      },
    });

    await createLog({
      acao: 'REGISTRO_UTILIZADOR',
      entidade: 'Utilizador',
      entidadeId: user.id,
      utilizadorId: user.id,
      detalhes: `Novo utilizador registado: ${email}`,
      ...getClientInfo(req),
    });

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, userType: user.tipo },
      process.env.JWT_SECRET || '',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Registro realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
      },
    });
  } catch (error: any) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registar utilizador' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password são obrigatórios' });
    }

    const user = await prisma.utilizador.findUnique({
      where: { email },
    });

    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, userType: user.tipo },
      process.env.JWT_SECRET || '',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await createLog({
      acao: 'LOGIN',
      entidade: 'Utilizador',
      entidadeId: user.id,
      utilizadorId: user.id,
      detalhes: `Login realizado: ${email}`,
      ...getClientInfo(req),
    });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
      },
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Obter perfil do utilizador autenticado
router.get('/perfil', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.utilizador.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        ativo: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

export default router;
