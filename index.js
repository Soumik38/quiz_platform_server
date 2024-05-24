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
const Users=require('./models/users')


app.post('/signup',async (req,res)=>{
    try {
        const { name, email, pass } = req.body
        const alreadyExists = await Users.findOne({ email })
        if (alreadyExists) {
            res.json('exists')
        }
        else {
            const newUser = new Users({ name, email ,pass})
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
        const{email,pass}=req.body
        const check=await Users.findOne({email:email})
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
        const newQ = new Questions({title,options:[ans1,ans2,ans3,ans4],correctans})
        newQ.save()
        res.json('success')
    }
    catch (error) {
        console.log(error)
    }
})

app.get('/start',async (req,res)=>{
    const randQuestions = await Questions.aggregate([
        { $sample: { size: 2 } }
    ]);

    res.json(randQuestions)
})

app.get('/user/:email', async (req, res) => {
    try{
        const email = req.params.email
        const user = await Users.findOne({ email })
  
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        res.json({ name: user.name })
    } catch (error) {
        console.error('Error fetching user by email:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

const port = process.env.PORT || 4000
server.listen(port, () => {
    console.log(`http://localhost:${port}`)
})