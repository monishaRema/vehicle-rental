import { db } from "../../config/db";
import bcrypt from "bcryptjs"


const getUserByEmail = async (email:string) =>{
     const user = await db.query(`SELECT * FROM users WHERE email = $1`,[email])
     return user;
}


const userSignupService = async ( name:string, email:string, password:string, phone:string,role:string) =>{

    const hashedPassword = await bcrypt.hash(password as string, 10)
  
    const result = await db.query(`INSERT INTO 
        users (name,email,password,phone,role)
        VALUES($1,$2,$3,$4,$5)
        RETURNING id, name, email, phone, role
        `,[name,email,hashedPassword,phone,role])

    return result;
}
const authService = {
    getUserByEmail,
    userSignupService
}

export default authService;