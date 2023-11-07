// requiring cloudinary and multer storage cloudinary
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary config putting the actual creditentials from the account
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// setting the storage to cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'placefinder',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

// exporting for server use
module.exports = {
    cloudinary,
    storage
}