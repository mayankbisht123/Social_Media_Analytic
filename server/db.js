const mongoose = require('mongoose');

const db=()=>{
    mongoose.connect(process.env.MONGO_DB).then(()=>{
        console.log('connected to mongoose');
    }).catch((e)=>{
        console.error(e);
    })
}

module.exports=db;