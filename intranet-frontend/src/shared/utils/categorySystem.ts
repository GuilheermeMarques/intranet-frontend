export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  hasChildren: boolean;
}

export class CategorySystem {
  private static instance: CategorySystem;
  private categories: Category[] = [];

  private constructor() {
    this.initializeDefaultCategories();
  }

  static getInstance(): CategorySystem {
    if (!CategorySystem.instance) {
      CategorySystem.instance = new CategorySystem();
    }
    return CategorySystem.instance;
  }

  /**
   * Inicializa categorias padrão
   */
  private initializeDefaultCategories(): void {
    this.categories = [
      {
        id: '1',
        name: 'Eletrônicos',
        slug: 'eletronicos',
        description: 'Produtos eletrônicos e tecnológicos',
        icon: 'devices',
        color: '#2196F3',
        level: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Informática',
        slug: 'informatica',
        description: 'Produtos de informática',
        icon: 'computer',
        color: '#4CAF50',
        parentId: '1',
        level: 1,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Celulares e smartphones',
        icon: 'smartphone',
        color: '#FF9800',
        parentId: '1',
        level: 1,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Vestuário',
        slug: 'vestuario',
        description: 'Roupas e acessórios',
        icon: 'checkroom',
        color: '#9C27B0',
        level: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        name: 'Masculino',
        slug: 'masculino',
        description: 'Roupas masculinas',
        icon: 'person',
        color: '#607D8B',
        parentId: '4',
        level: 1,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6',
        name: 'Feminino',
        slug: 'feminino',
        description: 'Roupas femininas',
        icon: 'person_outline',
        color: '#E91E63',
        parentId: '4',
        level: 1,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '7',
        name: 'Casa e Jardim',
        slug: 'casa-jardim',
        description: 'Produtos para casa e jardim',
        icon: 'home',
        color: '#795548',
        level: 0,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '8',
        name: 'Decoração',
        slug: 'decoracao',
        description: 'Itens de decoração',
        icon: 'palette',
        color: '#FF5722',
        parentId: '7',
        level: 1,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Obtém todas as categorias
   */
  getAllCategories(): Category[] {
    return [...this.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Obtém categorias ativas
   */
  getActiveCategories(): Category[] {
    return this.categories.filter(cat => cat.isActive);
  }

  /**
   * Obtém categorias raiz (nível 0)
   */
  getRootCategories(): Category[] {
    return this.categories.filter(cat => cat.level === 0 && cat.isActive);
  }

  /**
   * Obtém subcategorias de uma categoria
   */
  getSubcategories(parentId: string): Category[] {
    return this.categories.filter(cat => cat.parentId === parentId && cat.isActive);
  }

  /**
   * Obtém categoria por ID
   */
  getCategoryById(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  /**
   * Obtém categoria por slug
   */
  getCategoryBySlug(slug: string): Category | undefined {
    return this.categories.find(cat => cat.slug === slug);
  }

  /**
   * Obtém árvore de categorias
   */
  getCategoryTree(): CategoryTree[] {
    const rootCategories = this.getRootCategories();
    return rootCategories.map(root => this.buildCategoryTree(root));
  }

  /**
   * Constrói árvore de categorias recursivamente
   */
  private buildCategoryTree(category: Category): CategoryTree {
    const children = this.getSubcategories(category.id);
    const childrenTrees = children.map(child => this.buildCategoryTree(child));
    
    return {
      ...category,
      children: childrenTrees,
      hasChildren: childrenTrees.length > 0,
    };
  }

  /**
   * Obtém caminho completo de uma categoria
   */
  getCategoryPath(categoryId: string): Category[] {
    const path: Category[] = [];
    let currentCategory = this.getCategoryById(categoryId);
    
    while (currentCategory) {
      path.unshift(currentCategory);
      if (currentCategory.parentId) {
        currentCategory = this.getCategoryById(currentCategory.parentId);
      } else {
        break;
      }
    }
    
    return path;
  }

  /**
   * Obtém todas as subcategorias recursivamente
   */
  getAllSubcategories(parentId: string): Category[] {
    const subcategories: Category[] = [];
    const directChildren = this.getSubcategories(parentId);
    
    directChildren.forEach(child => {
      subcategories.push(child);
      subcategories.push(...this.getAllSubcategories(child.id));
    });
    
    return subcategories;
  }

  /**
   * Verifica se uma categoria tem subcategorias
   */
  hasSubcategories(categoryId: string): boolean {
    return this.getSubcategories(categoryId).length > 0;
  }

  /**
   * Obtém categorias por nível
   */
  getCategoriesByLevel(level: number): Category[] {
    return this.categories.filter(cat => cat.level === level && cat.isActive);
  }

  /**
   * Busca categorias por nome
   */
  searchCategories(query: string): Category[] {
    const lowerQuery = query.toLowerCase();
    return this.categories.filter(cat => 
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Adiciona nova categoria
   */
  addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const newCategory: Category = {
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
  updateCategory(id: string, updates: Partial<Category>): Category | null {
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
    
    // Verifica se tem subcategorias
    if (this.hasSubcategories(id)) {
      throw new Error('Não é possível remover categoria com subcategorias');
    }
    
    this.categories.splice(index, 1);
    return true;
  }

  /**
   * Ativa/desativa categoria
   */
  toggleCategoryActive(id: string): Category | null {
    const category = this.getCategoryById(id);
    if (!category) return null;
    
    return this.updateCategory(id, { isActive: !category.isActive });
  }
}

// Exporta uma instância singleton
export const categorySystem = CategorySystem.getInstance(); 