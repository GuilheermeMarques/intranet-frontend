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

  const CLIENTS = [
    {
      code: 'CLI001',
      name: 'Padaria Pão Quente',
      document: '12.345.678/0001-90',
      zipCode: '01001-000',
      street: 'Praça da Sé',
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Sé',
      number: '100',
      complement: 'Loja 1',
      email: 'contato@paoquente.com.br',
      phone: '(11) 3333-1001',
      instagram: '@paoquente',
      lastPurchaseAt: new Date('2026-05-10T00:00:00.000Z'),
      purchaseCount: 12,
    },
    {
      code: 'CLI002',
      name: 'Mercado Bom Preço',
      document: '23.456.789/0001-01',
      zipCode: '20040-002',
      street: 'Avenida Rio Branco',
      city: 'Rio de Janeiro',
      state: 'RJ',
      neighborhood: 'Centro',
      number: '250',
      complement: '',
      email: 'compras@bompreco.com.br',
      phone: '(21) 2222-2002',
      instagram: '@mercadobompreco',
      lastPurchaseAt: new Date('2026-06-01T00:00:00.000Z'),
      purchaseCount: 34,
    },
    {
      code: 'CLI003',
      name: 'Farmácia Saúde Total',
      document: '34.567.890/0001-12',
      zipCode: '30110-013',
      street: 'Avenida Afonso Pena',
      city: 'Belo Horizonte',
      state: 'MG',
      neighborhood: 'Centro',
      number: '1500',
      complement: 'Sala 3',
      email: 'sac@saudetotal.com.br',
      phone: '(31) 3131-3003',
      instagram: '@saudetotalbh',
      lastPurchaseAt: null,
      purchaseCount: 0,
    },
  ]

  for (const client of CLIENTS) {
    await prisma.client.upsert({
      where: { code: client.code },
      update: client,
      create: client,
    })
  }

  console.log(`Seeded ${CLIENTS.length} sample clients`)

  const PRODUCTS = [
    {
      code: 'PROD001',
      name: 'Farinha de Trigo 1kg',
      description: 'Farinha de trigo tipo 1, pacote de 1kg',
      price: 5.49,
      stockQuantity: 120,
      supplier: 'Moinho Central',
      category: 'Alimentos',
      imageUrl: null as string | null,
      active: true,
      lastSaleAt: new Date('2026-05-12T00:00:00.000Z'),
    },
    {
      code: 'PROD002',
      name: 'Açúcar Refinado 1kg',
      description: 'Açúcar refinado especial, pacote de 1kg',
      price: 4.29,
      stockQuantity: 80,
      supplier: 'Usina Doce',
      category: 'Alimentos',
      imageUrl: null as string | null,
      active: true,
      lastSaleAt: new Date('2026-06-02T00:00:00.000Z'),
    },
    {
      code: 'PROD003',
      name: 'Detergente Neutro 500ml',
      description: 'Detergente líquido neutro, frasco de 500ml',
      price: 2.19,
      stockQuantity: 200,
      supplier: 'Química Limpa',
      category: 'Limpeza',
      imageUrl: null as string | null,
      active: true,
      lastSaleAt: null as Date | null,
    },
  ]

  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: product,
      create: product,
    })
  }

  console.log(`Seeded ${PRODUCTS.length} sample products`)

  const movementsCount = await prisma.inventoryMovement.count()
  if (movementsCount === 0) {
    await prisma.inventoryMovement.createMany({
      data: [
        {
          productCode: 'PROD001',
          description: 'Reposição de estoque de farinha',
          quantity: 100,
          type: 'inbound',
          occurredAt: new Date('2026-05-01T00:00:00.000Z'),
          reason: 'Compra de fornecedor',
          handledBy: 'Administrador',
          notes: 'Lote inicial',
        },
        {
          productCode: 'PROD002',
          description: 'Venda de açúcar para cliente',
          quantity: 20,
          type: 'outbound',
          occurredAt: new Date('2026-06-02T00:00:00.000Z'),
          reason: 'Venda',
          handledBy: 'Administrador',
          notes: null,
        },
      ],
    })
    console.log('Seeded 2 sample inventory movements')
  }

  const REPRESENTATIVES = [
    {
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      phone: '(11) 98888-1001',
      region: 'Sudeste',
      status: 'active',
      totalSales: 125000,
      monthlyGoal: 150000,
      clientsCount: 32,
      lastActivity: new Date('2026-06-15T00:00:00.000Z'),
      avatar: null as string | null,
    },
    {
      name: 'Maria Souza',
      email: 'maria.souza@empresa.com',
      phone: '(21) 97777-2002',
      region: 'Sul',
      status: 'vacation',
      totalSales: 98000,
      monthlyGoal: 120000,
      clientsCount: 24,
      lastActivity: new Date('2026-05-30T00:00:00.000Z'),
      avatar: null as string | null,
    },
    {
      name: 'Carlos Pereira',
      email: 'carlos.pereira@empresa.com',
      phone: '(31) 96666-3003',
      region: 'Nordeste',
      status: 'training',
      totalSales: 45000,
      monthlyGoal: 90000,
      clientsCount: 11,
      lastActivity: null as Date | null,
      avatar: null as string | null,
    },
  ]

  const representativesCount = await prisma.representative.count()
  if (representativesCount === 0) {
    await prisma.representative.createMany({ data: REPRESENTATIVES })
    console.log(`Seeded ${REPRESENTATIVES.length} sample representatives`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
