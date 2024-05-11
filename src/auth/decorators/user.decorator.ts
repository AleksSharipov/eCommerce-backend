import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '@prisma/client';


// запросить данные юзера -имеил, логин и тд - то, что есть в таблице users
export const CurrentUser = createParamDecorator((data: keyof User, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const user = request.user;

  return data ? user[data] : user;
})