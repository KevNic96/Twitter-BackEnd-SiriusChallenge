import { CursorPagination } from "@types";
import { CreateCommentInputDTO } from "../dto";
import { PostDTO, ExtendedPostDTO } from "@domains/post/dto";

export interface CommentRepository{
    create: (userId: string, data: CreateCommentInputDTO) => Promise <PostDTO>
    delete: (commentId: string) => Promise<void>
    getByCommentId: (commentId: string) => Promise<PostDTO|null>
    getByAuthorId:(authorId: string) => Promise <PostDTO[]>
    getAllByPostId: (postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
}