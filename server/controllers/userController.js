import userModel from "../models/userModel.js";
import bcrypt, { genSalt } from 'bcrypt'
import jwt from 'jsonwebtoken'

const registerUser= async (req,res)=> {
     
    try {
        const {name, email, password}= req.body
        if(!name || !email || !password) {
            return res.json({success: false, message : "Missing Details"})

        }
        
        const salt= await bcrypt.genSalt(10) // for password encryption
        const hashedPass = await bcrypt.hash(password, salt)
        
        const userData = {
            name,
            email,
            password : hashedPass
        } // here we have created a object to hold the data

        const newUser= new userModel(userData) // here the data has been sent to user model 
        const user= await newUser.save()
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

        res.json({success:true, token , user : {name : user.name}})
    } catch (error) {
        console.log(error) 
        res.json({success:false, message: error.message})
        
    }
}

const loginUser = async (req, res)=> {
    try {
        const {email, password}= req.body

        const user = await userModel.findOne({email})

        if(!user) {
            return res.json({success:false, message: "User not exists"})
        }

        const isMatched = await bcrypt.compare(password,user.password)

        if(isMatched) {
            const token= jwt.sign({id: user._id},process.env.JWT_SECRET) // it will generate a token using stored id 

            res.json({success:true,token, user : {name: user.name}})

        } else {
            return res.json({success:false, message:"Invalid Credentials"})
        }
    } catch (error) {
        console.log(error) 
        res.json({success:false, message: error.message})
        
    }
}

const userCredits =  async (req, res) => {
    try {
        const {id}= req.user // here we will create a middleware that will fetch userid and add it to body 

        const user= await userModel.findById(id)

        if(!user) {
            return res.json({success:false, message: "user not found"})
        }
        res.json({success:true, credits: user.creditBal, user : {name: user.name}})
    } catch (error) {
        console.log(error) 
        res.json({success:false, message: error.message})
    }

}

export {registerUser,loginUser,userCredits}