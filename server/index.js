const connectToMongooes = require('./db');
const express= require('express');
const cors=require('cors');
const path=require('path');
require('dotenv').config();
const dns = require('dns');

// Force Node.js to bypass your local router's DNS and use Google's
dns.setServers(['8.8.8.8', '8.8.4.4']);


connectToMongooes();
const app=express();
const port=4000;

app.use(cors());
app.use(express.json());

// app.use(express.static(path.join(__dirname,'../client/dist')));


app.listen(port,()=>{
    console.log('Connected to port');
});

app.use('/api/auth',require('./controllers/auth'));
app.use('/api/redditData',require('./controllers/accountData'));




// app.use('*',(req,res)=>{
//     res.sendFile(path.join(__dirname,'../client/dist/index.html'))
// })









