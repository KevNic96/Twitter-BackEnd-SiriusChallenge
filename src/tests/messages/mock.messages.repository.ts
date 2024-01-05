import { MessageRepository } from "@domains/message/repository";
import { MessageDTO } from "@domains/message/dto";
import { MessageInputDTO } from "@domains/message/dto";

export class MockMessageRepo implements MessageRepository{
    private readonly mockMessages: MessageDTO[];

    constructor(mockMessages: MessageDTO[]){
        this.mockMessages = mockMessages;
    }

    async create (data: MessageInputDTO): Promise <MessageDTO>{
        const newMessage: MessageDTO = {
            id: `new_message_${this.mockMessages.length + 1}`, // Puedes generar un ID único de alguna manera
            from: data.from,
            to: data.to,
            content: data.content,
            createdAt: new Date(),
          };
      
          this.mockMessages.push(newMessage);
      
          return new Promise((resolve) => {
            // Simula la asincronía, como lo haría la operación real en la base de datos
            setTimeout(() => {
              resolve(newMessage);
            }, 0);
          });
        }

    async getChats(userId: string): Promise <MessageDTO[]>{
        // Filtra los mensajes donde el usuario es el remitente o el destinatario
    const chats = this.mockMessages.filter(
        (message) => message.from === userId || message.to === userId
      );
  
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(chats);
        }, 0);
      });
    }

    async getSingleChat(userId: string, to: string): Promise<MessageDTO[]>{
        // Filtra los mensajes para un solo chat entre el usuario y el destinatario
    const messages = this.mockMessages.filter(
        (message) =>
          (message.from === userId && message.to === to) ||
          (message.from === to && message.to === userId)
      );
  
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(messages);
        }, 0);
      });
    }
}