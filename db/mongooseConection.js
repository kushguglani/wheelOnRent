const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// console.log(process.env);
console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI, { useCreateIndex: true,useNewUrlParser: true });

module.exports = {mongoose};