import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PermissionsRepository } from '@/domain/iam/application/repositories/permissions-repository'
import { Permission } from '@/domain/iam/enterprise/entities/permission'
import { PrismaPermissionMapper } from '../mappers/prisma-permission-mapper'

@Injectable()
export class PrismaPermissionsRepository implements PermissionsRepository {
  constructor(private prisma: PrismaService) {}

  async findManyCatalog(): Promise<Permission[]> {
    const rows = await this.prisma.permission.findMany({ orderBy: { key: 'asc' } })
    return rows.map(PrismaPermissionMapper.toDomain)
  }

  async findKeysByUserId(userId: string): Promise<string[]> {
    const rows = await this.prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    })
    return rows.map((row) => row.permission.key)
  }

  async replaceUserPermissions(userId: string, permissionKeys: string[]): Promise<void> {
    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    })

    await this.prisma.$transaction([
      this.prisma.userPermission.deleteMany({ where: { userId } }),
      this.prisma.userPermission.createMany({
        data: permissions.map((permission) => ({ userId, permissionId: permission.id })),
        skipDuplicates: true,
      }),
    ])
  }
}
