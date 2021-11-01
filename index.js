const express = require('express');
const mongoose = require("mongoose");
const cookieParser = require ('cookie-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
//files
const authUserRoutes = require('./router/authUserRoutes');
const manageUserRoutes = require('./router/manageUserRoutes');
const petRoutes = require('./router/petRoutes');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//routes
app.use(authUserRoutes);
app.use(manageUserRoutes);
app.use(petRoutes);

//for sending statics in production version
if(process.env.NODE_ENV === 'production'){
    //serve statics files
    app.use(express.static(path.join(__dirname, 'client/build')));
    //return all requests to react app
    app.get('*', (req, res)=>{
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
    });
}

//data base connection
const port = process.env.PORT || 8080;
const dbURI = process.env.MONGODB_URL;

mongoose.connect(dbURI,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then((result) => {app.listen(port,()=>console.log(`resver run on ${port}`))})
.catch((err) => {
  console.log(err);
});
//   app.listen(port,()=>console.log(`resver run on ${port}`))