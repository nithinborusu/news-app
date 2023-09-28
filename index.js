const express = require("express");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const passwordHash = require('password-hash'); // Import the password-hash library

const app = express();
const port = 3000;
const axios = require('axios');
var serviceAccount = require("./key.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth(); // Initialize Firebase Authentication
// set up ejs
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
// routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/signin", (req, res) => {
    res.render("signin");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/news", async (req, res) => {
    try {
        const apiKey = '8920e109711a4ba8914d83e1ed4640cc'; // Replace with your actual API key

        // Construct the news API endpoint with the API key as a query parameter
        const newsApiEndpoint = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

        // Fetch news data from the API
        const newsResponse = await axios.get(newsApiEndpoint);
        const newsData = newsResponse.data.articles;

        // Render the news page template with fetched news data
        res.render("news", { newsData });
    } catch (error) {
        res.status(500).send("An error occurred while fetching news");
    }
});

app.get("/search", async (req, res) => {
    try {
        const apiKey = '8920e109711a4ba8914d83e1ed4640cc'; // Replace with your actual API key
        const searchTerm = req.query.q; // Get the search term from query parameter

        // Construct the news API endpoint with the API key and search term
        const newsApiEndpoint = `https://newsapi.org/v2/everything?q=${searchTerm}&apiKey=${apiKey}`;

        // Fetch news data based on the search term
        const newsResponse = await axios.get(newsApiEndpoint);
        const newsData = newsResponse.data.articles;

        // Render the news page template with fetched news data
        res.render("news", { newsData, searchTerm });
    } catch (error) {
        res.status(500).send("An error occurred while fetching news");
    }
});

app.post("/signupSubmit", async (req, res) => {
    db.collection("users")
        .where("email", "==", req.body.email)
        .get()
        .then((docs) => {
            if (docs.size > 0) {
                res.send("The email already exists");
            } else {
                if (req.body.password !== req.body.confirmPassword) {
                    res.send("Passwords do not match");
                    return;
                }
                const hashedPassword = passwordHash.generate(req.body.password);
                db.collection("users")
                    .add({
                        name: req.body.username,
                        email: req.body.email,
                        password: hashedPassword,
                    })
                    .then(() => {
                        res.render("signin");
                    })
                    .catch(() => {
                        res.send("An error occurred while signing up");
                    });
            }
        });
});

app.post("/loginSubmit", function (req, res) {
    db.collection("users")
        .where("email", "==", req.body.email)
        .get()
        .then((docs) => {
            let verified = false;
            docs.forEach((doc) => {
                verified = passwordHash.verify(req.body.password, doc.data().password); // Compare hashed passwords
            });
            if (verified) {
                res.redirect("/news");
            } else {
                res.send("Login failed");
            }
        })
        .catch(() => {
            res.send("An error occurred while logging in");
        });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
