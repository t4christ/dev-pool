import express from 'express';
import {User} from '../../models/User'
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import keys from '../../config/db/keys';
import passport from '../../config/passport';
import {validateRegisterInput} from '../../validation/register';
import {validateLoginInput} from '../../validation/login';
import * as emailController from "../../controllers/email.controller"
export const userRouter = express.Router();



//@route   GET api/users/test
//@desc     Tests users route
//@access   Public

userRouter.get('/test',(req,res)=>res.json(
{msg:"Users works"}    
))


//@route   GET api/users/register
//@desc     Register users route
//@access   Public

userRouter.post('/register',(req,res)=>{
const {errors, isValid} = validateRegisterInput(req.body);

// Check Validation
if(!isValid){
    
return res.status(400).json(errors);
}

User.findOne({email: req.body.email}).then(user =>{
 
    if(user){
            errors.email ='Email already exists';
            return res.status(400).json(errors);
        
    }else{
        const avatar = gravatar.url(req.body.email,{
            s:'200', //Size
            r:'pg', // Rating
            d: 'retro'
        },true);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            avatar,
            password: req.body.password,
        });

        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password,salt, (err,hash) => {
    
                if(err) {
                    console.log("My error")
                    return "Error";
                }
                newUser.password = hash;
                newUser.save()
                .then(user => res.json(user))
                .catch(err=>console.log(err))
            })
        })
    }
})
})


//@route   GET api/users/login
//@desc     Login users route / Returning Jwt Token
//@access   Public

userRouter.post('/login',(req,res) =>{
    const email = req.body.email;
    const password = req.body.password;
    const {errors, isValid} = validateLoginInput(req.body);

    // Check Validation
    if(!isValid){
    return res.status(400).json(errors);
    }



    // Find user by email
    User.findOne({email})
    .then(user =>{
        if(!user){
            
        errors.email ='User not found';
        return res.status(404).json(errors)
        }

        // Check password
        bcrypt.compare(password,user.password)
        .then(isMatch => {
            if(isMatch){
               //User Matched
                const payload = {id: user.id, name:user.name, avatar: user.avatar} // Create Jwt Payload
               //Sign Token
               jwt.sign(
                   payload,
                   keys.secretOrKey, 
                   {expiresIn: 3600}, 
                   (err, token)=>{
                    res.json({
                        success:200,
                        token: `Bearer ${token}` 
                    })
               })
            }else{
                errors.password = 'Password incorrect'
                return res.status(400).json(errors);
            }
        })
    })

})

//@route   GET api/users/current
//@desc     Return current user
//@access   Private

userRouter.get('/current',passport.authenticate('jwt',{session:false}), (req,res)=>{
    res.json({
        id:req.user.id,
        name: req.user.name,
        email: req.user.email
    });
})



userRouter.route("/forgot").post(emailController.sendPasswordResetEmail)
userRouter.route("/receive_new_password/:userId/:token")
.post(emailController.receiveNewPassword)
