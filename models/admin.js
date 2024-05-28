const mongoose=require('mongoose')
const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },pass:{
        type:String,
        required:true,
    },token:{
        type:String
    }
})
const Admins=mongoose.model('Admin',userSchema)
module.exports=Admins