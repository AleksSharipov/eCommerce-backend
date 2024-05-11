import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


// для того, чтобы токен мог запросить только авторизованный пользователь
export const Auth = () => UseGuards(AuthGuard('jwt'));