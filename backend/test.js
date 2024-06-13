import dotenv from 'dotenv';

dotenv.config();
console.log("Hello")
console.log(process.env.MONGO_URI); // This should print the MongoDB URI from the .env file
