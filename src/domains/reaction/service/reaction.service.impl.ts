import { NotFoundException, ValidationException } from "@utils";
import { ReactionDTO } from "../dto";
import { ReactionRepository } from "../repository";
import { ReactionService } from "./reaction.service";
import {ReactionType} from '@prisma/client' //Migracion 
import { PostRepository } from "@domains/post/repository";

export class ReactionServiceImpl implements ReactionService{
    constructor(private readonly reactionRepo: ReactionRepository, private readonly postRepo: PostRepository){}

    async getReactionById (reactionId: string) : Promise <ReactionDTO>{
        const reaction = await this.reactionRepo.getById(reactionId)
        if(!reaction) throw new NotFoundException('reaction')
        return reaction
    }

    async getReactionsByUserAndType (userId: string, type: ReactionType): Promise<ReactionDTO[]>{
        const reactions = await this.reactionRepo.getByUserAndType(userId, type)
        if(!reactions) throw new NotFoundException('reaction')
        return reactions
    }

    async doesReactionExist(userId: string, postId: string, type: ReactionType): Promise<boolean>{
        const reaction = await this.reactionRepo.getByIdAndType(userId, postId, type)
        return reaction != null
    }

    async createReaction(userId: string, postId: string, type: ReactionType): Promise <ReactionDTO>{
        if(await this.doesReactionExist(userId, postId, type)) {
            throw new ValidationException([{message: 'Reaction already exists'}])
        }

        if(type === ReactionType.LIKE) await this.postRepo.addQtyLikes(postId)
        if(type === ReactionType.RETWEET) await this.postRepo.removeQtyRetweets(postId)
        return await this.reactionRepo.create(userId,postId,type)
    }

    async deleteReaction(userId: string, postId: string, type: ReactionType): Promise<void>{
        const reaction = await this.reactionRepo.getByIdAndType(userId, postId, type)
        if(!reaction) throw new NotFoundException('reaction')
        if(type===ReactionType.LIKE) await this.postRepo.removeQtyLikes(postId)
        if(type===ReactionType.RETWEET) await this.postRepo.removeQtyRetweets(postId)
        await this.reactionRepo.delete(reaction.id)
    }

    
}