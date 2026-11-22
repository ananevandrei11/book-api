import { UsersModel } from './users.model';

describe('UsersModule', () => {
  it('should be defined', () => {
    expect(new UsersModel()).toBeDefined();
  });
});
