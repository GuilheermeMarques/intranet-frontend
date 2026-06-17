import tagsMock from '@/mocks/tags.json';
import type { Tag } from '../types';

const tags = tagsMock.tags as Tag[];
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const tagsApi = {
  async list(): Promise<Tag[]> {
    await delay(0);
    return [...tags];
  },
};
