import fs from "fs/promises";
import sharp from "sharp";
import qrCodeReader from "qrcode-reader";
import { Jimp } from "jimp";
import Ticket from "../models/ticket.model.js";
import mongoose from "mongoose";
import Event from "../models/event.model.js"
export const scanTicket = async (req, res) => {
  console.log("I am here");

  try {
    if (!req.file) return res.json({ error: "No file uploaded" });

    console.log("File received:", req.file.path);

    // Convert image to PNG and grayscale for better detection, resize if necessary
    const processedImage = await sharp(req.file.path)
      .png()
      .greyscale()
      .resize(1024) // Resize for better processing
      .toBuffer(); // Wait until the image is fully processed

    // Convert buffer to Jimp format
    const jimpImage = await Jimp.read(processedImage); // Wait until the image is fully loaded into Jimp

    // Create QR Code reader instance
    const QrReader = new qrCodeReader();

    // Use Promise to handle the callback function more gracefully
    await new Promise((resolve, reject) => {
      QrReader.callback = async (error, result) => {
        if (error || !result) {
          console.error("QR Code not detected:", error);

          // Try deleting the file if QR code is not detected
          try {
            await fs.unlink(req.file.path);
            console.log("Image file deleted as no QR Code detected");
          } catch (deleteError) {
            console.error("Error deleting file:", deleteError);
          }

          return res.json({ error: "QR Code not detected" });
        }

        console.log("QR Code Scanned:", result.result);
        const ticketId = result.result.trim(); // Ensure no extra spaces

        try {
          // Check if ticket exists in the database
          const ticket = await Ticket.findById(ticketId);
          if (!ticket) return res.json({ error: "Ticket not found" });
          if (ticket.scanned) return res.json({ error: "Ticket already scanned" });

          // Mark the ticket as scanned
          ticket.scanned = true;
          await ticket.save();

          // Delete the image file after processing
          try {
            await fs.unlink(req.file.path);
            console.log("Image file deleted after processing");
          } catch (deleteError) {
            console.error("Error deleting file:", deleteError);
          }

          return res.json({ message: "Ticket scanned successfully", ticket });
        } catch (dbError) {
          console.error("Database error:", dbError);
          return res.json({ error: "Database error", details: dbError.message });
        }
      };

      // Process QR Code with Jimp
      QrReader.decode(jimpImage.bitmap);
    });
  } catch (error) {
    console.error("Error scanning ticket:", error.message);
    return res.json({ error: "Server error", details: error.message });
  }
};



/** PURCHASE TICKET */
export const purchaseTicket = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;
    const today = new Date().setHours(0, 0, 0, 0);

    const event = await Event.findById(eventId);
    if (!event) return res.json({ error: "Event not found" });

    const eventDate = new Date(event.startingDate).setHours(0, 0, 0, 0);

    if (today >= eventDate) {
      return res.json({ error: "Tickets cannot be purchased for past events" });
    }

    if (event.ticketsAvailable - event.ticketsSold < quantity) {
      return res.json({
        error: `Only ${
          event.ticketsAvailable - event.ticketsSold
        } tickets are available`,
      });
    }

    // Create ticket
    const ticket = await Ticket.create({
      userId: req.user._id,
      eventId,
      quantity,
      totalPrice: event.price * quantity,
    });

    // Atomically update ticketsSold to prevent incorrect totals
    await Event.updateOne(
      { _id: eventId },
      { $inc: { ticketsSold: quantity } }
    );

    // Fetch updated event details
    const updatedEvent = await Event.findById(eventId);

    res.json({
      message: "Ticket purchased successfully",
      ticket,
      eventDetails: updatedEvent,
    });
  } catch (error) {
    res.json({ error: "Server error", details: error });
  }
};
export const getMyTickets = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all tickets purchased by the user, along with event and organizer details
    const tickets = await Ticket.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $lookup: {
          from: "organizers", // Assuming "users" collection stores organizers
          localField: "event.organizer",
          foreignField: "_id",
          as: "organizer",
        },
      },
      { $unwind: "$organizer" }, // Get organizer details
      {
        $project: {
          _id: 1,
          quantity: 1,
          totalPrice: 1,
          scanned: 1,
          createdAt: 1,
          "event._id": 1,
          "event.name": 1,
          "event.description": 1,
          "event.startingDate": 1,
          "event.endingDate": 1,
          "event.startingTime": 1,
          "event.endingTime": 1,
          "event.location": 1,
          "event.locationUrl": 1,
          "event.price": 1,
          "event.ticketsAvailable": 1,
          "event.ticketsSold": 1,
          "event.organizer": 1,
          "event.poster": 1,
          "event.category": 1,
          "event.tags": 1,
          "event.ticketSellingDate": 1,
          "organizer.fullName": 1, // Added organizer's full name
          "organizer.avatar": 1, // Added organizer's avatar
        },
      },
    ]);

    // Check if no tickets are found
    if (!tickets.length) return res.json({ error: "No tickets found" });

    // Format tickets like the purchaseTicket response
    const formattedTickets = tickets.map((ticket) => ({
      ticket: {
        eventId: ticket.event._id,
        userId: userId,
        quantity: ticket.quantity,
        totalPrice: ticket.totalPrice,
        scanned: ticket.scanned,
        _id: ticket._id,
        createdAt: ticket.createdAt,
      },
      eventDetails: {
        _id: ticket.event._id,
        name: ticket.event.name,
        description: ticket.event.description,
        startingDate: ticket.event.startingDate,
        endingDate: ticket.event.endingDate,
        startingTime: ticket.event.startingTime,
        endingTime: ticket.event.endingTime,
        location: ticket.event.location,
        locationUrl: ticket.event.locationUrl,
        price: ticket.event.price,
        ticketsAvailable: ticket.event.ticketsAvailable,
        ticketsSold: ticket.event.ticketsSold,
        organizer: ticket.event.organizer,
        poster: ticket.event.poster,
        category: ticket.event.category,
        tags: ticket.event.tags,
        ticketSellingDate: ticket.event.ticketSellingDate,
        organizerDetails: {
          fullName: ticket.organizer.fullName,
          avatar: ticket.organizer.avatar,
        },
      },
    }));

    // Return the formatted tickets as an array
    res.json({ tickets: formattedTickets });
  } catch (error) {
    res.json({ error: "Server error", details: error });
  }
};

