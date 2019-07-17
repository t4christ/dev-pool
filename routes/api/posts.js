import express from 'express';
export const router = express.Router();


router.get('/test',(req,res)=>res.json(
{msg:"Posts works"}    
))
