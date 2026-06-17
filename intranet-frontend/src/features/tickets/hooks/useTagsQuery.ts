import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '../api/tagsApi';

export function useTagsQuery() {
  return useQuery({ queryKey: ['ticket-tags'], queryFn: () => tagsApi.list() });
}
