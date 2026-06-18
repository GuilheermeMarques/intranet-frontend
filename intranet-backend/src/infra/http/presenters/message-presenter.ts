import { Message } from '@/domain/support/enterprise/entities/message'

export class MessagePresenter {
  static toHTTP(message: Message) {
    return {
      id: message.id.toString(),
      author: message.author,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      mentions: message.mentions,
      type: message.type,
      attachments: [],
    }
  }
}
