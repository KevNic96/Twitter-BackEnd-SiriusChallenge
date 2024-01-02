import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException, Constants } from '@utils'
import { CursorPagination } from '@types'
import { FollowerRepo } from '@domains/follower/repository'
import { UserRepository } from '@domains/user/repository'
import { generateS3Url } from '@utils/s3'

export class PostServiceImpl implements PostService {
  constructor (private readonly repository: PostRepository, private readonly followerRepo: FollowerRepo, private readonly userRepo: UserRepository ) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  //PUNTO B)))
  async getPost (userId: string, postId: string): Promise<ExtendedPostDTO> {
    // TODO PUBLIC PROFILE
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.author.isPrivate) {
      const doesFollow = await this.followerRepo.getById(userId, post.author.id)
      if (!doesFollow) throw new NotFoundException('post')
    }
    return post
  }

  async getLastPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    // TODO: filter post search to return posts from authors that the user follows
    const posts = await this.repository.getAllByDatePaginated(options)
    const filtered: ExtendedPostDTO[] = []
    posts.forEach(async(post) =>{
      if(post.author.isPrivate){
        const doesFollow = await this.followerRepo.getById(userId, post.author.id)
        if(doesFollow) filtered.push(post)
      } else filtered.push(post)
    })

    return filtered
    // return await this.repository.getAllByDatePaginated(options)
  }

  async getAuthorPosts (userId: any, authorId: string): Promise<ExtendedPostDTO[]> {
    // TODO: throw exception when the author has a private profile and the user doesn't follow them
    const author = await this.userRepo.getById(authorId)
    if(author){
      if(author.isPrivate){
        const doesFollow = await this.followerRepo.getById(userId, author.id)
        if(!doesFollow) throw new NotFoundException('post')
      }
    }else{
      throw new NotFoundException('user')
    }
    return await this.repository.getByAuthorId(authorId)
  }

  async getLastPostsFollowing (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    // DID: filter post search to return posts from authors that the user follows
    const posts = await this.repository.getAllByDatePaginated(options)
    const filteredPosts = []
    for (const post of posts) {
      const doesFollow = await this.followerRepo.getById(userId, post.author.id)
      if (doesFollow) filteredPosts.push(post)
    }
    return filteredPosts
  }

  //PUNTO H) S3 Image))

  async setPostImage(filetype: string): Promise <{presignedUrl: string, fileUrl: string}>{
    const presignedData = await generateS3Url(filetype)
    const extension = filetype.split('/')[1]
    const fileUrl = `https://${Constants.BUCKET_NAME}.s3.amaznaws.com/${presignedData.filename}.${extension}`
    const data = {
      presignedUrl: presignedData.presignedUrl,
      fileUrl
    }
    return data
  }


  async addQtyLikes(postId: string): Promise <void>{
    await this.repository.addQtyLikes(postId)
  }

  async removeQtyLikes (postId: string) : Promise <void>{
    await this.repository.subtractQtyLikes(postId)
  }

  async addQtyRetweets (postId: string) : Promise <void>{
    await this.repository.addQtyRetweets(postId)
  }

  async removeQtyRetweets(postId: string):Promise <void>{
    await this.repository.addQtyComments(postId)
  }

  async addQtyComments(postId: string) : Promise <void>{
    await this.repository.addQtyComments(postId)
  }

  async removeQtyComments(postId: string):Promise <void>{
    await this.repository.subtractQtyComments(postId)
  }


}
