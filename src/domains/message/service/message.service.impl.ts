import { NotFoundException } from "@utils";
import { MessageDTO } from "../dto";
import { MessageRepository } from "../repository";
import { MessageService } from "./message.service";
import { FollowerRepo } from "@domains/follower/repository";
import { UserRepository } from "@domains/user/repository";
import { UserViewDTO } from "@domains/user/dto";

export class MessageServiceImpl implements MessageService{
    constructor(
        private readonly messageRepo: MessageRepository,
        private readonly followRepo: FollowerRepo,
        private readonly userRepo: UserRepository,
    ){}

    async newMessage (userId: string, to: string, content: string): Promise <MessageDTO> {
        const doesFollow = await this.followRepo.getById(userId,to)
        const doesFollowBack = await this.followRepo.getById(to, userId)
        if (!doesFollow || !doesFollowBack) throw new NotFoundException('Follow')
        return await this.messageRepo.create({ content, from: userId, to})
    }

    async getChats (userId: string): Promise<UserViewDTO[]>{
        const messages = await this.messageRepo.getChats(userId)
        const users = await Promise.all(
            messages.map(async (message)=>{
                const user = await this.userRepo.getById(message.from === userId ? message.to : message.from)
                if(user) return new UserViewDTO(user)
            })
        )
        return users.filter((user)=> user) as UserViewDTO[]
    }

    async getSingleChat(userId: string, to: string): Promise <MessageDTO[]>{
        const receiver = await this.userRepo.getById(to)
        if(!receiver) throw new NotFoundException('user')
        const messages = await this.messageRepo.getOneChat(userId, to)
        return messages
    }

}