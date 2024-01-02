import { MessageDTO,MessageInputDTO } from "../dto";

export interface MessageRepository{
    create: (data: MessageInputDTO) => Promise<MessageDTO>
    getChats: (userId: string)=>Promise<MessageDTO[]>
    getSingleChat: (userId: string, to: string) => Promise<MessageDTO[]>
}
