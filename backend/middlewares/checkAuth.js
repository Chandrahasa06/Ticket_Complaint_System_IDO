import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const checkAuth = async(req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return false;
    }
    try {
        const payload = await jwt.verify(token, JWT_SECRET);
        console.log(payload);
        // const user = await prisma.user.findUnique({
        //     where: {email: payload.email,}
        // })
        res.status(200).json({message: "Authenticated", userId: payload.userId});
        return true;
    }
    catch(e){
        res.status(500).json({message: "Internal Server Error"});
        console.log(e);
        return false;
    }

    return true;
}