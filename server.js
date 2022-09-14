//imports
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

//app.use
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/logo.png', express.static('images/logo.png'));



//routes
app.get("/", (req, res) => {
  res.render("home");
});




//listen to port
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is up and running on port 3000");
});



















