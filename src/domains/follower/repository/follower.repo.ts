import { FollowerDTO } from "../dto";

export interface FollowerRepo{ //Define una interfaz que actúa como contrato para la interacción con la capa de persistencia relacionada con los seguidores.

    create: (followerId: string, followedId:string) => Promise <FollowerDTO>
    delete: (followId: string) => Promise <void>
    getById: (followerId: string, followedId: string) => Promise <FollowerDTO|null>
    getFollowers: (userId: string) => Promise <FollowerDTO[]>
    getFollows: (userId: string) => Promise <FollowerDTO[]>
}