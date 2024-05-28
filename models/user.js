const mongoose=require('mongoose')
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
    },email:{
        type:String,
        required:true,
        unique:true
    },pass:{
        type:String,
        required:true,
    },attempts:{
        type:Number
    },token:{
        type:String
    }
})
const Users=mongoose.model('User',userSchema)
module.exports=Users