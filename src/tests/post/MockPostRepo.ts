import { CursorPagination } from '@types';
import { PostDTO,ExtendedPostDTO,CreatePostInputDTO } from '@domains/post/dto';
import { PostRepository } from '@domains/post/repository';
import { ExtendedUserDTO } from '@domains/user/dto';


export class MockPostRepo implements PostRepository {
  private posts: ExtendedPostDTO[] = [];

  private generateMockAuthor = (): AuthorDTO => {
    // Puedes personalizar la simulación del autor según sea necesario
    return {
      id: 'author_id',
      name: 'Author Name',
      username: 'author_username',
      email: 'author@example.com',
      password: 'author_password',
      isPrivate: false,
      createdAt: new Date(),
      profilePicture: 'author_profile_picture_url',
    };
  };

  async create(userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    const newPost: ExtendedPostDTO = {
      id: (this.posts.length + 1).toString(),
      authorId: userId,
      content: data.content,
      createdAt: new Date(),
      images: data.images || [],
      parentId: null,
      author: this.generateMockAuthor(), // Puedes personalizar la simulación de autor según sea necesario
      reactions: [],
      isComment: false,
      qtyComments: 0,
      qtyLikes: 0,
      qtyRetweets: 0,
    }

    this.posts.push(newPost);
    return newPost;
  }

  async getAllByDatePaginated(options: CursorPagination): Promise<ExtendedPostDTO[]> {
    return this.posts.slice(0, options.limit);
  }

  async delete(postId: string): Promise<void> {
    this.posts = this.posts.filter((post) => post.id !== postId);
  }

  async getById(postId: string): Promise<ExtendedPostDTO | null> {
    return this.posts.find((post) => post.id === postId) || null;
  }

  async getByAuthorId(authorId: string): Promise<ExtendedPostDTO[]> {
    return this.posts.filter((post) => post.authorId === authorId);
  }

  async addQtyLikes(postId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.qtyLikes += 1;
    }
  }

  async removeQtyLikes(postId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (post && post.qtyLikes > 0) {
      post.qtyLikes -= 1;
    }
  }

  async addQtyRetweets(postId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.qtyRetweets += 1;
    }
  }

  async removeQtyRetweets(postId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (post && post.qtyRetweets > 0) {
      post.qtyRetweets -= 1;
    }
  }

  async addQtyComments(postId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.qtyComments += 1;
    }
  }

  async removeQtyComments(postId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (post && post.qtyComments > 0) {
      post.qtyComments -= 1;
    }

  }
}
      // Interfaz del autor simulado
      interface AuthorDTO {
        id: string;
        name: string;
        username: string;
        email: string;
        password: string;
        isPrivate: boolean;
        createdAt: Date;
        profilePicture: string | null;
      }
