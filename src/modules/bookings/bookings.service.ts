import { db } from "../../config/db"

const createBookingsService = async() =>{

}

const getAllBookingsService = async() =>{

    return await db.query(`SELECT * FROM bookings`)

}

const getBookingByIdService = async(bookingId:number) =>{
    return await db.query(`SELECT * FROM bookings WHERE id = $1`,[bookingId])
}


const bookingsService = {
    getAllBookingsService,
    getBookingByIdService,
    createBookingsService
}

export default bookingsService;