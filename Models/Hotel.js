const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')

// set options to include toJSON virtuals in to the model's object
const opts = { toJSON: { virtuals: true } };

// database form fields
const HotelSchema = new Schema({
    title: String,
    images: [{
        url: String,
        filename: String
    }],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: String,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// a virtual that contains info that will be populated in to the database
// nest it in to the model DB/ or register a virtual property
HotelSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/hotels/${this._id}">${this.title}</a><strong>
    <h3>View</h3>`
});

// find one review and delete
HotelSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Hotel', HotelSchema);