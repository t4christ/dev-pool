import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import {Profile} from '../../models/Profile'
import {User} from '../../models/User'
import {validateProfileInput} from '../../validation/profile';
import {validateExperienceInput} from '../../validation/experience';
import {validateEducationInput} from '../../validation/education';
export const profileRouter = express.Router();


//Load Profile mode;

//@route   GET api/users/test
//@desc     Tests profile route
//@access   Public

profileRouter.get('/test',(req,res)=>res.json(
{msg:"Profile works"}    
))


//@route   GET api/profile/all
//@desc     Get all profile 
//@access   Public

profileRouter.get('/all', (req,res)=>{
    const errors = {};
    Profile.find()
    .populate('user',['name','avatar'])
    .then(profiles => {
        if(!profiles){
            errors.noprofile = 'There are no profiles'
            return res.status(404).json(errors);
        }
      
        res.json(profiles);
    })
    .catch(err =>{
        console.log("am err",err)   
        res.status(404).json({profiles:'There are no profiles'})
    }
        )
})


//@route   GET api/profile/handle/:handle
//@desc     Get profile by handle
//@access   Public
 
profileRouter.get('/handle/:handle',(req,res)=>{
const errors = {}
Profile.findOne({handle: req.params.handle})
.populate('user', ['name','avatar'])
.then(profile =>{
    if(!profile){
        errors.noprofile = 'There is no profile for this user';
       return res.status(404).json(errors);
    }

    res.json(profile)
})
.catch(err => res.status(404).json(err))
});





//@route   GET api/profile/user/:user_id
//@desc     Get profile by User Id
//@access   Public
 
profileRouter.get('/user/:user_id',(req,res)=>{
    const errors = {}
    Profile.findOne({user: req.params.user_id})
    .populate('user', ['name','avatar'])
    .then(profile =>{
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
    
        res.json(profile)
    })
    .catch(err => res.status(404).json({profile:'There is no profile for this user'}))
    });




//@route   GET api/profile
//@desc     Get current user profile
//@access   Private

profileRouter.get('/',passport.authenticate('jwt',{session: false}), (req, res) =>{
const errors = {}

    Profile.findOne({user: req.user.id})
    .populate('user', ['name', 'avatar'])
.then(profile=>{
    if(!profile){
        errors.noprofile = 'There is no proifle for this user';
        return res.status(404).json(errors);
    }
    res.json(profile);
})
.catch(err => res.status(404).json(err))
});



//@route   POST api/profile
//@desc    Create or edit the user profile
//@access   Private

profileRouter.post('/',passport.authenticate('jwt',{session: false}), (req, res) =>{

    const {errors, isValid} = validateProfileInput(req.body);

    //Check Validation
    if(!isValid){
        //Return any erros with 400 status
        return res.status(400).json(errors);
    }

    //Get fields
    const profileFields ={}
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    //Skills - Split into array
    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',');
    }

    //Social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({user: req.user.id})
    .then(profile =>{
        if(profile){
            //Update
            Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields}, 
                {new: true})
                .then(profile=> res.json(profile))
        }else{
            //Create

            //Check if handle exists
            Profile.findOne({handle: profileFields.handle})
            .then(profile=>{
                if(profile){
                    errors.handle = 'That handle already exits';
                    res.status(400).json(errors);
                }

                //Save Profile
                new Profile(profileFields).save()
                .then(profile => res.json(profile))
            })
        }
    })
    });


//@route   POST api/profile/experience
//@desc    Add experience to profile 
//@access   Private

profileRouter.post('/experience',passport.authenticate('jwt', {session:false}),(req,res)=>{

    const {errors, isValid} = validateExperienceInput(req.body);

    //Check Validation
    if(!isValid){
        //Return any erros with 400 status
        return res.status(400).json(errors);
    }

    Profile.findOne({user: req.user.id})
.then(profile =>{
    const newExp = {
        title: req.body.title,
        company:req.body.company,
        location:req.body.location,
        from:req.body.from,
        to: req.body.to,
        current: req.body.current,
        description:req.body.description
    }

    //Add to exp array
    profile.experience.unshift(newExp);
    profile.save().then(profile=> res.json(profile))
})
})



//@route   POST api/profile/education
//@desc    Add education to profile 
//@access   Private

profileRouter.post('/education',passport.authenticate('jwt', {session:false}),(req,res)=>{

    const {errors, isValid} = validateEducationInput(req.body);

    //Check Validation
    if(!isValid){
        //Return any erros with 400 status
        return res.status(400).json(errors);
    }

    Profile.findOne({user: req.user.id})
.then(profile =>{
    const newEdu = {
        school: req.body.school,
        degree:req.body.degree,
        fieldofstudy:req.body.fieldofstudy,
        from:req.body.from,
        to: req.body.to,
        current: req.body.current,
        description:req.body.description
    }

    //Add to exp array
    profile.education.unshift(newEdu);
    profile.save().then(profile=> res.json(profile))
})
})


//@route   DELETE api/profile/experience/:exp_id
//@desc    Delete experience from profile
//@access   Private

profileRouter.delete('/experience/:exp_id',passport.authenticate('jwt', {session:false}),(req,res)=>{

    Profile.findOne({user: req.user.id})
.then(profile =>{
   
    //Get remove index
    const removeIndex = profile.experience
    .map(item => item.id)
    .indexOf(req.params.exp_id);

    //Splice out of array
    profile.experience.splice(removeIndex,1);

    //Save
    profile.save().then(profile=>res.json(profile))
})
.catch(err => res.status(404).json(err))
})


//@route   DELETE api/profile/education/:exp_id
//@desc    Delete education from profile
//@access   Private

profileRouter.delete('/education/:edu_id',passport.authenticate('jwt', {session:false}),(req,res)=>{

    Profile.findOne({user: req.user.id})
.then(profile =>{
   
    //Get remove index
    const removeIndex = profile.education
    .map(item => item.id)
    .indexOf(req.params.edu_id);

    //Splice out of array
    profile.education.splice(removeIndex,1);

    //Save
    profile.save().then(profile=>res.json(profile))
})
.catch(err => res.status(404).json(err))
})



//@route   DELETE api/profile/
//@desc    Delete user and  profile
//@access   Private

profileRouter.delete('/',passport.authenticate('jwt', {session:false}),(req,res)=>{
    Profile.findOneAndRemove({user: req.user.id})
    .then(()=>{
        User.findOneAndRemove({_id: req.user.id})
        .then(()=> res.json({success: true}))
    })
})
