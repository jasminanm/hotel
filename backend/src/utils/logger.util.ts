import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LogData {
  acao: string;
  entidade: string;
  entidadeId?: string;
  utilizadorId?: string;
  detalhes?: string;
  ip?: string;
  userAgent?: string;
}

export const createLog = async (data: LogData) => {
  try {
    await prisma.logAuditoria.create({
      data: {
        acao: data.acao,
        entidade: data.entidade,
        entidadeId: data.entidadeId,
        utilizadorId: data.utilizadorId,
        detalhes: data.detalhes,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
  }
};

export const getClientInfo = (req: any): { ip?: string; userAgent?: string } => {
  return {
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  };
};
