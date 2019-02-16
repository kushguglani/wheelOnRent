const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
// const bcrypt = require('bcryptjs');

let AgentFormSchema = new mongoose.Schema({
        agent_name: {
                type: String,
                required: true,
                trim: true,
                minlength: 1,

        },
        agent_mobile: {
                type: Number,
                minlength: 10,
                unique:true
        },
        agent_address: {
                type: String,
                required: true,
                minlength: 1,

        },
        agent_city: {
                type: String,
                required: true,
                minlength: 1,

        },
        agent_state: {
                type: String,
                required: true,
                minlength: 1,

        },
        agent_zip_code: {
                type: Number,
                required: true,
                minlength: 4,
        },
        agent_company_name: {
                type: String,
                required: true,
                minlength: 1,

        },
        agent_company_registration_number: {
                type: String,
                minlength: 1,

        },
        agent_registration_type: {
                type: String,
                required: true,
                minlength: 1,

        },
        agent_number_of_vehicle: {
                type: String,
                required: true,
                minlength: 1,

        },
        agent_vehicle_type: {
                type: Array,
                required: true,
        },
        agent_bookin_city: {
                type: Array,
                required: true,
        },
        agent_drop_city: {
                type: Array,
                required: true,

        },
        profilePic:{
                type: mongoose.Schema.Types.ObjectId, ref:'DocsSchema'
        },
        tokens: [{
                access: {
                        type: String,
                        required: true
                },
                token: {
                        type: String,
                        required: true
                }
        }]

})

AgentFormSchema.methods.genrateAuthToken = function (){
        let agent = this;
        let access = 'auth';
        console.log(agent._id);
        console.log(process.env.JWT_SECRET);
        let token = jwt.sign({_id:agent._id.toHexString(),access},process.env.JWT_SECRET).toString();
        console.log(token);
        agent.tokens.push({access,token});
        return agent.save().then(()=>{
                return token;
        })
}

let AgentSchema = mongoose.model('agent_schema', AgentFormSchema);
module.exports = { AgentSchema };