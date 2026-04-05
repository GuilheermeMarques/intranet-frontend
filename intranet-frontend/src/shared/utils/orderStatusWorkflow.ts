export type OrderStatus = 
  | 'rascunho'
  | 'pendente'
  | 'aprovado'
  | 'em_producao'
  | 'pronto_entrega'
  | 'em_transporte'
  | 'entregue'
  | 'cancelado'
  | 'devolvido';

export interface OrderStatusConfig {
  status: OrderStatus;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  icon: string;
  description: string;
  canTransitionTo: OrderStatus[];
  requiresAction: boolean;
  estimatedTime?: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  rascunho: {
    status: 'rascunho',
    label: 'Rascunho',
    color: 'default',
    icon: 'edit',
    description: 'Pedido em criação, não foi enviado ainda',
    canTransitionTo: ['pendente', 'cancelado'],
    requiresAction: true,
  },
  pendente: {
    status: 'pendente',
    label: 'Pendente',
    color: 'warning',
    icon: 'schedule',
    description: 'Aguardando aprovação',
    canTransitionTo: ['aprovado', 'cancelado'],
    requiresAction: true,
    estimatedTime: '24h',
  },
  aprovado: {
    status: 'aprovado',
    label: 'Aprovado',
    color: 'info',
    icon: 'check_circle',
    description: 'Pedido aprovado, aguardando produção',
    canTransitionTo: ['em_producao', 'cancelado'],
    requiresAction: false,
    estimatedTime: '2-3 dias',
  },
  em_producao: {
    status: 'em_producao',
    label: 'Em Produção',
    color: 'primary',
    icon: 'build',
    description: 'Produtos sendo fabricados',
    canTransitionTo: ['pronto_entrega', 'cancelado'],
    requiresAction: false,
    estimatedTime: '3-5 dias',
  },
  pronto_entrega: {
    status: 'pronto_entrega',
    label: 'Pronto para Entrega',
    color: 'secondary',
    icon: 'local_shipping',
    description: 'Produtos prontos, aguardando transporte',
    canTransitionTo: ['em_transporte', 'cancelado'],
    requiresAction: true,
    estimatedTime: '1 dia',
  },
  em_transporte: {
    status: 'em_transporte',
    label: 'Em Transporte',
    color: 'info',
    icon: 'delivery_dining',
    description: 'Produtos em trânsito',
    canTransitionTo: ['entregue', 'cancelado'],
    requiresAction: false,
    estimatedTime: '1-3 dias',
  },
  entregue: {
    status: 'entregue',
    label: 'Entregue',
    color: 'success',
    icon: 'task_alt',
    description: 'Pedido entregue com sucesso',
    canTransitionTo: ['devolvido'],
    requiresAction: false,
  },
  cancelado: {
    status: 'cancelado',
    label: 'Cancelado',
    color: 'error',
    icon: 'cancel',
    description: 'Pedido cancelado',
    canTransitionTo: [],
    requiresAction: false,
  },
  devolvido: {
    status: 'devolvido',
    label: 'Devolvido',
    color: 'error',
    icon: 'undo',
    description: 'Produtos devolvidos',
    canTransitionTo: [],
    requiresAction: false,
  },
};

export class OrderStatusWorkflow {
  private static instance: OrderStatusWorkflow;

  private constructor() {}

  static getInstance(): OrderStatusWorkflow {
    if (!OrderStatusWorkflow.instance) {
      OrderStatusWorkflow.instance = new OrderStatusWorkflow();
    }
    return OrderStatusWorkflow.instance;
  }

  /**
   * Verifica se uma transição de status é válida
   */
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const fromConfig = ORDER_STATUS_CONFIG[from];
    return fromConfig.canTransitionTo.includes(to);
  }

  /**
   * Obtém os próximos status possíveis
   */
  getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
    return ORDER_STATUS_CONFIG[currentStatus].canTransitionTo;
  }

  /**
   * Obtém a configuração de um status
   */
  getStatusConfig(status: OrderStatus): OrderStatusConfig {
    return ORDER_STATUS_CONFIG[status];
  }

  /**
   * Obtém todos os status disponíveis
   */
  getAllStatuses(): OrderStatus[] {
    return Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[];
  }

  /**
   * Verifica se um status requer ação do usuário
   */
  requiresAction(status: OrderStatus): boolean {
    return ORDER_STATUS_CONFIG[status].requiresAction;
  }

  /**
   * Obtém o tempo estimado para um status
   */
  getEstimatedTime(status: OrderStatus): string | undefined {
    return ORDER_STATUS_CONFIG[status].estimatedTime;
  }

  /**
   * Obtém o fluxo completo de status
   */
  getStatusFlow(): OrderStatus[] {
    return [
      'rascunho',
      'pendente',
      'aprovado',
      'em_producao',
      'pronto_entrega',
      'em_transporte',
      'entregue',
    ];
  }

  /**
   * Verifica se um status é final
   */
  isFinalStatus(status: OrderStatus): boolean {
    return ['entregue', 'cancelado', 'devolvido'].includes(status);
  }

  /**
   * Verifica se um status é cancelável
   */
  isCancellable(status: OrderStatus): boolean {
    return ['rascunho', 'pendente', 'aprovado', 'em_producao', 'pronto_entrega', 'em_transporte'].includes(status);
  }

  /**
   * Obtém o progresso percentual baseado no status
   */
  getProgressPercentage(status: OrderStatus): number {
    const flow = this.getStatusFlow();
    const index = flow.indexOf(status);
    
    if (index === -1) return 0;
    if (this.isFinalStatus(status)) return 100;
    
    return Math.round(((index + 1) / flow.length) * 100);
  }

  /**
   * Obtém o status anterior no fluxo
   */
  getPreviousStatus(currentStatus: OrderStatus): OrderStatus | null {
    const flow = this.getStatusFlow();
    const index = flow.indexOf(currentStatus);
    
    if (index <= 0) return null;
    return flow[index - 1];
  }

  /**
   * Obtém o próximo status no fluxo
   */
  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const flow = this.getStatusFlow();
    const index = flow.indexOf(currentStatus);
    
    if (index === -1 || index >= flow.length - 1) return null;
    return flow[index + 1];
  }
}

// Exporta uma instância singleton
export const orderStatusWorkflow = OrderStatusWorkflow.getInstance(); 