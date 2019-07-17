import express from 'express';
import mongoose from 'mongoose';
import mdb from './config/db/keys';
import users from './routes/api/users'
import profile from './routes/api/profile'
import posts from './routes/api/posts'

const app = express();

// Connect to Mongodb
mongoose
.connect(mdb.mongoURI,{ useNewUrlParser: true })
.then(()=> console.log("mongodb connected"))
.catch(err => console.log(err))


app.get('/',(req,res)=> res.send('Hello'));


//Use Routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);


const port = process.env.PORT || 5000;

app.listen(port,()=> console.log(`server running on port ${port}`));
