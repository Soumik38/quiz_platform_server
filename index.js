const express=require('express')
const app = express()
const cors=require('cors')
const server=require('http').createServer(app)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
require('./database/connection')

app.get('/',(req,res)=>{
    res.send('Backend')
})

const Questions=require('./models/question')
const Users=require('./models/user')
const Attempts=require('./models/attempt')
const Admins = require('./models/admin')

app.post('/signup',async (req,res)=>{
    try {
        const { name, email, pass } = req.body
        const alreadyExists = await Users.findOne({ email })
        if (alreadyExists) {
            res.json('exists')
        }
        else {
            const newUser = new Users({ name, email ,pass,attempts:0})
            newUser.save()
            res.json('notexists')
        }
    }
    catch (error) {
        console.log(error)
        res.json('notexists')
    }
})

app.post('/signin',async (req,res)=>{
    
    try{
        // console.log(req.body)
        const{email,pass,adminChecked}=req.body
        console.log(adminChecked)
        let check=null
        if(adminChecked===true){
            check=await Admins.findOne({email:email})
        }else{
            check=await Users.findOne({email:email})
        }
        // console.log(check)
        if(check){
            if(check.pass===pass){
                res.json('authorize')
            }else{
                res.json('wrongpass')
            }
        }else{
            res.json('notexists')
        }
    }catch(e){
        res.json('notexists')
    }
  })

app.post('/addq',async(req,res)=>{
    
    try {
        const {title,ans1,ans2,ans3,ans4,correctans}=req.body
        let newAns=correctans-1
        const newQ = new Questions({title,options:[ans1,ans2,ans3,ans4],correctans:newAns})
        newQ.save()
        res.json('success')
    }
    catch (error) {
        console.log(error)
    }
})

app.post('/deleteq',async(req,res)=>{
    try{
        const {id}=req.body
        await Questions.deleteOne({_id:id})
        res.json('success')
    }catch (error){
        console.log(error)
    }
})

app.post('/attempt',async(req,res)=>{
    try{
        const {email,marks,qualify,date}=req.body
        console.log(req.body)
        const newAttempt = new Attempts({email,marks,qualify,date})
        Users.updateOne({email:email},{$set:{attempts:(attempts+1)}})
        newAttempt.save()
        res.json('success')
    }catch(e){
        console.log(e)
    }
})

app.get('/get_attempts/:email',async(req,res)=>{
    const email=req.params.email
    
    const attempt_arr=await Attempts.find({email:email})
    res.json(attempt_arr)
})

app.get('/start',async (req,res)=>{
    const randQuestions = await Questions.aggregate([
        { $sample: { size: 10 } }
    ]);

    res.json(randQuestions)
})

app.get('/user/:email', async (req, res) => {
    try{
    
        const email = req.params.email
        
        const findUser = await Users.findOne({ email:email })
        
        if (!findUser) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        res.json({ name: findUser.name })
    } catch (error) {
        console.error('Error fetching user by email:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.get('/all_users', async (req, res) => {
    const users = await Users.find({})
    // console.log(users)
    res.json(users)
})

app.get('/all_questions',async (req, res) => {
    const all_questions = await Questions.find({})
    // console.log(all_questions)
    res.json(all_questions)
    
})
    
const port = process.env.PORT || 4000
server.listen(port, () => {
    console.log(`http://localhost:${port}`)
})