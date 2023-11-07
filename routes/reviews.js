const express = require('express');
const router = express.Router( {mergeParams: true} );
const Review = require('../Models/reviews');
const reviews = require("../controllers/reviews");
const catchAsync = require('../utils/catchAsync');
const {  isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');





// post reviews route
router.post('/',  isLoggedIn, validateReview, isReviewAuthor, catchAsync(reviews.createReview));

// delete reviews route
router.delete('/:reviewId', isReviewAuthor, catchAsync(reviews.deleteReview));


// post reviews route for hairsalone
router.post('/', validateReview, catchAsync(async (req, res) => {
    const hair = await Hairsalone.findById(req.params.id);
    const review = new Review(req.body.review);
    hair.reviews.push(review);
    await review.save();
    await hair.save();
    res.redirect(`/hairsalone/${hair._id}`);
}))

// delete reviews route for hairsalone
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Hairsalone.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/hairsalone/${id}`);
}))



module.exports = router;