import { Injectable, Logger } from '@nestjs/common';
import { User } from './user.entity';
import { UserCreateDto } from './dto/user.create.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor() {}

  async findAll(): Promise<User[]> {
    return User.find();
  }

  findOneById(id: number, role?: string): Promise<User> {
    const additionalOptions = role ? { role } : {};
    return User.findOneOrFail({ id, ...additionalOptions });
  }

  findOneByEmail(email: string): Promise<User | undefined> {
    return User.findOne({
      select: ['id', 'role', 'firstname', 'lastname', 'email', 'password', 'verified'],
      where: { email },
    });
  }

  findOneBySocialUid(provider: string, uid: string): Promise<User | undefined> {
    return User.findOne({
      select: ['id', 'role', 'firstname', 'lastname', 'email', 'password'],
      where: { [`${provider}Uid`]: uid },
    });
  }

  createAndSave(userCreateDto: UserCreateDto): Promise<User> {
    const newUser = User.create(userCreateDto);
    return User.save(newUser);
  }

  async addSocialUid(user: User, provider: string, uid: string): Promise<void> {
    user[`${provider}Uid`] = uid;
    await user.save();
  }

  async verify(user: User): Promise<void> {
    user.verified = true;
    user.confirmationToken = null;
    await user.save();
    this.logger.log(`User with id = ${user.id} successfully verified!`);
  }

  getInterviewers(): Promise<User[]> {
    return User.find({
      where: { role: 'interviewer' },
    });
  }

  getInterviewees(): Promise<User[]> {
    return User.find({
      where: { role: 'user' },
    });
  }
}
