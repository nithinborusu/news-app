const express = require("express");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase-admin/auth');

const app = express();
const port = 3000;
const axios = require('axios');
var serviceAccount = require("./key.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth(); // Initialize Firebase Authentication
//set up ejs
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
//routes
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


app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (password !== confirmPassword) {
        res.send("Passwords do not match");
        return;
    }

    try {
        await db.collection("users").add({
            name: username,
            email: email,
            password: password,
        });
        res.render("signin");
    } catch (error) {
        res.status(500).send("An error occurred while signing up");
    }
});

app.post("/loginSubmit", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  db.collection("users")
      .where("email", "==", email)
      .where("password", "==", password)
      .get()
      .then(function (docs) {
          if (docs.size > 0) {
              res.redirect("/news");
          }
          else {
              res.send("error");
          }
      })
});




app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
