import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import { Post } from '../../models/Post' 
import { validatePostInput } from '../../validation/post';
import { Profile } from '../../models/Profile';
export const postRouter = express.Router();


//@route   GET api/posts/test
//@desc     Tests post route
//@access   Public


postRouter.get('/test',(req,res)=>res.json(
{msg:"Posts works"}    
))


//@route   GET api/posts
//@desc     GET Posts
//@access   Public

postRouter.get('/',(req,res) =>{
    Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostsfound:'No post with that id exists'}));
})


//@route   GET api/posts/:id
//@desc     GET Post by id
//@access   Public

postRouter.get('/:id',(req,res) =>{
    Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostfound:'No post with that id exists'}));
})


//@route   DELETE api/posts/:id
//@desc    Delete Post 
//@access   Private

postRouter.delete('/:id', passport.authenticate('jwt', {session: false}), (req,res) =>{
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post =>{
            //Check for post owner
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({notauthorized: 'User not authorized'})
            }

            //Delete
            post.remove().then(() => res.json({ success: true}));
        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}))
    })
})




//@route   POST api/posts
//@desc     Create Post
//@access   Private

postRouter.post('/',passport.authenticate('jwt', {session:false}),(req,res)=>{
   const {errors, isValid} = validatePostInput(req.body);

   //Check Validation
   if(!isValid){
    // If any erros. send 400 with erros object
    return res.status(400).json(errors);
   }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.user.avatar,
        user: req.user.id
    }) 

    newPost.save().then(post => res.json(post))
})


//@route   POST api/posts/like/:id
//@desc    Like post
//@access   Private

postRouter.post('/like/:id', passport.authenticate('jwt', {session: false}), (req,res) =>{
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post =>{
           if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
               return res.status(400).json({alreadyliked: 'User already likes this post'})
           }
           // Add user id to likes array
           post.likes.unshift({user: req.user.id})
           post.save().then(post => res.json(post));


        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}))
    })
})


//@route   POST api/posts/unlike/:id
//@desc    Unlike post
//@access   Private

postRouter.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req,res) =>{
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post =>{
           if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
               return res.status(400).json({notliked: 'You have not yet liked this post'})
           }
           // Get the remove inded
           const removeIndex = post.likes
           .map(item => item.user.toString())
           .indexOf(req.user.id)

           //Splice out of array
           post.likes.splice(removeIndex, 1);

           //Save
           post.save().then(post => res.json(post));


        })
        .catch(err => res.status(404).json({postnotfound: 'No post found'}))
    })
})


//@route   POST api/posts/comment/:id/
//@desc    Add comment post
//@access   Private

postRouter.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req,res)=>{
    const {errors, isValid} = validatePostInput(req.body);

   //Check Validation
   if(!isValid){
    // If any erros. send 400 with erros object
    return res.status(400).json(errors);
   }
    Post.findById(req.params.id)
    .then(post =>{
        const newComment ={
            text: req.body.text,
            name: req.body.name,
            avatar:req.body.avatar,
            user: req.user.id
        }

        //Add to comments array
        post.comments.unshift(newComment);

        //Save
        post.save().then(post => res.json(post))
       
    })
    .catch(err => res.status(404).json({postnotfound: 'No post found'}))
})




//@route   DELETE api/posts/comment/:id/:comment_id
//@desc    Remove comment from post
//@access   Private

postRouter.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req,res)=>{
    Post.findById(req.params.id)
    .then(post =>{
  
        //Check to see if comment exists
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
            return res.status(404).json({commentnotexists: 'Comment does not exist'});
        }

        //Get remove index
        const removeIndex = post.comments.map(item => item._id.toString())
        .indexOf(req.params.comment_id);

        //Splice comment out of the array
        post.comments.splice(removeIndex, 1)

        post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({postnotfound: 'No post found'}))
})