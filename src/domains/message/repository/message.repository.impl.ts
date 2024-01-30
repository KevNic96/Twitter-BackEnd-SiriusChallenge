import { PrismaClient } from "@prisma/client";
import { MessageDTO, MessageInputDTO } from "../dto";
import { MessageRepository } from "./message.repository";

export class MessageRepoImpl implements MessageRepository{
    constructor (private readonly db: PrismaClient){}

    /*
    async create (data: MessageInputDTO): Promise <MessageDTO>{
        console.log(data);
        return await this.db.message
            .create({
                data
            })
            .then((message: MessageDTO)=> new MessageDTO(message))
    }*/

    async create(userId: string, to: string, content: string): Promise <MessageDTO>{
        console.log(userId, to, content);
        const message = await this.db.message.create({
            data:{
                from: userId,
                to,
                content
            }
        })

        return new MessageDTO(message)
    }

    async getChats(userId: string): Promise <MessageDTO[]>{
        const messages = await this.db.message.findMany({
            where: {
              OR: [
                {
                  from: userId
                },
                {
                  to: userId
                }
              ]
            },
            orderBy: {
              createdAt: 'desc'
            },
            distinct: ['from', 'to']
        })
        return messages.map((message: MessageDTO)=> new MessageDTO(message))
    }

    async getSingleChat (userId: string, to: string): Promise<MessageDTO[]>{
        const messages = await this.db.message.findMany({
            where: {
                OR: [
                    {
                        AND: [
                            {
                                from: userId
                            },
                            {
                                to
                            }
                        ]
                    },
                    {
                        AND: [
                            {
                                from: to
                            },
                            {
                                to: userId
                            }
                        ]
                    }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        })
        return messages.map((message: MessageDTO)=> new MessageDTO(message))
    }

}