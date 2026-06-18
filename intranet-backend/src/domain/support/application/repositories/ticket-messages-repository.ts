import { Message } from '../../enterprise/entities/message'

export abstract class TicketMessagesRepository {
  abstract create(message: Message): Promise<void>
}
