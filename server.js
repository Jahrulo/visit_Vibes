

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressError = require('./utils/expressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');


// imported routes
const hotelsRoutes = require('./routes/hotels');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

const session = require('express-session');
const flash = require('connect-flash');
const user = require('./Models/user');
const MongoDBStore = require("connect-mongo");
// mongo atlas db for production
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/placeFinder';

// local mongodb for development 'mongodb://localhost:27017/placeFinder'
// connect to mongodb database
mongoose.connect( dbUrl);

// checks the connection 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// set the engine and view path
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// setting the app to use static files 
app.use(express.static(path.join(__dirname, 'public')));


// To remove data using these defaults:
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

// Create a configuration object for the session middleware.
const sessionConfig = {
    store: MongoDBStore.create({ mongoUrl: 'mongodb://localhost:27017/placeFinder' || process.env.DB_URL }),
    // Set the name for the session (cookie).
    name: 'session',
    
    // Define a secret key for session data encryption. This should be a strong secret.
    secret,
    
    // Configure whether to save the session data on each request (false in this case).
    resave: false,
    
    // Configure whether to save an uninitialized session (true in this case).
    saveUninitialized: true,
    
    // Configure options related to the session cookie.
    cookie: {
        // Set the 'httpOnly' flag to true to prevent client-side JavaScript access.
        httpOnly: true,
        
        // Optionally, you can enable the 'secure' flag to ensure the session cookie
        // is transmitted only over HTTPS. This line is currently commented out.
        // secure: true,
        
        // Set the expiration time for the session cookie in milliseconds (7 days in this case).
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        
        // Set the maximum age of the session cookie in milliseconds (7 days in this case).
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// Use the 'express-session' middleware with the provided session configuration.
app.use(session(sessionConfig));
app.use(flash());

// Define an array of script source URLs for Content Security Policy (CSP)
const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bs-custom-file-input/dist/bs-custom-file-input.js", // Content from this domain is allowed
    "https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js",       // Content from Mapbox is allowed
    "https://api.mapbox.com/",             // More Mapbox content is allowed
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js",            // Content from this domain is allowed
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js",
];

// Define an array of style source URLs for CSP
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css", // Content from this domain is allowed
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css",             // Mapbox content is allowed
    "https://api.tiles.mapbox.com/",       // More Mapbox content is allowed
   
];

// Define an array of connect source URLs for CSP
const connectSrcUrls = [
    "https://api.mapbox.com/",             // Connections to Mapbox are allowed
    "https://events.mapbox.com/",          // Connections to Mapbox events are allowed
];

// Define an empty array for font source URLs for CSP
const fontSrcUrls = [];

// Use the Helmet middleware to set Content Security Policy (CSP) for your app
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [], // No default sources allowed (restrictive CSP)
            connectSrc: ["'self'", ...connectSrcUrls], // Allow connections to specified sources
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls], // Allow scripts from specified sources and inline scripts
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls], // Allow styles from specified sources and inline styles
            workerSrc: ["'self'", "blob:"], // Allow web workers from self and blob URLs
            objectSrc: [], // No object sources allowed (restrictive CSP)
            imgSrc: [
                "'self'", // Images from the same origin are allowed
                "testing:",   // Blob data is allowed
                "data:",   // Data URLs are allowed
                "https://res.cloudinary.com/dxuxkx664/", // Cloudinary image service is allowed (replace 'yournamehere' with your Cloudinary account name)
                "https://images.unsplash.com/", // Images from Unsplash are allowed
                "https://media.digitalnomads.world/wp-content/uploads/2021/11/20114729/freetown-sierra-leone-digital-nomads.jpg",
            ],
            fontSrc: ["'self'", ...fontSrcUrls], // Allow fonts from self and additional specified sources
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
// use the local strategy and use the authentication method for the users schema
passport.use(new LocalStrategy(user.authenticate()));

// how to store it an unstore it
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// middleware on response locals erors
app.use((req, res, next) => {
    // set the user to the current user
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// other module routers
app.use('/', usersRoutes);
app.use('/hotels', hotelsRoutes);
app.use('/hotels/:id/reviews', reviewsRoutes);




// test route 
app.get('/', (req, res) => {
    res.render('home')
 
});



// error message middlewire
app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})

// error mssge and status code middlewire
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})



app.listen(3000, () => {
    console.log('Serving on port 3000')
});