import Review from '../models/review.model.js';

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { eventId, ticketId, rating, comment } = req.body;
        if([eventId, ticketId , rating, comment].some(field => field.trim() === "" || field == null)){
            return res.status(400).send({message: "All fields are required"});
        }
        if(rating < 1 || rating > 5){
            return res.status(400).send({message: "Rating must be between 1 and 5"});
        }
        else if(comment.length > 300){  
            return res.status(400).send({message: "Comment must not exceed 300 characters"});
        }
        else if(Review.findById({userId: req.user._id})){
            return res.status(400).send({message: "You have already reviewed this event"});
        }
        const review = new Review({
            eventId, ticketId, userId : req.user._id, rating, comment
        });

        await review.save();
        res.status(201).send(review);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all reviews for an event
export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ eventId: req.body.eventId });
        res.status(200).send(reviews);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a single review by ID
export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.body.id);
        if (!review) {
            return res.status(404).send();
        }
        res.status(200).send(review);
    } catch (error) {
        res.status(500).send(error);
    }
};


// Delete a review by ID
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.body.id);
        if (!review) {
            return res.status(404).send();
        }
        res.status(200).send(review);
    } catch (error) {
        res.status(500).send(error);
    }
};