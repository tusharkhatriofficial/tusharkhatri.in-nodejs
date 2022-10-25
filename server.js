//imports
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { google } =  require("googleapis");
const { oauth2 } = require("googleapis/build/src/apis/oauth2");
import fetch from 'node-fetch';


//app.use
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/logo.png', express.static('images/logo.png'));

//extras

//google oauth2 and nodemailer messging setup
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

//setup to fetch blog data from hashnode api and display on the home page

// function fetchBlogs(){

//   const query = `query {
//     user(username: "tusharkhatri"){
//       publication{
//         posts(page:0){
//           title
//         }
//       }
//     }
//   }`;
  
//   const opts = {
//     method: 'POST',
//     headers:  { 'content-type': 'application/json' },
//     body: JSON.stringify( {query} )
//   }

//   fetch('https://api.hashnode.com', opts)
//  .then(res => res.json())
//  .then(res => console.log(res));
// }

// fetchBlogs();


//get requests
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/blogs", (req, res) => {
  res.redirect("https://blog.tusharkhatri.in");
});

app.get("/blog", (req, res) => {
  res.redirect("https://blog.tusharkhatri.in");
});

app.get("/resume", (req, res) => {
  res.render("resume");
});

app.get("/projects", (req, res) => {
  res.render("projects");
});

app.get("/github", (req, res) => {
  res.redirect("https://github.com/tusharkhatriofficial");
});

app.get("/newsletter", (req, res) => {
  res.redirect("https://blog.tusharkhatri.in/newsletter");
});

app.get("/contact", (req, res) => {
  res.render("contact", {messageSent: false});
});

app.get("*", (req, res) => {
  res.render("404");
});

app.get('/sitemap.xml', function(req, res) {
  res.sendFile('/sitemap.xml');
  });


//post requests
app.post("/contact", (req, res) => {
  const senderName = req.body.name;
  const senderEmail = req.body.email;
  const senderMessage = req.body.message;
  //sending automatic email from custom sendMail function...
  sendMail(senderName, senderEmail, senderMessage).then(result =>  res.render("contact", {messageSent: true}))
  .catch(error => console.log(error.message));
});

//listen to port
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is up and running on port 3000");
});



















