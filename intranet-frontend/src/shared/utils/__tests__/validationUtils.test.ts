import { z } from 'zod';
import { ClientSchema } from '../validationSchemas';
import {
  formatCEP,
  formatCPF,
  formatPhone,
  validateCPF,
  validateData,
  validateDataSafe,
  validateEmail,
  validateURL,
} from '../validationUtils';

describe('validationUtils', () => {
  describe('validateData', () => {
    it('should validate correct data', () => {
      const validData = {
        nome: 'João Silva',
        cpf: '123.456.789-00',
        cep: '12345-678',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Centro',
        numero: '123',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
      };

      const result = validateData(ClientSchema, validData);
      expect(result).toEqual(validData);
    });

    it('should throw error for invalid data', () => {
      const invalidData = {
        nome: 'J', // Too short
        cpf: 'invalid-cpf',
        email: 'invalid-email',
      };

      expect(() => validateData(ClientSchema, invalidData)).toThrow('Dados inválidos');
    });
  });

  describe('validateDataSafe', () => {
    it('should return success for valid data', () => {
      const validData = {
        nome: 'João Silva',
        cpf: '123.456.789-00',
        cep: '12345-678',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Centro',
        numero: '123',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999',
      };

      const result = validateDataSafe(ClientSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should return error for invalid data', () => {
      const invalidData = {
        nome: 'J',
        email: 'invalid-email',
      };

      const result = validateDataSafe(ClientSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeInstanceOf(z.ZodError);
      }
    });
  });

  describe('validateCPF', () => {
    it('should validate correct CPF', () => {
      expect(validateCPF('123.456.789-09')).toBe(true);
      expect(validateCPF('111.444.777-35')).toBe(true);
    });

    it('should reject invalid CPF', () => {
      expect(validateCPF('123.456.789-00')).toBe(false);
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('123')).toBe(false);
      expect(validateCPF('')).toBe(false);
    });
  });

  describe('formatCPF', () => {
    it('should format CPF correctly', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09');
      expect(formatCPF('123.456.789-09')).toBe('123.456.789-09');
    });
  });

  describe('formatPhone', () => {
    it('should format phone correctly', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
      expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999');
    });
  });

  describe('formatCEP', () => {
    it('should format CEP correctly', () => {
      expect(formatCEP('12345678')).toBe('12345-678');
      expect(formatCEP('12345-678')).toBe('12345-678');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('should validate correct URLs', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://localhost:3000')).toBe(true);
      expect(validateURL('https://api.example.com/v1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateURL('not-a-url')).toBe(false);
      expect(validateURL('')).toBe(false);
    });
  });
});
