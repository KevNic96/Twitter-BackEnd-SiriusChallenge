import { CursorPagination } from '@types'
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO) => Promise<PostDTO>
  getAllByDatePaginated: (options: CursorPagination) => Promise<ExtendedPostDTO[]>
  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<ExtendedPostDTO | null>
  getByAuthorId: (authorId: string) => Promise<ExtendedPostDTO[]>
  //Punto 5) Agregar comentarios, likes y rt
  addQtyLikes: (postId: string) => Promise <void>
  removeQtyLikes: (postId: string) => Promise <void>
  addQtyRetweets: (postId: string) => Promise <void>
  removeQtyRetweets: (postId: string) => Promise <void>
  addQtyComments: (postId: string) => Promise <void>
  removeQtyComments: (postId: string) => Promise <void>
  //
}
