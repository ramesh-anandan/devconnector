const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const config = require("./config/config");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true })
  .then(res => {
    console.log("Mongodb connected");
  })
  .catch(err => {
    console.log("Mongodb connection failed");
  });

app.use(passport.initialize());

require("./config/passport")(passport);

// User routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
