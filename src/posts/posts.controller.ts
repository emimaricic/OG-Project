import {
  Controller,
  UseGuards,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtGuard } from './../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator';
import { CreatePostDto, EditPostDto } from './dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtGuard)
  @Post()
  createPost(@GetUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(userId, dto);
  }

  @Get()
  getPosts() {
    return this.postsService.getPosts();
  }

  @UseGuards(JwtGuard)
  @Get('/user')
  getUserPosts(@GetUser('id') userId: string) {
    return this.postsService.getUserPosts(userId);
  }

  @Get('/post/:id')
  getPostById(@Param('id') postId: string) {
    return this.postsService.getPostById(postId);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  editPost(
    @GetUser('id') userId: string,
    @Param('id') postId: string,
    @Body() dto: EditPostDto,
  ) {
    return this.postsService.editPost(userId, postId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deletePost(@GetUser('id') userId: string, @Param('id') postId: string) {
    return this.postsService.deletePost(userId, postId);
  }
}
