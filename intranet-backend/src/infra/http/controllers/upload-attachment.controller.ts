import { BadRequestException, Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { UploadAttachmentUseCase } from '@/domain/support/application/use-cases/upload-attachment'
import { AttachmentPresenter } from '../presenters/attachment-presenter'

@Controller('/tickets/:id/attachments')
export class UploadAttachmentController {
  constructor(private uploadAttachment: UploadAttachmentUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @Param('id') ticketId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserPayload,
  ) {
    if (!file) throw new BadRequestException('File is required')

    const result = await this.uploadAttachment.execute({
      ticketId,
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
      size: file.size,
      uploadedBy: user.sub,
    })

    if (result.isLeft()) throw new BadRequestException(result.value.message)
    return { attachment: AttachmentPresenter.toHTTP(result.value.attachment) }
  }
}
