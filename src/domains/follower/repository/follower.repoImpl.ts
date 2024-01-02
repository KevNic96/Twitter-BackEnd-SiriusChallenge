import { PrismaClient } from "@prisma/client";

import { FollowerRepo } from ".";
import { FollowerDTO } from "../dto";

export class FollowerRepoImpl implements FollowerRepo{ // Declara la clase que implementa la interfaz 'FollowerRepo'
    constructor (private readonly db: PrismaClient){}

    async create (followerId: string, followedId: string): Promise<FollowerDTO>{ // Implementa el metodo 'create' que toma los identificadores 'followerId' y 'followedId' como argumentos.
        const follow = await this.db.follow.create({ // Utiliza prisma para crear una nueva entrada en la tabla 'follow' con los identificadores dados
            data: {
                followerId,
                followedId
            }
        })
        return new FollowerDTO(follow) //Retorna una nueva instancia de 'FollowerDTO' creada a partir del resultado de la operacion de creacion
    }

    async delete (followId: string): Promise <void>{ // Implementa el metodo 'delete' que toma el identificador 'followId' como argumento
        await this.db.follow.delete({ // Utiliza Prisma para eliminar la entrada en la tabla ' follow' con el identificador dado.
            where: {
                id: followId,
            }
        })
    }

    async getById(followerId: string, followedId: string): Promise<FollowerDTO|null>{ //Implementa el metodo 'GetById' que toma los identificadores 'followerId' y 'followedId' como argumentos.
        const follow = await this.db.follow.findFirst({ // Utiliza prisma para buscar la entrada correspondiente en la tabla 'follow'
            where: {
                followerId,
                followedId
            }
        })
        return follow!=null ? new FollowerDTO(follow):null //Retorna una instancia de 'FollowerDTO' si se encuentra la relacion de seguimiento, o 'null' si no se encuentra.
    }

    async getFollowers(userId: string): Promise <FollowerDTO[]>{ // Imaplementa el metodo 'GetFollowers' que toma el identificador 'userId' como argumento
        const followers = await this.db.follow.findMany({ // Utiliza Prisma para buscar todas las entradas en la tabla 'follow' donde el 'followedId' coincida con el 'userId'
            where:{
                followedId: userId
            }
        })
        return followers.map((follower: FollowerDTO)=> new FollowerDTO(follower)) // Retorna un array de intancias de 'FollowerDTO' creado a partir de los resultados
    }

    async getFollows (userId: string): Promise<FollowerDTO[]>{ //Implementa el metodo 'getFollows' que toma el identificador 'userId' como argumento.
        const follows = await this.db.follow.findMany({ //Utiliza Prisma para buscar todas las entradas en la tabla 'follow' donde el 'followerId' coincida con el 'userId'
            where: {
                followerId: userId
            }
        })
        return follows.map((follow: FollowerDTO) => new FollowerDTO(follow)) // Retorna un array de instancias de 'FollowerDTO' creado a partir de los resultados
    }

}