const express = require("express");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase-admin/auth');

const app = express();
const port = 3000;

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

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/signin", (req, res) => {
    res.render("signin");
});

app.get("/signup", (req, res) => {
    res.render("signup");
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

app.get("/loginSubmit", function (req, res) {
    db.collection("users")
        .where("email", "==", req.query.email)
        .where("password", "==", req.query.password)
        .get()
        .then(function (docs) {
            if (docs.size > 0) {
                res.send("successful");
            }
            else {
                res.send("error");
            }
        })
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
