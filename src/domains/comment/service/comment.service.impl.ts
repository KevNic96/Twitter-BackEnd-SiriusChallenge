import { CreateCommentInputDTO } from "../dto";
import { PostDTO, ExtendedPostDTO } from "@domains/post/dto";
import { CommentRepository } from "../repository";
import { CommentService } from "./comment.service";
import { FollowerRepo } from "@domains/follower/repository";
import { validate } from "class-validator";
import { ForbiddenException, NotFoundException } from "@utils";
import { CursorPagination } from "@types";
import { PostRepository } from "@domains/post/repository";
import { UserRepository } from "@domains/user/repository";

export class CommentServiceImpl implements CommentService{
    constructor(
        private readonly commentRepo: CommentRepository,
        private readonly followRepo: FollowerRepo,
        private readonly userRepo: UserRepository,
        private readonly postRepo: PostRepository
    ){}

    async createComment(userId: string, data: CreateCommentInputDTO): Promise<PostDTO>{
        await validate(data)
        const post = await this.postRepo.getById(data.parentId)
        if(!post) throw new NotFoundException('post')
        await this.postRepo.addQtyComments(data.parentId)
        return await this.commentRepo.create(userId, data)
    }

    async deleteComment(userId: string, commentId: string): Promise<void>{
        const comment = await this.commentRepo.getById(commentId)
        if(!comment?.parentId) throw new NotFoundException('comment')
        if (comment.authorId!== userId) throw new ForbiddenException()
        await this.postRepo.subtractQtyComments(comment?.parentId)
        await this.commentRepo.delete(commentId)
    }

    async getComment(userId: string, commentId: string): Promise<PostDTO>{
        const comment = await this.commentRepo.getById(commentId)
        if(!comment) throw new NotFoundException('comment')
        const author = await this.userRepo.getById(comment.authorId)
        if(author?.isPrivate === true){
            const doesFollow = await this.followRepo.getById(userId,author.id)
            if(!doesFollow) throw new NotFoundException('comment')
        }
        return comment
    }

    async getAuthorComments(userId: any, authorId: string):Promise<PostDTO[]>{
        const author = await this.userRepo.getById(authorId)
        if(!author) throw new NotFoundException('user')
        const doesFollowExist = await this.followRepo.getById(userId, authorId)
        if(!doesFollowExist && author.isPrivate) throw new NotFoundException('comment')
        return await this.commentRepo.getByAuthorId(authorId)
    }

    async getPostComments(userId: string, postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]>{
        const post = await this.postRepo.getById(postId)
        if(!post) throw new NotFoundException('post')
        const author = await this.userRepo.getById(post.authorId)
        if(!author) throw new NotFoundException('user')
        const doesFollowExist = await this.followRepo.getById(userId,author.id)
        if(!doesFollowExist && author.isPrivate) throw new NotFoundException('comment')
        return await this.commentRepo.getAllByPostId(postId,options)
    }

}