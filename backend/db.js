const mongoose=require("mongoose");
const mongoURI="mongodb://127.0.0.1:27017/inotebook";
// const mongoURI="mongodb+srv://nishant:Amazing@124@cluster0.zjedcd0.mongodb.net/?retryWrites=true&w=majority";

// 'mongodb+srv://nishant:Amazing@124@cluster0.zjedcd0.mongodb.net/?retryWrites=true&w=majority'
mongoose.set('strictQuery', true);
const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected to database");
    })
}

module.exports=connectToMongo

