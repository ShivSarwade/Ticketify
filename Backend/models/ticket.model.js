import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  scanned: { type: Boolean, default: false }, // Add scanned field
}, { timestamps: true });

export default mongoose.model("Ticket", ticketSchema);
