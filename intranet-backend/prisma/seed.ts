import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const PERMISSIONS: { key: string; name: string; category: string }[] = [
  { key: 'settings.permissions.manage', name: 'Gerenciar permissões', category: 'admin' },
  { key: 'menu.dashboard', name: 'Dashboard', category: 'menu' },
  { key: 'menu.catalog', name: 'Catálogo', category: 'menu' },
  { key: 'menu.clients', name: 'Clientes', category: 'menu' },
  { key: 'menu.tickets', name: 'Chamados', category: 'menu' },
  { key: 'menu.tickets.list', name: 'Lista de Chamados', category: 'menu' },
  { key: 'menu.tickets.priorities', name: 'Prioridades', category: 'menu' },
  { key: 'menu.tickets.tags', name: 'Tags', category: 'menu' },
  { key: 'menu.budgets', name: 'Orçamentos', category: 'menu' },
  { key: 'menu.inventory', name: 'Estoque', category: 'menu' },
  { key: 'menu.sales', name: 'Vendas', category: 'menu' },
  { key: 'menu.sales.representatives', name: 'Representantes', category: 'menu' },
  { key: 'menu.sales.orders', name: 'Pedidos', category: 'menu' },
]

async function main() {
  const passwordHash = await hash('admin123', 8)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@empresa.com',
      passwordHash,
      isActive: true,
      jobTitle: 'Administrador da Intranet',
      department: 'Operações',
    },
  })

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { name: permission.name, category: permission.category },
      create: permission,
    })
  }

  const allPermissions = await prisma.permission.findMany()
  for (const permission of allPermissions) {
    await prisma.userPermission.upsert({
      where: { userId_permissionId: { userId: admin.id, permissionId: permission.id } },
      update: {},
      create: { userId: admin.id, permissionId: permission.id },
    })
  }

  console.log(`Seeded admin (admin@empresa.com / admin123) with ${allPermissions.length} permissions`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
