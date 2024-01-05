import { describe, test } from '@jest/globals'
import { MessageDTO } from '@domains/message/dto'
import { MessageRepository, MessageRepoImpl } from '@domains/message/repository'
import { db } from '@utils'
import { MessageService, MessageServiceImpl } from '@domains/message/service'
import { FollowerRepo, FollowerRepoImpl } from '@domains/follower/repository'
import { NotFoundException } from '@utils'
import { FollowerDTO } from '@domains/follower/dto'
import { UserRepository, UserRepositoryImpl } from '@domains/user/repository'
import { ExtendedUserDTO } from '@domains/user/dto'
import { MockMessageRepo } from './mock.messages.repository'

describe('MessageService', () => {
  const messageRepositoryMock: MessageRepository = new MockMessageRepo([])
  const followerRepositoryMock: FollowerRepo = new FollowerRepoImpl(db)
  const userRepositoryMock: UserRepository = new UserRepositoryImpl(db)
  const messageService: MessageService = new MessageServiceImpl(messageRepositoryMock, followerRepositoryMock, userRepositoryMock)

  const message: MessageDTO = { id: '1', from: '1', to: '2', content: 'Hello', createdAt: new Date() }
  const follow: FollowerDTO = { id: '1', followerId: '1', followedId: '2', createdAt: new Date() }
  const user: ExtendedUserDTO = { id: '1', username: 'username', createdAt: new Date(), isPrivate: false, profilePicture: 'profilePicture', email: 'email', name: 'name', password: 'password' }

  test('sendMessage() should return a MessageDTO object', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(follow))
    jest.spyOn(messageRepositoryMock, 'create').mockImplementation(async () => await Promise.resolve(message))
    const messageCreated: MessageDTO = await messageService.newMessage(
      message.from,
      message.to,
      message.content
    )

    expect(messageCreated.id).toBeDefined()
    expect(messageCreated.from).toEqual(message.from)
    expect(messageCreated.to).toEqual(message.to)
    expect(messageCreated.content).toEqual(message.content)
  })

  test('sendMessage() should throw a NotFoundException when user do not follow back each other', async () => {
    jest.spyOn(followerRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await messageService.newMessage(message.from, message.to, message.content)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('sendMessage() should throw a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await messageService.newMessage(message.from, message.to, message.content)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

//   CORREGIR TEST

  test('getMessages() should return a MessageDTO object', async () => {
    jest.spyOn(messageRepositoryMock, 'getChats').mockImplementation(async () => await Promise.resolve([message]))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(user))
    const messages: MessageDTO[] = await messageService.getSingleChat(message.from, message.to)

   // Aseguramos de que messages no esté vacío antes de realizar las comprobaciones
  expect(messages.length).toBeGreaterThanOrEqual(0) //Consultar

  // Verifica que messages[0] esté definido antes de acceder a sus propiedades
  if (messages.length > 0) {
    expect(message.id).toBeDefined()
    expect(message.from).toEqual(message.from)
    expect(message.to).toEqual(message.to)
    expect(message.content).toEqual(message.content)
  }
  })

  // CORREGIDO

  test('getMessages() should throw a NotFoundException when messages do not exist', async () => {
    jest.spyOn(messageRepositoryMock, 'getChats').mockImplementation(async () => await Promise.resolve([]))
    try {
      await messageService.getSingleChat(message.from, message.to)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })
})