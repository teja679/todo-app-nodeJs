const express = require("express");
const app = express();
const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = require("./UserSchema");
const { cleanUpAndValidate } = require("./Utils/AuthUtils");

app.set("view engine", "ejs");

mongoose.set("strictQuery", false);
const mongoURI = `mongodb+srv://teja110:teja12345@cluster0.mdeyr12.mongodb.net/teja110`;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("connect DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to my app");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, username, password, email } = req.body;
  try {
    await cleanUpAndValidate({ name, username, password, email });
  } catch (err) {
    return res.send({
      status: 400,
      message: err,
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  let user = new userSchema({
    name: name,
    password: hashPassword,
    email: email,
    username: username,
  });

  console.log("user", user);
  try {
    const userDB = await user.save(); // create opt in database
    console.log("userDB", userDB);
    return res.send({
      status: 201,
      message: "Registered successfully",
      data: {
        _id: userDB._id,
        username: userDB.username,
        email: userDB.email,
      },
    });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal server Error, please try again",
      error: err,
    });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
