import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    startingDate: {
        type: Date,
        required: true
    },
    endingDate: {
        type: Date,
        required: true
    },
    startingTime:{
        type: Date,
        required: true
    },
    endingTime:{
        type:Date,
        required:true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    locationUrl: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    ticketsAvailable: {
        type: Number,
        required: true,
        min: 0
    },
    ticketsSold: {
        type: Number,
        default: 0
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
        required: true
    },

    poster: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    tags: {
        type:String,
        trim:true,
    },
    
    ticketSellingDate: {
        type: Date,
        required: true
    },
   
},{timestamps:true});

const Event = mongoose.model('Event', eventSchema);

export default Event;