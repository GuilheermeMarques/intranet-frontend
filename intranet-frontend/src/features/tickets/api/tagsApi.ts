import { httpClient } from '@/services/httpClient'
import type { Tag } from '../types'

export interface TagInput {
  name: string
  color: string
  description?: string
  category?: string
  isActive?: boolean
}

export const tagsApi = {
  async list(): Promise<Tag[]> {
    const { tags } = await httpClient.get<{ tags: Tag[] }>('/ticket-tags')
    return tags
  },
  async create(data: TagInput): Promise<Tag> {
    const { tag } = await httpClient.post<{ tag: Tag }>('/ticket-tags', data)
    return tag
  },
  async update(id: string, data: Partial<TagInput>): Promise<Tag> {
    const { tag } = await httpClient.patch<{ tag: Tag }>(`/ticket-tags/${id}`, data)
    return tag
  },
  async remove(id: string): Promise<void> {
    await httpClient.delete(`/ticket-tags/${id}`)
  },
}
