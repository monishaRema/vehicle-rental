import dotenv from "dotenv";

import path from "path";


dotenv.config({path:path.join(process.cwd(),".env")})

const config = {
    port:process.env.PORT,
    jwt_secrete:process.env.JWT_SECRETE,
    db_secrete_str:process.env.NEON_DB_STR

}

export default config;