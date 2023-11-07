const Review = require('../Models/reviews');
const Hotel = require('../Models/Hotel');


module.exports.createReview = async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    const review = new Review(req.body.review);
    //sets the reviewer name to the current username and save it
    review.author = req.user._id;
    hotel.reviews.push(review);
    await review.save();
    await hotel.save();
    res.redirect(`/hotels/${hotel._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Hotel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/hotels/${id}`);
}