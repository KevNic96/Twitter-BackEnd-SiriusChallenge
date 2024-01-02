export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.isPrivate = user.isPrivate
    this.username = user.username
    this.name = user.name
    this.createdAt = user.createdAt
    this.profilePicture = user.profilePicture
  }

  id: string
  username: string
  isPrivate: boolean
  name: string | null
  createdAt: Date
  profilePicture: string | null
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.name = user.name
    this.password = user.password
    this.isPrivate = user.isPrivate
  }

  email!: string
  name: string | null
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
    this.isPrivate = user.isPrivate
  }

  id: string
  isPrivate: boolean
  name: string | null
  username: string
  profilePicture: string | null
}
