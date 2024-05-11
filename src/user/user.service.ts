import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  //получение юзера по айдишнику
  async byId(id: number) {
    //проверка 
    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      },
      include: {}

    })
  }

}