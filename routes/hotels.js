const express = require('express');
const router = express.Router();
const hotels = require("../controllers/hotels");
const catchAsync = require('../utils/catchAsync');
const {  isLoggedIn, validateHotel, isAuthor  } = require('../middleware');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// all hotels route 
// Router.route - to group together routes that belongs to the same path

router.route('/')
    .get(catchAsync(hotels.index))
    .post(isLoggedIn, upload.array('image'), validateHotel, catchAsync(hotels.createHotel))
 
  

// standalone route
router.get('/new', isLoggedIn, hotels.renderNewForm)


// Router.route - to group together routes that belongs to the same path
router.route('/:id')
    .get(catchAsync(hotels.showHotel))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateHotel, catchAsync(hotels.updateHotel))
    .delete(isLoggedIn, isAuthor, catchAsync(hotels.deleteHotel));


// standalone route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(hotels.renderEditForm))





module.exports = router;