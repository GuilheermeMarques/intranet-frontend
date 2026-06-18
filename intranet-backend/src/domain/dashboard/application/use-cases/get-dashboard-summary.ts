import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ClientsRepository } from '@/domain/sales/application/repositories/clients-repository'
import { ProductsRepository } from '@/domain/sales/application/repositories/products-repository'
import { BudgetsRepository } from '@/domain/sales/application/repositories/budgets-repository'
import { TicketsRepository } from '@/domain/support/application/repositories/tickets-repository'

export interface DashboardStat { title: string; value: string; icon: string; color: string; trend: string; trendValue: string }
export interface DashboardProgress { title: string; value: number; total: number; color: string; icon: string }
export interface DashboardActivity { action: string; user: string; time: string; type: string }
export interface DashboardSummary { stats: DashboardStat[]; progress: DashboardProgress[]; recentActivity: DashboardActivity[] }

type GetDashboardSummaryUseCaseResponse = Either<never, DashboardSummary>

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    private clientsRepository: ClientsRepository,
    private productsRepository: ProductsRepository,
    private budgetsRepository: BudgetsRepository,
    private ticketsRepository: TicketsRepository,
  ) {}

  async execute(): Promise<GetDashboardSummaryUseCaseResponse> {
    const clientsCount = await this.clientsRepository.count()
    const productsCount = await this.productsRepository.count()
    const budgetsCount = await this.budgetsRepository.count()
    const tickets = await this.ticketsRepository.findMany({})
    const ticketsCount = tickets.length
    const doneTickets = tickets.filter((t) => t.status === 'done').length

    const stats: DashboardStat[] = [
      { title: 'Clientes', value: String(clientsCount), icon: 'People', color: 'primary', trend: 'total', trendValue: '' },
      { title: 'Produtos', value: String(productsCount), icon: 'Inventory', color: 'success', trend: 'total', trendValue: '' },
      { title: 'Orçamentos', value: String(budgetsCount), icon: 'AttachMoney', color: 'warning', trend: 'total', trendValue: '' },
      { title: 'Chamados', value: String(ticketsCount), icon: 'Support', color: 'error', trend: 'total', trendValue: '' },
    ]

    const progress: DashboardProgress[] = [
      { title: 'Chamados Resolvidos', value: doneTickets, total: ticketsCount || 1, color: 'success', icon: 'Support' },
    ]

    const recentActivity: DashboardActivity[] = tickets.slice(0, 5).map((t) => ({
      action: `Chamado: ${t.title}`,
      user: t.assignee,
      time: t.createdAt.toISOString(),
      type: 'ticket',
    }))

    return right({ stats, progress, recentActivity })
  }
}
