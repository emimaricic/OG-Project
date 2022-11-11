import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, EditPostDto } from './dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: { authorId: userId, ...dto },
    });

    return post;
  }

  async getPosts() {
    return await this.prisma.post.findMany();
  }

  getUserPosts(userId: string) {
    return this.prisma.post.findMany({ where: { authorId: userId } });
  }

  getPostById(postId: string) {
    return this.prisma.post.findFirst({
      where: { id: postId },
    });
  }

  async editPost(userId: string, postId: string, dto: EditPostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.authorId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.post.update({
      where: { id: postId },
      data: { ...dto },
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    // check if user owns the post
    if (!post || post.authorId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }
}
