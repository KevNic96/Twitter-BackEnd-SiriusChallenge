import { PrismaClient, ReactionType } from "@prisma/client";
import { ReactionDTO } from "../dto";
import { ReactionRepository } from "./reaction.repository";

export class ReactionRepoImpl implements ReactionRepository{
    constructor(private readonly db: PrismaClient){}

    async create(userId: string, postId: string, type: ReactionType): Promise <ReactionDTO>{
        const reaction = await this.db.reaction.create({
            data:{
                userId,
                postId,
                type
            }
        })
        .then((reaction: ReactionDTO)=> new ReactionDTO(reaction))
        return reaction
    }

    async delete(reactionId: any):Promise <void>{
        await this.db.reaction.delete({
            where: {
                id: reactionId
            }
        })
    }

    async getById(reactionId: any): Promise <ReactionDTO|null>{
        const reaction = await this.db.reaction.findUnique({
            where: {
                id: reactionId
            }
        })
        return reaction ? new ReactionDTO(reaction):null
    }

    async getByIdAndType(userId: string, postId: string, type: ReactionType): Promise <ReactionDTO|null>{
        const reaction = await this.db.reaction.findFirst({
            where:{
                userId,
                postId,
                type
            }
        })
        return reaction ? new ReactionDTO(reaction):null
    }

    async getByUserAndType(userId: string, type: ReactionType): Promise<ReactionDTO[]|null>{
        const reaction = await this.db.reaction.findMany({
            where:{
                userId,
                type
            }
        })
        return reaction.length ? reaction.map((r: ReactionDTO)=> new ReactionDTO(r)):null
    }

    async getByPostId (postId: string): Promise <ReactionDTO[]|null>{
        const reaction = await this.db.reaction.findMany({
            where: {
                postId
            }
        })
        return reaction.length ? reaction.map((r: ReactionDTO)=> new ReactionDTO(r)): null
    }

}