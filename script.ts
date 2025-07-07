import { PrismaClient } from "./generated/prisma"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      first_name: "Alice",
      last_name: "Test",
      email: "alice@prisma.io",
    },
  })
  console.log(user)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
