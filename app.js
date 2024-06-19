// 1. npm init -y
// 2. npm i express
// 3. npm i ejs
// 4. npm i Mongoose
// 5. touch app.js
///// 6. npm i ejs-mate -> helpful for creating layouts(boilerPlate)

if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");

const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");





const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("Connected To DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};




app.use(session(sessionOptions));
app.use(flash());//routes se pehle use karna hai flash ko

//passport ko implement karenge session MW ke just baad
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//login ke baaf
passport.deserializeUser(User.deserializeUser());//logout ke baad





app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


/*
app.get("/demoUser", async ( req,res) => {
    let fakeUser = new User({
        email : "student@gmail.com",
        username : "deltaStudent",//passport ne khud automatically username add kia
    })

    //register(user,password,cb) -> static method, khud se sab kuch karega like username unique hai ki nhi
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});
//mongoose uses "pbkdf2" hashing algorithm
*/




app.use("/listings", listingRouter);//routes

app.use("/listings/:id/reviews", reviewRouter);
app.use("/" ,userRouter);



//reviews
//post review route


//Mongo $pull Operator
//removes from an existing array all instances of a value or values that match a specified condition

//delete review route










// app.get("/testListing",async (req,res) => {
//     let sampleTesting = new Listing({
//         title : "My new Villa",
//         description : "by the Beach",
//         price : 1200,
//         location : "Calangute,Goa",
//         country : "India"
//     });

//     await sampleTesting.save();
//     console.log("sample was saved");
//     res.send("Successful testing");
// });

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next) => {
    let {statusCode=500, message="Something went wrong!!"} = err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message });
    //res.send("Something Went Wrong");
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});


//Validation For Schema --> use JOI (npm i joi)