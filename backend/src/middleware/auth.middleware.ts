import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, TipoUtilizador } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
  userType?: TipoUtilizador;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
      userId: string;
      userType: TipoUtilizador;
    };

    const user = await prisma.utilizador.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Utilizador inválido ou inativo' });
    }

    req.userId = decoded.userId;
    req.userType = decoded.userType;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const requireRole = (...allowedRoles: TipoUtilizador[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userType) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedRoles.includes(req.userType)) {
      return res.status(403).json({ error: 'Acesso negado. Permissões insuficientes.' });
    }

    next();
  };
};

export const requireGestor = requireRole(TipoUtilizador.GESTOR);
export const requireRececionista = requireRole(TipoUtilizador.RECECIONISTA, TipoUtilizador.GESTOR);
export const requireAdmin = requireRole(TipoUtilizador.RECECIONISTA, TipoUtilizador.GESTOR);
