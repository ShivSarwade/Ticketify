import Event from "../models/event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValid, parse, addDays, parseISO, format } from "date-fns";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Organizer from '../models/organizer.model.js';
// Get all events
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find();
  if (!events) throw new ApiError(404, "no event found");
  res.status(200).json(new ApiResponse(200, events, "all events"));
});

export const getEventsByOrganiserId = asyncHandler(async (req, res) => {
  const { organiserId } = req.body;
  const events = await Event.find({ organizer: organiserId });
  if (!events) throw new ApiError(404, "no event found");
  res.status(200).json(new ApiResponse(200, events, "all events"));
});

export const getSecuredEventsByOrganiserId = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.organizer._id });
  res.status(200).json(new ApiResponse(200, events, "all events"));
});
// Get event by ID
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.body.id) } },
    {
      $lookup: {
        from: "organizers",
        localField: "organiser",
        foreignField: "_id",
        as: "organizerDetails",
      },
    },
    {
      $unwind: {
        path: "$organizerDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        category: 1,
        location: 1,
        startingDate: 1,
        endingDate: 1,
        startingTime: 1,
        endingTime: 1,
        price: 1,
        description: 1,
        poster: 1,
        organiser: {
          _id: "$organizerDetails._id",
          fullName: "$organizerDetails.fullName",
          avatar: "$organizerDetails.avatar",
        },
      },
    },
  ]);

  if (!event.length) throw new ApiError(404, "Event not found");
  res.status(200).json(new ApiResponse(200, event[0], "Event Details"));
});



