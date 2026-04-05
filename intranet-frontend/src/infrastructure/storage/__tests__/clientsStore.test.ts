import { Client } from '@/domain/entities/Client';
import { act, renderHook } from '@testing-library/react';
import { useClientsStore } from '../clientsStore';

describe('clientsStore', () => {
  beforeEach(() => {
    // Limpar o store antes de cada teste
    const { result } = renderHook(() => useClientsStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useClientsStore());

    expect(result.current.clients).toEqual([]);
    expect(result.current.filters).toEqual({});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.selectedClient).toBeNull();
  });

  it('should set clients', () => {
    const { result } = renderHook(() => useClientsStore());
    const mockClients: Client[] = [
      {
        id: '1',
        codigo: 'CLI001',
        nome: 'João Silva',
        cpf: '123.456.789-00',
        cep: '12345-678',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Centro',
        numero: '123',
        complemento: 'Apto 1',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
        instagram: '@joaosilva',
        dataUltimaCompra: new Date(),
        quantidadeCompras: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    act(() => {
      result.current.setClients(mockClients);
    });

    expect(result.current.clients).toEqual(mockClients);
  });

  it('should add a client', () => {
    const { result } = renderHook(() => useClientsStore());
    const newClient: Client = {
      id: '1',
      codigo: 'CLI001',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      cep: '12345-678',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      bairro: 'Centro',
      numero: '123',
      complemento: 'Apto 1',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      instagram: '@joaosilva',
      dataUltimaCompra: new Date(),
      quantidadeCompras: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.addClient(newClient);
    });

    expect(result.current.clients).toHaveLength(1);
    expect(result.current.clients[0]).toEqual(newClient);
  });

  it('should update a client', () => {
    const { result } = renderHook(() => useClientsStore());
    const client: Client = {
      id: '1',
      codigo: 'CLI001',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      cep: '12345-678',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      bairro: 'Centro',
      numero: '123',
      complemento: 'Apto 1',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      instagram: '@joaosilva',
      dataUltimaCompra: new Date(),
      quantidadeCompras: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.addClient(client);
    });

    const updatedClient = { ...client, nome: 'João Silva Santos' };

    act(() => {
      result.current.updateClient('1', updatedClient);
    });

    expect(result.current.clients[0].nome).toBe('João Silva Santos');
  });

  it('should delete a client', () => {
    const { result } = renderHook(() => useClientsStore());
    const client: Client = {
      id: '1',
      codigo: 'CLI001',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      cep: '12345-678',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      bairro: 'Centro',
      numero: '123',
      complemento: 'Apto 1',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      instagram: '@joaosilva',
      dataUltimaCompra: new Date(),
      quantidadeCompras: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.addClient(client);
    });

    expect(result.current.clients).toHaveLength(1);

    act(() => {
      result.current.deleteClient('1');
    });

    expect(result.current.clients).toHaveLength(0);
  });

  it('should set filters', () => {
    const { result } = renderHook(() => useClientsStore());
    const filters = { nome: 'João', cidade: 'São Paulo' };

    act(() => {
      result.current.setFilters(filters);
    });

    expect(result.current.filters).toEqual(filters);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useClientsStore());
    const filters = { nome: 'João', cidade: 'São Paulo' };

    act(() => {
      result.current.setFilters(filters);
    });

    expect(result.current.filters).toEqual(filters);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useClientsStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set error', () => {
    const { result } = renderHook(() => useClientsStore());
    const errorMessage = 'Erro ao carregar clientes';

    act(() => {
      result.current.setError(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('should set selected client', () => {
    const { result } = renderHook(() => useClientsStore());
    const client: Client = {
      id: '1',
      codigo: 'CLI001',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      cep: '12345-678',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      bairro: 'Centro',
      numero: '123',
      complemento: 'Apto 1',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      instagram: '@joaosilva',
      dataUltimaCompra: new Date(),
      quantidadeCompras: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setSelectedClient(client);
    });

    expect(result.current.selectedClient).toEqual(client);

    act(() => {
      result.current.setSelectedClient(null);
    });

    expect(result.current.selectedClient).toBeNull();
  });
});
