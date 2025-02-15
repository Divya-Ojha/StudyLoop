import mongoose from "mongoose";
const usersSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String
}, { collection: 'Users' })
const Users=mongoose.model('Users',usersSchema)
export {Users}