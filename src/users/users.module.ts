import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModel, UsersSchema } from './model/users.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PasswordHasher } from '@nestjs/authentication';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UsersModel.name,
        schema: UsersSchema,
        collection: 'users',
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, PasswordHasher],
  exports: [UsersService],
})
export class UsersModule {}
