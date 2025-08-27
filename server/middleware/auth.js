import jwt from 'jsonwebtoken'


const userAuth = async (req, res, next) => {
    const {token}= req.headers

    if(!token) {
         return res.json({success:false, message:'Not Authorised. Please login again!'})
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET) //it verifies if this token relates with the provided jwt secret key

        if(tokenDecode.id) {
            req.user = {id:tokenDecode.id}
        } else {
            return res.json({success:false, message:'Not Authorised. Please login again!'})
        }

        next()
    } catch (error) { 
        res.json({success:false, message: error.message})
    }

}

export default userAuth