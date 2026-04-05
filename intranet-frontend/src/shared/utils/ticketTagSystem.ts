export interface TicketTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TicketTagSystem {
  private static instance: TicketTagSystem;
  private tags: TicketTag[] = [];
  private categories: TicketCategory[] = [];

  private constructor() {
    this.initializeDefaultData();
  }

  static getInstance(): TicketTagSystem {
    if (!TicketTagSystem.instance) {
      TicketTagSystem.instance = new TicketTagSystem();
    }
    return TicketTagSystem.instance;
  }

  /**
   * Inicializa dados padrão
   */
  private initializeDefaultData(): void {
    // Categorias padrão
    this.categories = [
      {
        id: '1',
        name: 'Bug',
        slug: 'bug',
        description: 'Problemas e erros no sistema',
        icon: 'bug_report',
        color: '#F44336',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Feature',
        slug: 'feature',
        description: 'Novas funcionalidades e melhorias',
        icon: 'add_circle',
        color: '#4CAF50',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Suporte',
        slug: 'suporte',
        description: 'Dúvidas e solicitações de suporte',
        icon: 'help',
        color: '#2196F3',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Urgente',
        slug: 'urgente',
        description: 'Tickets que requerem atenção imediata',
        icon: 'priority_high',
        color: '#FF9800',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        name: 'Documentação',
        slug: 'documentacao',
        description: 'Melhorias na documentação',
        icon: 'description',
        color: '#9C27B0',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Tags padrão
    this.tags = [
      {
        id: '1',
        name: 'Frontend',
        slug: 'frontend',
        color: '#2196F3',
        description: 'Problemas relacionados ao frontend',
        category: '1',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Backend',
        slug: 'backend',
        color: '#4CAF50',
        description: 'Problemas relacionados ao backend',
        category: '1',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Database',
        slug: 'database',
        color: '#FF9800',
        description: 'Problemas relacionados ao banco de dados',
        category: '1',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'UI/UX',
        slug: 'ui-ux',
        color: '#9C27B0',
        description: 'Melhorias na interface do usuário',
        category: '2',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        name: 'Performance',
        slug: 'performance',
        color: '#F44336',
        description: 'Problemas de performance',
        category: '1',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6',
        name: 'Segurança',
        slug: 'seguranca',
        color: '#FF5722',
        description: 'Problemas de segurança',
        category: '1',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '7',
        name: 'Mobile',
        slug: 'mobile',
        color: '#607D8B',
        description: 'Problemas relacionados ao mobile',
        category: '1',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '8',
        name: 'API',
        slug: 'api',
        color: '#795548',
        description: 'Problemas relacionados à API',
        category: '1',
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // ===== CATEGORIAS =====

  /**
   * Obtém todas as categorias
   */
  getAllCategories(): TicketCategory[] {
    return [...this.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Obtém categorias ativas
   */
  getActiveCategories(): TicketCategory[] {
    return this.categories.filter(cat => cat.isActive);
  }

  /**
   * Obtém categoria por ID
   */
  getCategoryById(id: string): TicketCategory | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  /**
   * Obtém categoria por slug
   */
  getCategoryBySlug(slug: string): TicketCategory | undefined {
    return this.categories.find(cat => cat.slug === slug);
  }

  /**
   * Adiciona nova categoria
   */
  addCategory(category: Omit<TicketCategory, 'id' | 'createdAt' | 'updatedAt'>): TicketCategory {
    const newCategory: TicketCategory = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.categories.push(newCategory);
    return newCategory;
  }

  /**
   * Atualiza categoria
   */
  updateCategory(id: string, updates: Partial<TicketCategory>): TicketCategory | null {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) return null;
    
    this.categories[index] = {
      ...this.categories[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.categories[index];
  }

  /**
   * Remove categoria
   */
  removeCategory(id: string): boolean {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index === -1) return false;
    
    // Verifica se há tags usando esta categoria
    const tagsUsingCategory = this.tags.filter(tag => tag.category === id);
    if (tagsUsingCategory.length > 0) {
      throw new Error('Não é possível remover categoria que possui tags associadas');
    }
    
    this.categories.splice(index, 1);
    return true;
  }

  // ===== TAGS =====

  /**
   * Obtém todas as tags
   */
  getAllTags(): TicketTag[] {
    return [...this.tags].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtém tags ativas
   */
  getActiveTags(): TicketTag[] {
    return this.tags.filter(tag => tag.isActive);
  }

  /**
   * Obtém tags por categoria
   */
  getTagsByCategory(categoryId: string): TicketTag[] {
    return this.tags.filter(tag => tag.category === categoryId && tag.isActive);
  }

  /**
   * Obtém tag por ID
   */
  getTagById(id: string): TicketTag | undefined {
    return this.tags.find(tag => tag.id === id);
  }

  /**
   * Obtém tag por slug
   */
  getTagBySlug(slug: string): TicketTag | undefined {
    return this.tags.find(tag => tag.slug === slug);
  }

  /**
   * Busca tags por nome
   */
  searchTags(query: string): TicketTag[] {
    const lowerQuery = query.toLowerCase();
    return this.tags.filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery) ||
      tag.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Adiciona nova tag
   */
  addTag(tag: Omit<TicketTag, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): TicketTag {
    const newTag: TicketTag = {
      ...tag,
      id: Date.now().toString(),
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.tags.push(newTag);
    return newTag;
  }

  /**
   * Atualiza tag
   */
  updateTag(id: string, updates: Partial<TicketTag>): TicketTag | null {
    const index = this.tags.findIndex(tag => tag.id === id);
    if (index === -1) return null;
    
    this.tags[index] = {
      ...this.tags[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.tags[index];
  }

  /**
   * Remove tag
   */
  removeTag(id: string): boolean {
    const index = this.tags.findIndex(tag => tag.id === id);
    if (index === -1) return false;
    
    this.tags.splice(index, 1);
    return true;
  }

  /**
   * Incrementa contador de uso de uma tag
   */
  incrementTagUsage(tagId: string): void {
    const tag = this.getTagById(tagId);
    if (tag) {
      tag.usageCount++;
      tag.updatedAt = new Date();
    }
  }

  /**
   * Decrementa contador de uso de uma tag
   */
  decrementTagUsage(tagId: string): void {
    const tag = this.getTagById(tagId);
    if (tag && tag.usageCount > 0) {
      tag.usageCount--;
      tag.updatedAt = new Date();
    }
  }

  /**
   * Obtém tags mais populares
   */
  getPopularTags(limit: number = 10): TicketTag[] {
    return this.tags
      .filter(tag => tag.isActive)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Obtém tags sugeridas baseadas em texto
   */
  getSuggestedTags(text: string): TicketTag[] {
    const lowerText = text.toLowerCase();
    const suggestions: TicketTag[] = [];
    
    this.tags.forEach(tag => {
      if (tag.isActive) {
        const relevance = this.calculateTagRelevance(tag, lowerText);
        if (relevance > 0) {
          suggestions.push({ ...tag, usageCount: relevance });
        }
      }
    });
    
    return suggestions
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  }

  /**
   * Calcula relevância de uma tag baseada no texto
   */
  private calculateTagRelevance(tag: TicketTag, text: string): number {
    let relevance = 0;
    
    // Verifica se o nome da tag está no texto
    if (text.includes(tag.name.toLowerCase())) {
      relevance += 10;
    }
    
    // Verifica se o slug da tag está no texto
    if (text.includes(tag.slug.toLowerCase())) {
      relevance += 8;
    }
    
    // Verifica se a descrição da tag está no texto
    if (tag.description && text.includes(tag.description.toLowerCase())) {
      relevance += 5;
    }
    
    // Adiciona peso baseado no uso da tag
    relevance += Math.min(tag.usageCount, 10);
    
    return relevance;
  }

  /**
   * Obtém estatísticas de tags
   */
  getTagStats() {
    const stats = {
      totalTags: this.tags.length,
      activeTags: this.tags.filter(tag => tag.isActive).length,
      totalUsage: this.tags.reduce((sum, tag) => sum + tag.usageCount, 0),
      byCategory: {} as Record<string, number>,
      mostUsed: this.getPopularTags(5),
    };

    // Conta tags por categoria
    this.categories.forEach(category => {
      const tagCount = this.tags.filter(tag => tag.category === category.id).length;
      stats.byCategory[category.name] = tagCount;
    });

    return stats;
  }
}

// Exporta uma instância singleton
export const ticketTagSystem = TicketTagSystem.getInstance(); 