const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`\n=== Total Users: ${users.length} ===\n`)
  
  users.forEach((user, i) => {
    console.log(`${i + 1}. ${user.email}`)
    console.log(`   Name: ${user.name || '-'}`)
    console.log(`   Projects: ${user._count.projects}`)
    console.log(`   Joined: ${user.createdAt.toLocaleDateString()}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
