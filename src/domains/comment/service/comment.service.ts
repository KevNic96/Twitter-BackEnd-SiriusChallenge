import { CursorPagination } from "@types";
import { CreateCommentInputDTO } from "../dto";
import { PostDTO,ExtendedPostDTO } from "@domains/post/dto";

export interface CommentService {
    createComment: (userId: string, body: CreateCommentInputDTO) => Promise<PostDTO>
    deleteComment: (userId: string, postId: string) => Promise<void>
    getComment: (userId: string, postId: string) => Promise <PostDTO>
    getAuthorComments: (userId: any, authorId: string) => Promise<PostDTO[]>
    getPostComments:(userId: string, postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
}