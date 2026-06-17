import prioritiesMock from '@/mocks/priorities.json';
import type { Priority } from '../types';

const priorities = prioritiesMock.priorities as Priority[];
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const prioritiesApi = {
  async list(): Promise<Priority[]> {
    await delay(0);
    return [...priorities];
  },
};
