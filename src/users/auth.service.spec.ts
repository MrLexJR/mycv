import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersServices: Partial<UsersService>;

  beforeEach(async () => {
    //Create a fake copy of the users service
    const users: User[] = [];

    fakeUsersServices = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersServices,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hased password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    try {
      await service.signup('asdf@asdf.com', 'asdf');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toBe('email already in use');
    }
  });

  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin('asdflkj@asdlka.com', 'pasasas');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('user not found');
    }
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('asasas@asadas.com', '1234');
    try {
      await service.signin('asasas@asadas.com', '1234');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('bad password');
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asas@asa.com', '1234');

    const user = await service.signin('asas@asa.com', '1234');
    expect(user).toBeDefined();
  });
});
