import { httpClient } from '@/services/httpClient'
import type { Tag } from '../types'

export const tagsApi = {
  async list(): Promise<Tag[]> {
    const { tags } = await httpClient.get<{ tags: Tag[] }>('/ticket-tags')
    return tags
  },
}
