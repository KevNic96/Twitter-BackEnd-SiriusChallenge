import { MessageDTO,MessageInputDTO } from "../dto";

export interface MessageRepository{
    // create: (data: MessageInputDTO) => Promise<MessageDTO>
    create: (userId: string, to: string, content: string) => Promise<MessageDTO>
    getChats: (userId: string)=>Promise<MessageDTO[]>
    getSingleChat: (userId: string, to: string) => Promise<MessageDTO[]>
}
