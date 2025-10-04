const express = require('express');
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const AccountRoutes = require('./routes/account');
const AuthRoutes = require('./routes/auth');
const WebRoutes = require('./routes/website');
const CustomRoutes = require('./routes/custom');
const GoogleAuthRoutes = require('./routes/googleAuth');
const TelegramRoutes = require('./routes/telegram');
require("dotenv").config();
const app = express();


const url = process.env.MONGO_URL;
mongoose.connect(url)
    .then(() => {
        console.log('Connected to database!');
    })
    .catch((error) => {
        console.log(error);
        console.log('Connection failed!');
    });

app.use(cors())
app.use(compression()); //use compression 
app.use(BodyParser.json('application/json'));
app.use(BodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
  });

app.use('/api/account', AccountRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/google-auth', GoogleAuthRoutes);
app.use('/api/website', WebRoutes);
app.use('/api/custom', CustomRoutes);
app.use('/api/telegram', TelegramRoutes);

module.exports = app;