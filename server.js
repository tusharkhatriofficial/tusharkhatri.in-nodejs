//imports
import { copyFileSync } from 'fs';
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

async function fetchHashnodeBlog(){

  const variables = { page: 0 };

  const query = `
  query GetUserArticles($page: Int!) {
    user(username: "tusharkhatri") {
        publication {
            posts(page: $page) {
                title
                brief
                slug
                coverImage
                dateAdded
            }
        }
    }
}
`;


  const data = await fetch("https://api.hashnode.com/", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        query,
        variables,
    }),
});

const result = await data.json();
//the actual post is nested deep down in the result object
const articles = result.data.user.publication.posts;
return articles;
}




//get requests
app.get("/", async (req, res) => {
  const blogList = await fetchHashnodeBlog();
  
  res.render("home", {blogList: blogList});
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

app.get("/privacy-policy", (req, res) => {
  res.render("privacy-policy");
});

app.get("/terms&conditions", (req, res) => {
  res.render("terms&conditions");
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
  const port = process.env.PORT;
  console.log(`Server is up and running on port ${port}`);
});