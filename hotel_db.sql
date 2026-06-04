-- hotel_db.sql

CREATE DATABASE IF NOT EXISTS hotel_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hotel_db;

-- CreateTable
CREATE TABLE `utilizadores` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `tipo` ENUM('CLIENTE', 'RECECIONISTA', 'GESTOR') NOT NULL DEFAULT 'CLIENTE',
    `nome` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilizadores_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_quarto` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `valorBaseDiaria` DOUBLE NOT NULL,
    `capacidadeBase` INTEGER NOT NULL,
    `suplementoHospedeExtra` DOUBLE NULL,
    `custoPequenoAlmoco` DOUBLE NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tipos_quarto_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quartos` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `tipoQuartoId` VARCHAR(191) NOT NULL,
    `estado` ENUM('LIVRE', 'OCUPADO', 'MANUTENCAO') NOT NULL DEFAULT 'LIVRE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quartos_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hospedes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipoDocumento` ENUM('CARTAO_CIDADAO', 'PASSAPORTE', 'OUTRO') NOT NULL,
    `numeroDocumento` VARCHAR(191) NOT NULL,
    `nif` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `utilizadorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hospedes_utilizadorId_key`(`utilizadorId`),
    UNIQUE INDEX `hospedes_tipoDocumento_numeroDocumento_key`(`tipoDocumento`, `numeroDocumento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas` (
    `id` VARCHAR(191) NOT NULL,
    `utilizadorId` VARCHAR(191) NOT NULL,
    `tipoQuartoId` VARCHAR(191) NOT NULL,
    `dataInicio` DATE NOT NULL,
    `dataFim` DATE NOT NULL,
    `quantidadeQuartos` INTEGER NOT NULL,
    `hospedesPorQuarto` INTEGER NOT NULL,
    `incluirPequenoAlmoco` BOOLEAN NOT NULL DEFAULT false,
    `estado` ENUM('ATIVA', 'CANCELADA', 'CONCLUIDA') NOT NULL DEFAULT 'ATIVA',
    `totalCalculado` DOUBLE NOT NULL,
    `checkInEfetuado` BOOLEAN NOT NULL DEFAULT false,
    `checkOutEfetuado` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas_quartos` (
    `id` VARCHAR(191) NOT NULL,
    `reservaId` VARCHAR(191) NOT NULL,
    `quartoId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reservas_quartos_reservaId_quartoId_key`(`reservaId`, `quartoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas_hospedes` (
    `id` VARCHAR(191) NOT NULL,
    `reservaId` VARCHAR(191) NOT NULL,
    `hospedeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reservas_hospedes_reservaId_hospedeId_key`(`reservaId`, `hospedeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` VARCHAR(191) NOT NULL,
    `reservaId` VARCHAR(191) NOT NULL,
    `utilizadorId` VARCHAR(191) NOT NULL,
    `montante` DOUBLE NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipo` ENUM('PARCIAL', 'TOTAL') NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservas_rececionistas` (
    `id` VARCHAR(191) NOT NULL,
    `reservaId` VARCHAR(191) NOT NULL,
    `utilizadorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reservas_rececionistas_reservaId_utilizadorId_key`(`reservaId`, `utilizadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos_rececionistas` (
    `id` VARCHAR(191) NOT NULL,
    `pagamentoId` VARCHAR(191) NOT NULL,
    `utilizadorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pagamentos_rececionistas_pagamentoId_utilizadorId_key`(`pagamentoId`, `utilizadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacoes` (
    `id` VARCHAR(191) NOT NULL,
    `reservaId` VARCHAR(191) NULL,
    `quartoId` VARCHAR(191) NULL,
    `utilizadorId` VARCHAR(191) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notificacoes_utilizadorId_lida_idx`(`utilizadorId`, `lida`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs_auditoria` (
    `id` VARCHAR(191) NOT NULL,
    `acao` VARCHAR(191) NOT NULL,
    `entidade` VARCHAR(191) NOT NULL,
    `entidadeId` VARCHAR(191) NULL,
    `utilizadorId` VARCHAR(191) NULL,
    `detalhes` TEXT NULL,
    `ip` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `logs_auditoria_acao_idx`(`acao`),
    INDEX `logs_auditoria_entidade_idx`(`entidade`),
    INDEX `logs_auditoria_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quartos` ADD CONSTRAINT `quartos_tipoQuartoId_fkey` FOREIGN KEY (`tipoQuartoId`) REFERENCES `tipos_quarto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hospedes` ADD CONSTRAINT `hospedes_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_tipoQuartoId_fkey` FOREIGN KEY (`tipoQuartoId`) REFERENCES `tipos_quarto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas_quartos` ADD CONSTRAINT `reservas_quartos_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `reservas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas_quartos` ADD CONSTRAINT `reservas_quartos_quartoId_fkey` FOREIGN KEY (`quartoId`) REFERENCES `quartos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas_hospedes` ADD CONSTRAINT `reservas_hospedes_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `reservas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas_hospedes` ADD CONSTRAINT `reservas_hospedes_hospedeId_fkey` FOREIGN KEY (`hospedeId`) REFERENCES `hospedes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `reservas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas_rececionistas` ADD CONSTRAINT `reservas_rececionistas_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `reservas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas_rececionistas` ADD CONSTRAINT `reservas_rececionistas_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos_rececionistas` ADD CONSTRAINT `pagamentos_rececionistas_pagamentoId_fkey` FOREIGN KEY (`pagamentoId`) REFERENCES `pagamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos_rececionistas` ADD CONSTRAINT `pagamentos_rececionistas_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_reservaId_fkey` FOREIGN KEY (`reservaId`) REFERENCES `reservas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_quartoId_fkey` FOREIGN KEY (`quartoId`) REFERENCES `quartos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_auditoria` ADD CONSTRAINT `logs_auditoria_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
