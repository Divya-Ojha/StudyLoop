import mongoose from "mongoose";
const usersSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    ratings:{type:Number,default:0},
    reviews:{type:Number,default:0},
    subject:String,
    slots: {
        type: [
          {
            day: String,
            time: String,
            isBooked: { type: Boolean, default: false }
          }
        ],
        default: [
          { day: "Monday", time: "10:00 AM - 11:00 AM", isBooked: false },
          { day: "Wednesday", time: "2:00 PM - 3:00 PM", isBooked: false },
          { day: "Friday", time: "5:00 PM - 6:00 PM", isBooked: false }
        ]
      }
}, { collection: 'Users' })
const Users=mongoose.model('Users',usersSchema)
export {Users}