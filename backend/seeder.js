    import mongoose from "mongoose";
    import dotenv from 'dotenv';
    import colors from 'colors'
    import users from "./data/user";
    import products from "./data/products";
    import User from "./models/userSchema";
    import Product from "./models/productModel";
    import Order from "./models/orderModel";
    import connectDB from "./config/db";

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
                // return theproducts with user = adminUser id as ref Id in product schema
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

