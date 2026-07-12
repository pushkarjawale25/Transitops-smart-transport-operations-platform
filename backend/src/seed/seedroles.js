const mongoose=require("mongoose");

require("dotenv").config();

const Role=require("../models/Role");

const User=require("../models/User");

const connectDB=require("../config/db");

const roles=[

{

name:"Super Admin",

description:"System Administrator"

},

{

name:"Fleet Manager",

description:"Fleet Operations"

},

{

name:"Driver",

description:"Driver"

},

{

name:"Safety Officer",

description:"Safety"

},

{

name:"Financial Analyst",

description:"Finance"

}

];

const seed=async()=>{

await connectDB();

for(const role of roles){

const exists=await Role.findOne({

name:role.name

});

if(!exists){

await Role.create(role);

console.log(role.name+" Created");

}

}

let adminRole=await Role.findOne({

name:"Super Admin"

});

const adminExists=await User.findOne({

email:"admin@transitops.com"

});

if(!adminExists){

await User.create({

firstName:"System",

lastName:"Admin",

email:"admin@transitops.com",

password:"Admin@123",

role:adminRole._id,

phone:"9999999999"

});

console.log("Super Admin Created");

}

console.log("Database Seed Completed");

process.exit();

}

seed();