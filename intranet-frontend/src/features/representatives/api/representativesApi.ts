import representativesMock from '@/mocks/representatives.json';
import type {
  Representative,
  RepresentativeFilters,
  RepresentativesData,
  RepresentativeStatusOption,
} from '../types';

const representatives = representativesMock.representatives as Representative[];
const regions = representativesMock.regions as string[];
const statusOptions = representativesMock.statusOptions as RepresentativeStatusOption[];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const representativesApi = {
  async list(filters?: Partial<RepresentativeFilters>): Promise<RepresentativesData> {
    await delay(0);
    let result = [...representatives];

    if (filters?.name?.trim()) {
      const term = filters.name.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(term));
    }
    if (filters?.region?.trim()) {
      result = result.filter((r) => r.region === filters.region);
    }
    if (filters?.status?.trim()) {
      result = result.filter((r) => r.status === filters.status);
    }

    return { representatives: result, regions, statusOptions };
  },
};
