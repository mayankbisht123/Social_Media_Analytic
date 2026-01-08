const mongoose = require('mongoose');

const db=()=>{
    mongoose.connect('mongodb://localhost:27017/SocialMedia').then(()=>{
        console.log('connected to mongoose');
    }).catch((e)=>{
        console.error(e);
    })
}

module.exports=db;