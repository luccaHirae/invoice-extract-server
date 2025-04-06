import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

const prisma = mockDeep<PrismaClient>();
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
export default prisma; // Export the mocked Prisma client
