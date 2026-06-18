import { Controller, Get } from '@nestjs/common'
import { GetDashboardSummaryUseCase } from '@/domain/dashboard/application/use-cases/get-dashboard-summary'

@Controller('/dashboard/summary')
export class GetDashboardSummaryController {
  constructor(private getSummary: GetDashboardSummaryUseCase) {}

  @Get()
  async handle() {
    const result = await this.getSummary.execute()
    const { stats, progress, recentActivity } = result.value!
    return { stats, progress, recentActivity }
  }
}
