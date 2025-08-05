export type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica' | 'urgente';

export interface PriorityConfig {
  priority: TicketPriority;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  icon: string;
  description: string;
  slaHours: number;
  escalationHours: number;
  weight: number;
}

export const PRIORITY_CONFIG: Record<TicketPriority, PriorityConfig> = {
  baixa: {
    priority: 'baixa',
    label: 'Baixa',
    color: 'default',
    icon: 'low_priority',
    description: 'Problemas menores que não afetam operações críticas',
    slaHours: 72, // 3 dias
    escalationHours: 48,
    weight: 1,
  },
  media: {
    priority: 'media',
    label: 'Média',
    color: 'info',
    icon: 'schedule',
    description: 'Problemas que afetam funcionalidades não críticas',
    slaHours: 48, // 2 dias
    escalationHours: 24,
    weight: 2,
  },
  alta: {
    priority: 'alta',
    label: 'Alta',
    color: 'warning',
    icon: 'priority_high',
    description: 'Problemas que afetam funcionalidades importantes',
    slaHours: 24, // 1 dia
    escalationHours: 12,
    weight: 3,
  },
  critica: {
    priority: 'critica',
    label: 'Crítica',
    color: 'error',
    icon: 'error',
    description: 'Problemas que afetam operações críticas do negócio',
    slaHours: 8, // 8 horas
    escalationHours: 4,
    weight: 4,
  },
  urgente: {
    priority: 'urgente',
    label: 'Urgente',
    color: 'error',
    icon: 'emergency',
    description: 'Problemas que paralisam completamente o sistema',
    slaHours: 2, // 2 horas
    escalationHours: 1,
    weight: 5,
  },
};

export class TicketPrioritySystem {
  private static instance: TicketPrioritySystem;

  private constructor() {}

  static getInstance(): TicketPrioritySystem {
    if (!TicketPrioritySystem.instance) {
      TicketPrioritySystem.instance = new TicketPrioritySystem();
    }
    return TicketPrioritySystem.instance;
  }

  /**
   * Obtém configuração de uma prioridade
   */
  getPriorityConfig(priority: TicketPriority): PriorityConfig {
    return PRIORITY_CONFIG[priority];
  }

  /**
   * Obtém todas as prioridades
   */
  getAllPriorities(): TicketPriority[] {
    return Object.keys(PRIORITY_CONFIG) as TicketPriority[];
  }

  /**
   * Obtém prioridades ordenadas por peso
   */
  getPrioritiesByWeight(): TicketPriority[] {
    return this.getAllPriorities().sort((a, b) => 
      PRIORITY_CONFIG[b].weight - PRIORITY_CONFIG[a].weight
    );
  }

  /**
   * Verifica se uma prioridade é alta
   */
  isHighPriority(priority: TicketPriority): boolean {
    return ['alta', 'critica', 'urgente'].includes(priority);
  }

  /**
   * Verifica se uma prioridade é crítica
   */
  isCriticalPriority(priority: TicketPriority): boolean {
    return ['critica', 'urgente'].includes(priority);
  }

  /**
   * Verifica se uma prioridade é urgente
   */
  isUrgentPriority(priority: TicketPriority): boolean {
    return priority === 'urgente';
  }

  /**
   * Obtém SLA em horas para uma prioridade
   */
  getSLAHours(priority: TicketPriority): number {
    return PRIORITY_CONFIG[priority].slaHours;
  }

  /**
   * Obtém tempo de escalação em horas para uma prioridade
   */
  getEscalationHours(priority: TicketPriority): number {
    return PRIORITY_CONFIG[priority].escalationHours;
  }

  /**
   * Calcula se um ticket está dentro do SLA
   */
  isWithinSLA(priority: TicketPriority, createdAt: Date): boolean {
    const slaHours = this.getSLAHours(priority);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff <= slaHours;
  }

  /**
   * Calcula se um ticket precisa de escalação
   */
  needsEscalation(priority: TicketPriority, createdAt: Date): boolean {
    const escalationHours = this.getEscalationHours(priority);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= escalationHours;
  }

  /**
   * Calcula tempo restante do SLA
   */
  getRemainingSLAHours(priority: TicketPriority, createdAt: Date): number {
    const slaHours = this.getSLAHours(priority);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return Math.max(0, slaHours - hoursDiff);
  }

  /**
   * Calcula tempo restante até escalação
   */
  getRemainingEscalationHours(priority: TicketPriority, createdAt: Date): number {
    const escalationHours = this.getEscalationHours(priority);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    return Math.max(0, escalationHours - hoursDiff);
  }

  /**
   * Obtém prioridade sugerida baseada em palavras-chave
   */
  getSuggestedPriority(title: string, description: string): TicketPriority {
    const text = `${title} ${description}`.toLowerCase();
    
    // Palavras-chave para prioridades
    const urgentKeywords = ['urgente', 'crash', 'parado', 'não funciona', 'erro crítico', 'sistema down'];
    const criticalKeywords = ['crítico', 'importante', 'bloqueado', 'falha', 'problema grave'];
    const highKeywords = ['problema', 'bug', 'erro', 'não está funcionando'];
    const mediumKeywords = ['melhoria', 'sugestão', 'otimização', 'lento'];
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return 'urgente';
    }
    
    if (criticalKeywords.some(keyword => text.includes(keyword))) {
      return 'critica';
    }
    
    if (highKeywords.some(keyword => text.includes(keyword))) {
      return 'alta';
    }
    
    if (mediumKeywords.some(keyword => text.includes(keyword))) {
      return 'media';
    }
    
    return 'baixa';
  }

  /**
   * Obtém estatísticas de prioridades
   */
  getPriorityStats(tickets: Array<{ priority: TicketPriority; createdAt: Date }>) {
    const stats = {
      total: tickets.length,
      byPriority: {} as Record<TicketPriority, number>,
      withinSLA: 0,
      needsEscalation: 0,
      averageAge: 0,
    };

    // Conta por prioridade
    this.getAllPriorities().forEach(priority => {
      stats.byPriority[priority] = 0;
    });

    let totalAge = 0;
    const now = new Date();

    tickets.forEach(ticket => {
      stats.byPriority[ticket.priority]++;
      
      if (this.isWithinSLA(ticket.priority, ticket.createdAt)) {
        stats.withinSLA++;
      }
      
      if (this.needsEscalation(ticket.priority, ticket.createdAt)) {
        stats.needsEscalation++;
      }
      
      const ageHours = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      totalAge += ageHours;
    });

    stats.averageAge = tickets.length > 0 ? totalAge / tickets.length : 0;

    return stats;
  }

  /**
   * Obtém prioridade mais alta de uma lista
   */
  getHighestPriority(priorities: TicketPriority[]): TicketPriority {
    if (priorities.length === 0) return 'baixa';
    
    return priorities.reduce((highest, current) => {
      return PRIORITY_CONFIG[current].weight > PRIORITY_CONFIG[highest].weight 
        ? current 
        : highest;
    });
  }

  /**
   * Obtém prioridade mais baixa de uma lista
   */
  getLowestPriority(priorities: TicketPriority[]): TicketPriority {
    if (priorities.length === 0) return 'baixa';
    
    return priorities.reduce((lowest, current) => {
      return PRIORITY_CONFIG[current].weight < PRIORITY_CONFIG[lowest].weight 
        ? current 
        : lowest;
    });
  }
}

// Exporta uma instância singleton
export const ticketPrioritySystem = TicketPrioritySystem.getInstance(); 