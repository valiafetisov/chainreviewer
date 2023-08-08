import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export default function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}
