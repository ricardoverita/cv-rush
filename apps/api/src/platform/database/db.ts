import type { Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from './prisma.service.js';

/**
 * Either the client or an interactive transaction. Repositories accept it so that a use case
 * can compose several modules' writes in one transaction (docs/architecture/03 §3).
 */
export type Db = PrismaService | Prisma.TransactionClient;
