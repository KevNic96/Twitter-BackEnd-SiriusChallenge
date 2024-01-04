export class MessageDTO{
    constructor(message: MessageDTO){
        this.id = message.id
        this.content = message.content
        this.from = message.from
        this.to = message.to
        this.createdAt = message.createdAt
    }

    id: string
    content: string
    from: string
    to: string
    createdAt: Date
}

export class MessageInputDTO{
    constructor(message: MessageInputDTO){
        this.content = message.content
        this.from = message.from
        this.to = message.to
    }

    content: string
    from: string
    to: string
}