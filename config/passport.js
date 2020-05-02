import mongoose from 'mongoose';
import keys from './db/keys';
import passport from 'passport';
import {Strategy} from 'passport-jwt';
import {ExtractJwt} from 'passport-jwt';


const User = mongoose.model('users');

const opts = {};
opts['jwtFromRequest'] = ExtractJwt.fromAuthHeaderAsBearerToken();
opts['secretOrKey'] = keys.secretOrKey;



 passport.use(new Strategy(opts, (jwt_payload, done)=>{
     User.findById(jwt_payload.id)
     .then(user=>{
         if(user){
             return done(null,user);
         }
         return done(null,false)
     })
     .catch(err => console.log(err))
    }));



export default passport

