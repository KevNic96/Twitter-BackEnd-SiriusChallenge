import { UserViewDTO } from "@domains/user/dto";
import { MessageDTO } from "../dto";

export interface MessageService{
    newMessage: (userId: string, to: string, content: string) => Promise<MessageDTO>
    getChats: (userId: string) => Promise<UserViewDTO[]>
    getSingleChat: (userIdA: string, userIdB: string) => Promise <MessageDTO[]|Boolean>
}