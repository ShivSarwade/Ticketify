import  Organizer  from "../models/organizer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const {accessToken} = req.body;
        console.log("Body",req.body)
        if (!accessToken) {
            throw new ApiError(401, "Unauthorized request");
        }
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        const organizer = await Organizer.findById(decodedToken?._id)
            .select("-password ")

        if (!organizer) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.organizer = organizer;
        next()
    }
    catch(error)
    {
        throw new ApiError(401,error?.error||"Invalid access token")
    }

})