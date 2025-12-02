const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.update({
    where: { email: 'praz.phoenixz228@gmail.com' },
    data: { role: 'ADMIN' }
  })
  console.log('Updated:', result.email, '-> role:', result.role)
}

main().catch(console.error).finally(() => prisma.$disconnect())
