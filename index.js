const express=require('express')
const app = express()
const cors=require('cors')
const jwt=require('jsonwebtoken')
require('dotenv').config()

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
            res.json({auth:'exists'})
        }
        else {
            const newUser = new Users({ name, email ,pass,attempts:0})
            
            jwt.sign({newUser},process.env.SECRET_KEY, { expiresIn: '2d' },(err, token) => {
                if(err) { console.log(err) }  
                console.log(token)
                res.json({auth:'notexists',token:token})
            })
            newUser.save()

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
        let check=null
        if(adminChecked===true){
            check=await Admins.findOne({email:email})
        }else{
            check=await Users.findOne({email:email})
        }
        // console.log(check)
        if(check){
            if(check.pass===pass){
                // res.json('authorize')
                jwt.sign({check},process.env.SECRET_KEY, { expiresIn: '2d' },(err, token) => {
                    if(err) { console.log(err) }  
                    console.log(token)
                    res.json({auth:"authorize",token:token})
                })
            }else{
                res.json({auth:'wrongpass'})
            }
        }else{
            res.json({auth:'notexists'})
        }
    }catch(e){
        res.json(e)
    }
  })



  function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
    } else {
      res.sendStatus(403);
    }
  }
  app.get('/checktoken',verifyToken, (req, res) => { //verify the JWT token generated for the user
    jwt.verify(req.token, process.env.SECRET_KEY , (err, authorizedData) => {
        // console.log(req.token)
        if(err){
            console.log(err)
            res.json({
                message:false
            })
        } else {
            res.json({
                message:true
            })

        }
    })
});






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
        // console.log(req.body)
        const newAttempt = new Attempts({email,marks,qualify,date})
        
        await Users.updateOne({email:email},{$inc:{attempts:1}})
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