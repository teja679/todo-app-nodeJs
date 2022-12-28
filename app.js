const express = require("express");
const app = express();
const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongoDBSession = require("connect-mongoDB-session")(session);
const { cleanUpAndValidate } = require("./Utils/AuthUtils");
const UserSchema = require("./UserSchema");
const isAuth = require("./middleware/isAuth");

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

const store = new mongoDBSession({
  uri: mongoURI,
  collection: "sessions",
});

app.use(
  session({
    secret: "hello backendjs",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// All the routes
app.get("/", (req, res) => {
  res.send("Welcome to my app");
});

app.get("/login", (req, res) => {
  return res.render("login");
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

  let user = new UserSchema({
    name: name,
    password: hashPassword,
    email: email,
    username: username,
  });

  let userExists;
  // check if user already exists

  try {
    userExists = await UserSchema.findOne({ email });
  } catch (err) {
    return res.send({
      status: 400,
      message: "Internal Server Error. Please try again.",
      // error: err,
    });
  }
  if (userExists) {
    return res.send({
      status: 400,
      message: "User with email already exists.",
    });
  }

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
      // error: err,
    });
  }
});

app.post("/login", async (req, res) => {
  // loginId can be either email or username
  console.log(req.body);
  const { loginId, password } = req.body;
  if (
    typeof loginId !== "string" ||
    typeof password !== "string" ||
    !loginId ||
    !password
  ) {
    return res.send({
      status: 400,
      message: "Invalid Data",
    });
  }

  //find() - May return you multiple objects, Returns empty array if nothing matches, returns an array of objects
  //findOne() - One object, Returns null if nothing matches, returns an object
  let userDb;
  try {
    if (validator.isEmail(loginId)) {
      userDb = await UserSchema.findOne({ email: loginId });
    } else {
      userDb = await UserSchema.findOne({ username: loginId });
    }
  } catch (err) {
    console.log(err);
    return res.send({
      status: 400,
      message: "Internal server error. Please try again",
      // error: err,
    });
  }

  console.log(userDb);

  if (!userDb) {
    return res.send({
      status: 400,
      message: "user not found",
      data: req.body,
    });
  }

  // comparing the password
  const isMatch = await bcrypt.compare(password, userDb.password);

  if (!isMatch) {
    return res.send({
      status: 400,
      message: "Invalid password",
      error: req.body,
    });
  }
  //include session info to check further
  req.session.isAuth = true;
  req.session.user = {
    username: userDb.username,
    email: userDb.email,
    userId: userDb._id,
  };
  res.redirect("/dashboard");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/home", (req, res) => {
  if (req.session.isAuth) {
    res.send("This is your Home page, Logged in successfully");
  } else {
    res.send("Invalid session. Please logged in again");
  }
});

app.post('/logout', (req, res) => {
  console.log(req.session)
  console.log(req.session.id)

  req.session.destroy((err) => {
    if(err) throw err;

    res.redirect('/')
  })
})

app.post('/logout_from_all_devices', async (req, res) => {
  console.log('here', req.session.user.username)
  const username = req.session.user.username

  const Schema = mongoose.Schema

  const sessionSchema = new Schema({ _id: String}, {strict: false})
  const SessionModel = mongoose.model('sessions', sessionSchema)

  try{
    const sessionDb = await SessionModel.deleteMany({
      'session.user.username': username
    })
    console.log(sessionDb)

    res.send({
      status: 200,
      message: 'Logged out of all devices'
    })
  } catch(err) {
    res.send({
      status: 400,
      message: 'Logout failed',
      error: err
    })
  }
})
app.listen(4000, () => {
  console.log("Listening on port 4000");
});
