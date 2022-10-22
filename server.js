//imports
require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { google } =  require("googleapis");
const { oauth2 } = require("googleapis/build/src/apis/oauth2");

//app.use
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/logo.png', express.static('images/logo.png'));

//extras
const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN});

async function sendMail(senderName, senderEmail, senderMessage){
  try{
    const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'noreply.tusharkhatri.in@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN,
      },
    });

    const mailOptions = {
      from: "Bot <noreply@tusharkhatri.in>",
      to: "hello@tusharkhatri.in",
      subject: `${senderEmail} sent you a message`,
      text: `Message from ${senderName}: ${senderMessage}`,
    }

    const result = await transport.sendMail(mailOptions);
    return result;


  }catch (error) {
    return error;
  }
}


//get requests
app.get("/", (req, res) => {
  res.render("home", {messageSent: false});
});

app.get("/blogs", (req, res) => {
  res.redirect("https://blog.tusharkhatri.in");
});

app.get("/blog", (req, res) => {
  res.redirect("https://blog.tusharkhatri.in");
});

app.get("/resume", (req, res) => {
  res.send("Feature not available yet... Please check back again or contact me at hello@tusharkhatri.in");
});


//post requests
app.post("/contact", (req, res) => {
  const senderName = req.body.name;
  const senderEmail = req.body.email;
  const senderMessage = req.body.message;
  //sending automatic email from custom sendMail function...
  sendMail(senderName, senderEmail, senderMessage).then(result =>  res.render("home", {messageSent: true}))
  .catch(error => console.log(error.message));
});

//listen to port
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is up and running on port 3000");
});



















