require("dotenv").config();

const path = require("path");
const express = require("express");
const User = require("./models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog");

const SECRET_KEY = "WEB_DEV_GDG";

const app = express();

//middlewares
app.use(express.json()); //put/post
app.use(express.urlencoded({ extended: true })); //submitting HTML forms with POST
app.use(cookieParser()); //Parses cookies sent by the browser and makes them available in req.cookies.


//configuration
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//atlas



// Database Connection
mongoose
  // .connect("mongodb://127.0.0.1:27017/blogbook")  //local db
  .connect(process.env.ATLASDB_URL)   //atlas db
  .then(() => console.log("Database connected successfully "))
  .catch((err) => console.log(err));

////

// Function to check if the user is Authenticated or not
const isAuthenticated = (req, res, next) => {
  // 1. Check if session exists
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }

  // 2. If session exists, check if this is an authorized user
  try {
    const decoded = Jwt.verify(token, SECRET_KEY);
    const user = User.findById(decoded.userID);

    // 3. If user not found: clear session and redirect to login
    if (!user) {
      res.clearCookie("token");
      return res.redirect("/login");
    }

    // 4. Give user the access to protected route...
    req.user = decoded.userID;
    next();
  } catch (err) {
    // If there is any other error: clear session and redirect to login
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

 /////////////// ROUTES
app.get("/", isAuthenticated, async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "fullName email") //shows author for the current user having fullName and email
      .sort({ createdAt: -1 }); //Sorts blogs in descending order
    console.log("fetched blogs", blogs);
    //Shows the currently logged-in user
    res.render("home", {
      blogs,
      userID: req.user,
    });
  } catch (err) {
    //if error ,redirected to home page showing empty array and message
    res.render("home", {
      blogs: [],
      error: "Failed to Load Blogs",
      userID: req.user,
    });
  }
});

//creates a new blog
app.post("/blogs", isAuthenticated, async (req , res) => {
  const { title, content } = req.body;
  try {
    const newBlog = await Blog.create({
      title,
      content,
      author: req.user,
    });
    console.log(newBlog);
    res.redirect("/");
  } catch (err) {
    // const blogs = await Blog.find()
    //   .populate("author", "fullName email")
    //   .sort({ createdAt: -1 });

    //if error, renders the same page with error message
    console.log(err);
    res.render("home", {
      blogs,
      error: "Failed to Create Blog",
      userID: req.user,
    });
  }
});

//Edit the blog
app.post("/blogs/:id/edit", isAuthenticated, async (req, res) => {
  const { title, content } = req.body; // Extract title and content from request
  const { id } = req.params; // Extract blog ID from URL params
  try {
    const blog = await Blog.findById(id); // Find the blog by ID
    if (!blog) {
      // If blog not found
      return res.status(404).json({ error: "Blog Not Found" });
    }
    //if current user is not author of blog then show msg
    if (blog.author.toString() !== req.user) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this blog" });
    }

    //Updates the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    // Return the updated document and Redirect to homepage
    return res.redirect("/");
  } catch (err) {
    //if any error , renders the same page with error message
    res.status(400).json({ error: "Failed to Update Blog" });
  }
});

//For deleting blog
app.post("/blogs/:id/delete", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      //if blog not found by id
      return res.status(404).json({ error: "Blog Not Found" });
    }

    //if current user is not author of blog then show msg
    if (blog.author.toString() !== req.user) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this blog" });
    }
    //delete the blog by findByIdAndDelete and redirect to /
    await Blog.findByIdAndDelete(id);
    return res.redirect("/");
  } catch (err) {
    res.status(400).json({ error: "Failed to Delete Blog" });
  }
});

/////////////// SIGN UP GET / POST ROUTES

// When user comes on sign up page
app.get("/signup", async (req, res) => {
  // Check if session exists
  const token = req.cookies.token;
  try {
    if (token) {
      Jwt.verify(token, SECRET_KEY);
      return res.redirect("/");
    }
  } catch (err) {
    res.clearCookie("token");
  }

  res.render("signup");
});

// When user submits the Sign Up form
app.post("/signup", async (req, res) => {
  // 1. Get submitted data from the form
  const { fullName, email, password } = req.body;

  try {
    // 2. Check if user already exists, and return an error
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User Already Exists" });
    }

    // 3. If everything is okay, create user
    // 3.1 Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName: fullName,
      email,
      password: hashedPassword,
    });

    console.log(newUser);

    // 3.2 Create session using JWT and Cookies
    const token = Jwt.sign({ userID: newUser._id }, SECRET_KEY, {
      expiresIn: "1d",
    });

    res.cookie("token", token, { httpOnly: true });

    // Must change to "/" on Day 5
    res.redirect("/");

    // return res.status(200).json({ message: "User Created" });
  } catch (err) {
    return res.status(400).json({ error: "Something went wrong!" });
  }
});

// ////////////// LOGIN GET / POST ROUTES

// When user comes on login up page
app.get("/login", (req, res) => {
  // Check if session exists
  const token = req.cookies.token;
  try {
    if (token) {
      Jwt.verify(token, SECRET_KEY);
      return res.redirect("/");
    }
  } catch (err) {
    res.clearCookie("token");
  }

  res.render("login");
});

// When user submits the login form
app.post("/login", async (req, res) => {
  // 1. Get submitted form data
  const { email, password } = req.body;

  // 2. Check if any user exists with the given email
  const user = await User.findOne({ email });
  console.log(user);

  if (!user) {
    return res.status(400).json({ error: "User Not Found" });
  }

  // 3. Check if the user's password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Incorrect Password" });
  }

  // 4. Create session and redirect
  const token = Jwt.sign({ userID: user._id }, SECRET_KEY, { expiresIn: "7d" });
  res.cookie("token", token, { httpOnly: true });

  // Must change to "/" on Day 5
  return res.redirect("/");
});

// When logs out
app.get("/logout", (req, res) => {
  // Clear session and redirect to login
  res.clearCookie("token");
  res.redirect("/login");
});

////////

// Middleware to serve static files (CSS, images, JS)
app.use(express.static("public"));

// Route handler for the signup page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Route handler for the login page
app.get("/login", (req, res) => {
  res.render("login");
});
///////

// // Start Server  -locally
// app.listen(8000, () => console.log("Server running on http://localhost:8000"));


//atlas
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:8000");
});