/** RETURN TICKET */
export const returnTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    console.log(req.body)
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.json({ error: "Ticket not found" });

    const event = await Event.findById(ticket.eventId);
    if (!event) return res.json({ error: "Event not found" });

    const today = new Date();
    const eventDate = new Date(event.startingDate);

    if (
      eventDate.toDateString() === today.toDateString() ||
      eventDate < today
    ) {
      return res.json({
        error: "Tickets cannot be returned on or after the event date",
      });
    }

    await Ticket.deleteOne({ _id: ticketId });

    event.ticketsSold -= ticket.quantity;
    await event.save();

    res.json({ message: "Ticket returned successfully" });
  } catch (error) {
    res.json({ error: "Server error", details: error });
  }
};
export const totalRevenue = async (req,res)=>{

}
/** GET SINGLE TICKET */
export const getTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(ticketId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $project: {
          _id: 1,
          eventId: "$event._id",
          eventName: "$event.name",
          eventDate: "$event.startingDate",
          location: "$event.location",
          quantity: 1,
          totalPrice: 1,
          scanned: 1,
          userName: "$user.name",
          userAvatar: "$user.avatar",
        },
      },
    ]);

    if (!ticket.length) return res.json({ error: "Ticket not found" });

    res.json({ ticket: ticket[0] });
  } catch (error) {
    res.json({ error: "Server error", details: error });
  }
};



/** SCAN TICKET */

/** GET USER'S TICKETS WITH EVENT DETAILS */
export const getUserTickets = async (req, res) => {
  try {
    const { userId } = req.body;

    const tickets = await Ticket.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" }, // Flatten the event array
      {
        $project: {
          _id: 1,
          quantity: 1,
          totalPrice: 1,
          createdAt: 1,
          scanned: 1,
          "event._id": 1,
          "event.name": 1,
          "event.startingDate": 1,
          "event.venue": 1,
          "event.availableTickets": 1,
          "event.ticketsSold": 1,
        },
      },
    ]);

    res.json({ tickets });
  } catch (error) {
    res.json({ error: "Server error", details: error });
  }
};
/** GET ALL TICKETS WITH TOTAL COUNT + USER INFO */
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $project: {
          _id: 1,
          eventId: "$event._id",
          eventName: "$event.name",
          eventDate: "$event.startingDate",
          location: "$event.location",
          quantity: 1,
          totalPrice: 1,
          fullName: "$user.fullName",
          userAvatar: "$user.avatar",
        },
      },
    ]);

    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);
    
    res.json({ tickets, totalTickets, totalRevenue });
  } catch (error) {
    res.json({ error: "Server error", details: error });
  }
};

/** GET SCANNED TICKETS WITH TOTAL COUNT + USER INFO */
export const getScannedTickets = async (req, res) => {
  try {
    const { userId } = req.body;

    const scannedTickets = await Ticket.aggregate([
      { $match: { userId: userId, scanned: true } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $project: {
          _id: 1,
          eventId: "$event._id",
          eventName: "$event.name",
          eventDate: "$event.startingDate",
          location: "$event.location",
          quantity: 1,
          totalPrice: 1,
          userName: "$user.name",
          userAvatar: "$user.avatar",
        },
      },
    ]);

    const totalScannedTickets = scannedTickets.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0
    );

    res.json({ scannedTickets, totalScannedTickets });
  } catch (error) {
    res.json({ error: "Server error", details: error });
  }
};
/** GET LOGGED-IN USER'S PURCHASED TICKETS */


export const getTicketsByEventId = async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const objectIdEventId = new mongoose.Types.ObjectId(eventId);

    // Step 1: Fetch event details (to get total available tickets)
    const event = await Event.findOne({ _id: objectIdEventId });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }


    // Step 2: Fetch ticket transactions for this event
    const tickets = await Ticket.aggregate([
      { $match: { eventId: objectIdEventId } }, // Filter by eventId
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          eventId: 1,
          quantity: 1,
          totalPrice: 1,
          fullName: { $ifNull: ["$user.fullName", "Unknown User"] },
          userAvatar: { $ifNull: ["$user.avatar", "default-avatar.jpg"] },
          phoneNo: { $ifNull:["$user.phoneNo","no phone no received"]},
          scanned:1
        },
      },
    ]);

    

    // Step 3: Calculate total revenue and tickets sold
    const totalTicketsSold = event.ticketsSold
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);
    const remainingTickets = event.ticketsAvailable - event.ticketsSold;

    res.json({
      eventId,
      eventName: event.name,
      eventDate: event.startingDate,
      location: event.location,
      totalRevenue,
      totalTicketsSold,
      remainingTickets: remainingTickets < 0 ? 0 : remainingTickets, // Ensure it's not negative
      transactions: tickets, // List of all transactions
    });

  } catch (error) {
    console.error("Error fetching event ticket stats:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};


