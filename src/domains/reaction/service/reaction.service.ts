import { ReactionDTO } from "../dto";
import { ReactionType } from "@prisma/client";

export interface ReactionService{
    getReactionById: (reactionId: string) => Promise<ReactionDTO>
    getReactionsByUserAndType: (userId: string, type: ReactionType) => Promise<ReactionDTO[]>
    createReaction: (userId: string, postId: string, type: ReactionType) => Promise <ReactionDTO>
    deleteReaction: (userId: string, postId: string, type: ReactionType) => Promise <void>
    doesReactionExist: (userId: string, postId: string, type: ReactionType) => Promise <boolean>
}