import { ReactionDTO } from "../dto";
import {ReactionType} from '@prisma/client'

export interface ReactionRepository{
    create: (userId: string, postId: string, type: ReactionType) => Promise <ReactionDTO>
    delete: (reactionId: string) => Promise <void>
    getById: (reactionId: string) => Promise <ReactionDTO|null>
    getByIdAndType: (userId: string, postId: string, type: ReactionType) => Promise <ReactionDTO|null>
    getByPostId: (postId: string) => Promise <ReactionDTO[]|null>
    getByUserAndType: (userId: string, type: ReactionType) => Promise<ReactionDTO[]|null>
}