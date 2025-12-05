import { Response } from "express";

export const sendError = (res:Response,errors:string,status:number) =>{
    res.status(status).json({
        success:false,
        errors,
     
    });

}


export const sendSuccess = (res:Response,message:string,status:number,data?:Record<string,unknown>) =>{
    res.status(status).json({
        success:true,
        message,
        data
    })
}