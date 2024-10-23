    import mongoose from "mongoose";
    import dotenv from 'dotenv';
    import colors from 'colors'
    import users from "./data/user.js";
    import products from "./data/products.js";
    import User from "./models/userModel.js";
    import Product from "./models/productModel.js";
    import Order from "./models/orderModel.js";
    import connectDB from "./config/db.js";

    dotenv.config();

    connectDB();

    const importData = async () =>{
        try{
            await Order.deleteMany();
            await Product.deleteMany();
            await User.deleteMany();

            const createUser = await User.insertMany(users);
            // get Id of the user
            const adminUser = createUser[0]._id;

            const sampleProducts = products.map((product)=>{
                return {...product, user:adminUser};
            });
            await Product.insertMany(sampleProducts);

            console.log('Data Imported'.green.inverse)
            //end the process without any kind of failure
            process.exit();
        } catch(error){
            console.error(`${error}`.red.inverse);
            process.exit(1);
        }
    };

    const destroyData = async () => {
        try{
            await Order.deleteMany();
            await User.deleteMany();
            await Product.deleteMany();

            console.log(`Data Destroyed`.red.inverse);
            process.exit();
        }catch(error){
            console.error(`${error}`.red.inverse);
            process.exit(1);
        }
    };

    if(process.argv[2] === '-d'){
        destroyData();
    }else{
        importData();
    }

//console.log(process.argv[2]) 
// node backend/seeder -d => return = [
//     'C:\\Program Files\\nodejs\\node.exe',
//     'C:\\Users\\Redmi\\Documents\\GitHub\\Ecommerce-App\\backend\\seeder',
//     '-d'
//   ]
// therefore if(process.argv[2] === '-d') ie d will be 2nd index
// if we do node backend/seeder -d -h then h will be 3rd index ans so on
