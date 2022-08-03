import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const client = new PrismaClient();

const user = {
  name: 'Bundit Nuntates',
  role: 'admin',
  email: 'silkyland@gmail.com',
  password: bcrypt.hashSync('1234', 10),
};

client.user
  .create({ data: user })
  .then(() => {
    console.log('User created');
    client.$disconnect();
  })
  .catch((error) => {
    console.log(error);

    // exit
    process.exit(0);
  });
