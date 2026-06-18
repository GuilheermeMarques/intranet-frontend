import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { FakeUploader } from 'test/storage/fake-uploader'
import { UploadAttachmentUseCase } from './upload-attachment'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeUploader: FakeUploader
let sut: UploadAttachmentUseCase

describe('Upload Attachment', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    fakeUploader = new FakeUploader()
    sut = new UploadAttachmentUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader,
    )
  })

  it('should be able to upload an image attachment', async () => {
    const result = await sut.execute({
      ticketId: 'ticket-1',
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
      size: 1234,
      uploadedBy: 'user-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.attachment.type).toBe('image')
      expect(result.value.attachment.url).toBeTruthy()
    }
    expect(inMemoryAttachmentsRepository.items).toHaveLength(1)
    expect(fakeUploader.uploads).toHaveLength(1)
  })

  it('should set type document for a pdf attachment', async () => {
    const result = await sut.execute({
      ticketId: 'ticket-1',
      fileName: 'doc.pdf',
      fileType: 'application/pdf',
      body: Buffer.from(''),
      size: 1234,
      uploadedBy: 'user-1',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.attachment.type).toBe('document')
    }
  })

  it('should not be able to upload an attachment with an invalid type', async () => {
    const result = await sut.execute({
      ticketId: 'ticket-1',
      fileName: 'archive.zip',
      fileType: 'application/zip',
      body: Buffer.from(''),
      size: 1234,
      uploadedBy: 'user-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
    expect(fakeUploader.uploads).toHaveLength(0)
  })
})
