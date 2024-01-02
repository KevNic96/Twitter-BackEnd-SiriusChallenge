import { PrismaClient } from "@prisma/client";
import { CommentRepository } from ".";
import { CreateCommentInputDTO } from "../dto";
import { PostDTO, ExtendedPostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";

export class CommentRepoImpl implements CommentRepository{
    constructor (private readonly db: PrismaClient){}

    async create (userId: string, data: CreateCommentInputDTO): Promise<PostDTO>{
        const comment = await this.db.post.create({
            data:{
                authorId: userId,
                isComment: true,
                ...data
            }
        })
        return new PostDTO(comment)
    }

    async getAllByPostId(postId: string, options: CursorPagination): Promise <ExtendedPostDTO[]>{
        const comments = await this.db.post.findMany({
            where: {
                isComment: true,
                parentId: postId
            },
            include: {
                author: true,
                reactions:true
            },
            cursor: options.after ? {id: options.after}:options.before ? {id:options.before}:undefined,
            skip: options.after ?? options.before ? 1 : undefined,
            take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
            orderBy: [
                {
                    qtyLikes: 'desc'
                },
                {
                    qtyRetweets: 'desc'
                }
            ]
        })
        return comments.map((comment: ExtendedPostDTO) => new ExtendedPostDTO(comment))
    }

    async delete (commentId: string): Promise <void>{
        await this.db.post.delete({
            where: {
                id: commentId
            }
        })
    }

    async getByCommentId(commentId: string): Promise <PostDTO|null>{
        const post = await this.db.post.findUnique({
            where:{
                id: commentId
            }
        })
        return post != null ? new PostDTO(post) : null
    }

    async getByAuthorId (authorId: string):Promise<PostDTO[]>{
        const posts= await this.db.post.findMany({
            where: {
                isComment: true,
                authorId
            }
        })
        return posts.map((post: PostDTO)=> new PostDTO(post))
    }

}