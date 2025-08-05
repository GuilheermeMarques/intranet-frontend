import { useMemo, useCallback } from 'react';
import { OrderItem } from '@/domain/entities/Order';

interface UseOrderCalculationsOptions {
  items: OrderItem[];
  discountPercentage?: number;
  taxPercentage?: number;
  shippingCost?: number;
}

export const useOrderCalculations = (options: UseOrderCalculationsOptions) => {
  const { 
    items, 
    discountPercentage = 0, 
    taxPercentage = 0, 
    shippingCost = 0 
  } = options;

  // Cálculo do subtotal
  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }, [items]);

  // Cálculo do desconto
  const discountAmount = useMemo(() => {
    return (subtotal * discountPercentage) / 100;
  }, [subtotal, discountPercentage]);

  // Cálculo do valor após desconto
  const totalAfterDiscount = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  // Cálculo do imposto
  const taxAmount = useMemo(() => {
    return (totalAfterDiscount * taxPercentage) / 100;
  }, [totalAfterDiscount, taxPercentage]);

  // Cálculo do total final
  const total = useMemo(() => {
    return totalAfterDiscount + taxAmount + shippingCost;
  }, [totalAfterDiscount, taxAmount, shippingCost]);

  // Cálculo do total de itens
  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Cálculo do peso total (se disponível)
  const totalWeight = useMemo(() => {
    return items.reduce((total, item) => {
      const weight = (item as { weight?: number }).weight || 0;
      return total + (weight * item.quantity);
    }, 0);
  }, [items]);

  // Verificar se há itens
  const hasItems = useMemo(() => {
    return items.length > 0;
  }, [items]);

  // Verificar se há desconto
  const hasDiscount = useMemo(() => {
    return discountPercentage > 0;
  }, [discountPercentage]);

  // Verificar se há imposto
  const hasTax = useMemo(() => {
    return taxPercentage > 0;
  }, [taxPercentage]);

  // Verificar se há frete
  const hasShipping = useMemo(() => {
    return shippingCost > 0;
  }, [shippingCost]);

  // Calcular total por item
  const calculateItemTotal = useCallback((item: OrderItem) => {
    return item.unitPrice * item.quantity;
  }, []);

  // Calcular desconto por item
  const calculateItemDiscount = useCallback((item: OrderItem) => {
    const itemTotal = calculateItemTotal(item);
    return (itemTotal * discountPercentage) / 100;
  }, [discountPercentage, calculateItemTotal]);

  // Calcular imposto por item
  const calculateItemTax = useCallback((item: OrderItem) => {
    const itemTotal = calculateItemTotal(item);
    const itemDiscount = calculateItemDiscount(item);
    const itemAfterDiscount = itemTotal - itemDiscount;
    return (itemAfterDiscount * taxPercentage) / 100;
  }, [taxPercentage, calculateItemTotal, calculateItemDiscount]);

  // Obter resumo dos cálculos
  const getSummary = useCallback(() => {
    return {
      subtotal,
      discountAmount,
      totalAfterDiscount,
      taxAmount,
      shippingCost,
      total,
      totalItems,
      totalWeight,
      hasItems,
      hasDiscount,
      hasTax,
      hasShipping,
    };
  }, [
    subtotal,
    discountAmount,
    totalAfterDiscount,
    taxAmount,
    shippingCost,
    total,
    totalItems,
    totalWeight,
    hasItems,
    hasDiscount,
    hasTax,
    hasShipping,
  ]);

  return {
    // Valores calculados
    subtotal,
    discountAmount,
    totalAfterDiscount,
    taxAmount,
    total,
    totalItems,
    totalWeight,
    
    // Estados
    hasItems,
    hasDiscount,
    hasTax,
    hasShipping,
    
    // Funções de cálculo
    calculateItemTotal,
    calculateItemDiscount,
    calculateItemTax,
    getSummary,
  };
}; 