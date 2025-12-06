import { db } from "../../config/db";
import bcrypt from "bcryptjs";
import config from "../../config";
import jwt from "jsonwebtoken";

const getUserByEmail = async (email: string) => {
  const user = await db.query(
    `SELECT id, name, email, phone, role, created_at FROM users WHERE email = $1`,
    [email]
  );
  return user;
};

const getUserByEmailWithPass = async (email: string) => {
  const user = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return user;
};

const userSignupService = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  role: string
) => {
  const hashedPassword = await bcrypt.hash(password as string, 10);

  const result = await db.query(
    `INSERT INTO 
        users (name,email,password,phone,role)
        VALUES($1,$2,$3,$4,$5)
        RETURNING id, name, email, phone, role
        `,
    [name, email, hashedPassword, phone, role]
  );

  return result;
};

const userSignInService = async (email: string, password: string) => {
  const existingUser = await getUserByEmailWithPass(email);

  // invalid email – no user found
  if (existingUser.rowCount === 0) {
    return {
      status: 401,
      message: `No user found with this email ${email}`,
    };
  }

  const currentUser = existingUser.rows[0];
  const hashedPass = currentUser.password;

  const checkPassword = await bcrypt.compare(password, hashedPass);

  // wrong password
  if (!checkPassword) {
    return {
      status: 403,
      message: "Incorrect password",
    };
  }

  const token = jwt.sign(
    {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
    },
    config.jwt_secrete as string,
    { expiresIn: "7d" }
  );

  return {
    status: 200,
    message: "Login successful",
    data: {
      token,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role,
      },
    },
  };
};

const authService = {
  getUserByEmail,
  userSignupService,
  userSignInService,
};

export default authService;
