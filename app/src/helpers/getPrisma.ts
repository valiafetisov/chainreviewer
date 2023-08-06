import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export default function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}
