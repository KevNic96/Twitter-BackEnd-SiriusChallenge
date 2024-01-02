import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  deletePost: (userId: string, postId: string) => Promise<void>
  getPost: (userId: string, postId: string) => Promise<ExtendedPostDTO>
  getLastPosts: (userId: string, options: { limit?: number, before?: string, after?: string }) => Promise<ExtendedPostDTO[]>
  getLastPostsFollowing: (userId: string, options: {limit?:number, before?: string, after?:string}) => Promise<ExtendedPostDTO[]>
  getAuthorPosts: (userId: any, authorId: string) => Promise<ExtendedPostDTO[]>
  setPostImage:(filetype:string)=>Promise <{presignedUrl: string, fileUrl: string}>
  //
  addQtyLikes:(postId: string) => Promise<void>
  removeQtyLikes: (postId:string) => Promise <void>
  addQtyComments: (postId:string) => Promise <void>
  removeQtyComments: (postId:string) => Promise <void>
  addQtyRetweets: (postId:string) => Promise <void>
  removeQtyRetweets: (postId:string) => Promise <void>

}
