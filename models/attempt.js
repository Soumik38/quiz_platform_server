const mongoose=require('mongoose')
const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:true,
    },marks:{
        type:Number,
        required:true
    },qualify:{
        type:Boolean,
        required:true
    },date:{
        type:Date,
        required:true
    }
})
const Attempts=mongoose.model('Attempt',userSchema)
module.exports=Attempts