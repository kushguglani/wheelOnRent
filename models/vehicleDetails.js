const mongoose = require('mongoose');
const validator = require('validator');

let VehicleDetails = new mongoose.Schema({
        vehicle_name: {
                type: String,
                minlength: 1,
                unique:true
        },
        vehicle_type: {
                type: String,
                required: true,
                minlength: 1,

        },
        vehicle_number_of_seats: {
                type: Number,
                minlength: 1,

        },
        status: {
                type: Number,
                required: true,
                minlength: 1,
                maxlength: 1,
                default: 1

        },
})

let VehicleSchema = mongoose.model('vehicle_schema', VehicleDetails);
module.exports = { VehicleSchema };