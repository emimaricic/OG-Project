import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return await this.prisma.user.create({ data: { ...dto } });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findById(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId },
    });
  }

  async update(userId: string, dto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });

    delete updatedUser.password;
    return updatedUser;
  }

  async remove(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ForbiddenException('Access to resources denied');

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
