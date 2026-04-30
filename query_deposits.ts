import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const deposits = await prisma.depositRequest.findMany({ select: { id: true, proofUrl: true } });
  console.log(deposits.map(x => ({ id: x.id, len: x.proofUrl?.length })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
