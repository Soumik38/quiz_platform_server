const mongoose=require('mongoose')
const userSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },options:{
        type:[String],
        required:true
    },correctans:{
        type:Number,
        required:true
    }
})
const Questions=mongoose.model('Question',userSchema)
module.exports=Questions