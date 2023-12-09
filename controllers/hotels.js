
const Hotel = require("../Models/Hotel");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = 'pk.eyJ1IjoiamFocnVsbzEiLCJhIjoiY2xvOHFwbXN4MDN1bDJwbG13emdsb3VhZCJ9.5VbVtf7OWaznB_-KLd_tKQ';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const moment = require('moment');



// this logic finds all the hotels from the database and renders it to the index page
module.exports.index = async (req, res) => {
    const hotels = await Hotel.find({});
    res.render('pages/index', { hotels });

}
  
module.exports.renderNewForm = (req, res) => {
    res.render('pages/new');
}

// export create new hotel to the router
// creates new hotel, author and saves it to the database, with a flash mssge on success then redirects to the hotels index page
module.exports.createHotel = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.hotel.location,
        limit: 1
    }).send()
    const hotel = new Hotel(req.body.hotel);
    hotel.geometry = geoData.body.features[0].geometry;
    hotel.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hotel.author = req.user._id;
    await hotel.save();
    console.log(hotel);
    req.flash('success', 'Successfully made a new hotel!');
    res.redirect(`/hotels/${hotel._id}`)
}

// export showhotel to the router
// displays one hotel by finding it by its id also populating it with the author and reviews
// if the hotel is not in the database display a flash msge on error and return to the hotels index page, else render the show page
module.exports.showHotel = async (req, res,) => {
    const hotel = await Hotel.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!hotel) {
        req.flash('error', 'Cannot find that hotel!');
        return res.redirect('/hotels');
    }
    res.render('pages/show', { hotel, moment: moment });
}


// export render edit form to the router
// from the database find the hotel by its id, if the hotel is not in the database display a flash mssge on error and return to the hotels index page, else render the edit page
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id)
    if (!hotel) {
        req.flash('error', 'Cannot find that hotel!');
        return res.redirect('/hotels');
    }
    res.render('pages/edit', { hotel });
}


// export update hotel to the router
// from the database find the hotel by its id and update it, flash mssge on success then redirect to the hotels index page
module.exports.updateHotel = async (req, res) => {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndUpdate(id, { ...req.body.hotel });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    hotel.images.push(...imgs);
    await hotel.save();
    req.flash('success', 'Successfully updated hotel!');
    res.redirect(`/hotels/${hotel._id}`)
}

// export deletehotel to the router 
// from the database find a hotel by its id and delete it , flash mggs on success then redirect to the hotels index page
module.exports.deleteHotel = async (req, res) => {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted hotel')
    res.redirect('/hotels');
}


