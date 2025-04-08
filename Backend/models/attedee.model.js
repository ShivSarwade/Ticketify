import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    }
}, {
    timestamps: true
});

const Attendee = mongoose.model('Attendee', attendeeSchema);

export default Attendee;