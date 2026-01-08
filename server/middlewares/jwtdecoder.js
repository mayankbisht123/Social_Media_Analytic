const jwt=require('jsonwebtoken');

const verifyUser=(req,res,next)=>{
    const authHeader=req.headers['authorization'];

    if(!authHeader || !authHeader.startsWith('Bearer '))
    {
        return (res.status(401).json({message:"Missing or malfunctioned token"}));
    }

    const token=authHeader.split(' ')[1];

    try {
        
        const decoded=jwt.verify(token,process.env.JWTKEY);
        req.userId=decoded.user.id;
        next();

    } catch (error) {
        res.status(500).json({error});
    }

}

module.exports=verifyUser;