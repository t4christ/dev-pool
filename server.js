import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mdb from './config/db/keys';
import passport from 'passport';
import { userRouter, profileRouter, postRouter} from './routes/api';
const app = express();


// Connect to Mongodb
mongoose
.connect(mdb.mongoURI,{ useNewUrlParser: true })
.then(()=> console.log("mongodb connected"))
.catch(err => console.log(err))


//Passport Middleware
app.use(passport.initialize());

//Passport Config


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Use Routes
app.use('/api/users',userRouter);
app.use('/api/profile',profileRouter);
app.use('/api/posts',postRouter);


const port = process.env.PORT || 5000;

app.listen(port,()=> console.log(`server running on port ${port}`));
