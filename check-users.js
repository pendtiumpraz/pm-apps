const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    }
  })
  
  console.log('=== Registered Users ===')
  if (users.length === 0) {
    console.log('No users found. Please register first.')
  } else {
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Created: ${user.createdAt}`)
    })
  }
  console.log(`Total: ${users.length} user(s)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
