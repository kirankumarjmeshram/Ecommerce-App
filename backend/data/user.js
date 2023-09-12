import bcrypt from 'bcryptjs';
const user = [
    // {
    //     name: `${process.env.NAME}`,
    //     email: `${process.env.EMAIL}`,
    //     password: bcrypt.hashSync(`${process.eventNames.PASS}`,10),
    //     isAdmin:true,
    // },
    {
        name: "kiran J ",
        email: "kiran@gmail.com",
        password: bcrypt.hashSync("123456",10),
        isAdmin:true,
    },
    {
        name: 'Test 1',
        email: 'test1@email.com',
        password: bcrypt.hashSync('123456', 10),
      },
      {
        name: 'Test 2',
        email: 'test2@email.com',
        password: bcrypt.hashSync('123456', 10),
      },
]

export default user;