export const getEventByLocation = asyncHandler(async (req, res) => { 
  try {
    const { location } = req.body;

    if (!location) throw new ApiError(400, "Location is required");

    console.log("📥 Received location:", location);

    const events = await Event.aggregate([
      {
        $match: {
          location: { $regex: new RegExp(location, "i") }, // Case-insensitive match
          startingDate: { $gt: new Date() }, // Only future events
        }
      },
      {
        $lookup: {
          from: "organizers",
          localField: "organizer",
          foreignField: "_id",
          as: "organizer"
        }
      },
      { $unwind: "$organizer" },
      {
        $project: {
          "organizer._id": 1,
          "organizer.fullName": 1,
          "organizer.avatar": 1,
          name: 1,
          description: 1,
          startingDate: 1,
          endingDate: 1,
          startingTime: 1,
          endingTime: 1,
          location: 1,
          locationUrl: 1,
          price: 1,
          ticketsAvailable: 1,
          ticketsSold: 1,
          poster: 1,
          category: 1,
          tags: 1,
          ticketSellingDate: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    console.log("📡 Query Result:", events.length ? events : "No events found");

    if (!events.length) throw new ApiError(404, "No future events found for this location");

    res.status(200).json(new ApiResponse(200, events, "events"));
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
    res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
});

export const searchEventsByNameOrLocation = asyncHandler(async (req, res) => {
  const { searchText } = req.body;

  if (!searchText) throw new ApiError(400, "Provide a search text");

  const events = await Event.aggregate([
    {
      $match: {
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { location: { $regex: searchText, $options: "i" } }
        ],
        startingDate: { $gt: new Date() } // Only future events
      }
    },
    {
      $lookup: {
        from: "organizers",
        localField: "organizer",
        foreignField: "_id",
        as: "organizer"
      }
    },
    { $unwind: "$organizer" },
    {
      $project: {
        "organizer._id": 1,
        "organizer.fullName": 1,
        "organizer.avatar": 1,
        name: 1,
        description: 1,
        startingDate: 1,
        endingDate: 1,
        startingTime: 1,
        endingTime: 1,
        location: 1,
        locationUrl: 1,
        price: 1,
        ticketsAvailable: 1,
        ticketsSold: 1,
        poster: 1,
        category: 1,
        tags: 1,
        ticketSellingDate: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  res.status(200).json(new ApiResponse(200, events, "events"));
});

export const getAllFutureEvents = asyncHandler(async (req, res) => {
  try {
    const events = await Event.aggregate([
      {
        $match: {
          startingDate: { $gt: new Date() }, // Only future events
        }
      },
      {
        $lookup: {
          from: "organizers",
          localField: "organizer",
          foreignField: "_id",
          as: "organizer"
        }
      },
      { $unwind: "$organizer" },
      {
        $project: {
          "organizer._id": 1,
          "organizer.fullName": 1,
          "organizer.avatar": 1,
          name: 1,
          description: 1,
          startingDate: 1,
          endingDate: 1,
          startingTime: 1,
          endingTime: 1,
          location: 1,
          locationUrl: 1,
          price: 1,
          ticketsAvailable: 1,
          ticketsSold: 1,
          poster: 1,
          category: 1,
          tags: 1,
          ticketSellingDate: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    console.log("📡 Query Result:", events.length ? events : "No future events found");

    if (!events.length) throw new ApiError(404, "No future events found");

    res.status(200).json(new ApiResponse(200, events, "events"));
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
    res.status(error.statusCode || 500).json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
});


export const createOrUpdateEvent = asyncHandler(async (req, res) => {
  const {
    eventId,
    name,
    description,
    startingDate,
    endingDate,
    startingTime,
    endingTime,
    location,
    locationUrl,
    price,
    ticketsAvailable,
    ticketSellingDate,
    tags,
    category,
  } = req.body;
  console.log(tags);
  if (!req.file) {
    throw new ApiError(400, "The Poster for event creation wasn't found");
  }
  const posterlocalpath = req.file.path;

  // ✅ Validate Required Fields (Excluding locationUrl & tags)
  const requiredFields = [
    name,
    description,
    startingDate,
    endingDate,
    startingTime,
    endingTime,
    location,
    price,
    ticketsAvailable,
    ticketSellingDate,
    category,
    posterlocalpath,
  ];

  if (
    requiredFields.some(
      (field) =>
        field == null || (typeof field === "string" && field.trim() === "")
    )
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // ✅ Merge Date and Time and Validate
  const parseDateTime = (dateObj, timeObj) => {
    dateObj = new Date(dateObj);
    timeObj = new Date(timeObj);
    return new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      timeObj.getHours() + 2,
      timeObj.getMinutes(),
      timeObj.getSeconds(),
      timeObj.getMilliseconds()
    );
  };

  const startDateTime = parseDateTime(startingDate, startingTime);
  const endDateTime = parseDateTime(endingDate, endingTime);
  const ticketSellingDateTime = parseISO(ticketSellingDate); // Direct ISO parsing
  const minStartDate = addDays(new Date(), 3);
  console.log(startDateTime, minStartDate);

  if (!eventId && startDateTime < minStartDate) {
    throw new ApiError(400, "Starting date must be at least 3 days from today");
  }

  // ✅ Ensure Ending Date-Time is after Starting Date-Time
  if (endDateTime <= startDateTime) {
    throw new ApiError(
      400,
      "Ending date/time must be after starting date/time"
    );
  }

  // ✅ Ensure Ticket Selling Date is before Starting Date
  if (ticketSellingDateTime >= startDateTime) {
    throw new ApiError(
      400,
      "Ticket selling date must be before the event start date"
    );
  }

  // ✅ Validate Ticket Price & Available Tickets
  if (price <= 50) {
    throw new ApiError(400, "Ticket price must be greater than 50");
  }

  if (ticketsAvailable <= 10) {
    throw new ApiError(400, "Tickets available must be greater than 10");
  }

  // ✅ Convert `tags` to an array only if provided
  const formattedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

  // ✅ Uploading image
  const poster = await uploadOnCloudinary(posterlocalpath);
  if (!poster.url) {
    throw new ApiError(400, "Error while uploading poster");
  }
  if (eventId) {
    const deletePreviousFile = await Event.findById(eventId);
    console.log(deletePreviousFile);

    if (deletePreviousFile.avatar) {
      const fileurl = deletePreviousFile.avatar.split("/").pop().split(".")[0];
      console.log(fileurl);
      const deletedfile = await deleteFromCloudinary(fileurl);
    }
  }
  console.log("works");

  if (eventId) {
    const event = await Event.findByIdAndUpdate(eventId, {
      organizer: req.organizer._id,
      category,
      name,
      description,
      startingDate,
      endingDate,
      startingTime,
      endingTime,
      location,
      locationUrl,
      price,
      ticketsAvailable,
      ticketSellingDate,
      tags,
      poster: poster.url,
    });
    const newEvent = await event.save();
    if (!newEvent)
      throw new ApiError(500, "Event not updated: Error in createEvent");

    res
      .status(201)
      .json(new ApiResponse(200, newEvent, "Event updated successfully"));
  } else {
    const event = await Event.create({
      organizer: req.organizer._id,
      category,
      name,
      description,
      startingDate,
      endingDate,
      startingTime,
      endingTime,
      location,
      locationUrl,
      price,
      ticketsAvailable,
      ticketSellingDate,
      tags,
      poster: poster.url,
    });
    const newEvent = await event.save();
    if (!newEvent)
      throw new ApiError(500, "Event not created: Error in createEvent");

    res
      .status(201)
      .json(new ApiResponse(200, newEvent, "New Event created successfully"));
  }
});


// Delete an event

export const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  console.log(req.body);
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json(new ApiError(404, "Event not found"));
  }

  await event.deleteOne(); // Deletes the event directly

  res.status(200).json({ message: "Event deleted successfully" });
});
