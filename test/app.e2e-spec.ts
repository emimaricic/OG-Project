import { PrismaService } from '../src/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { RegisterDto } from '../src/auth/dto';
import { UpdateUserDto } from '../src/users/dto';
import { CreatePostDto, EditPostDto } from '../src/posts/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3334);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: RegisterDto = { email: 'emi@gmail.com', password: '12345' };

    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(201)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: UpdateUserDto = {
          fullname: 'Testname',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.fullname);
      });
    });
  });

  describe('Posts', () => {
    describe('Create post', () => {
      const dto: CreatePostDto = {
        title: 'First post',
        description: 'Lorem ipsum',
      };
      it('should create post', () => {
        return pactum
          .spec()
          .post('/posts')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('postId', 'id');
      });
    });

    describe('Get posts', () => {
      it('should get posts', () => {
        return pactum
          .spec()
          .get('/posts')
          .expectStatus(200)
          .expectJsonLength(1);
      });

      it('should get user posts', () => {
        return pactum
          .spec()
          .get('/posts/user')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Get post by id', () => {
      it('should get post by id', () => {
        return pactum
          .spec()
          .get('/posts/post/{id}')
          .withPathParams('id', '$S{postId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{postId}');
      });
    });

    describe('Edit post by id', () => {
      const dto: EditPostDto = {
        title: 'Edited Post',
        description: 'Lorem lorem lorem',
      };
      it('should edit post', () => {
        return pactum
          .spec()
          .patch('/posts/{id}')
          .withPathParams('id', '$S{postId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete post by id', () => {
      it('should delete post', () => {
        return pactum
          .spec()
          .delete('/posts/{id}')
          .withPathParams('id', '$S{postId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty posts', () => {
        return pactum
          .spec()
          .get('/posts')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
