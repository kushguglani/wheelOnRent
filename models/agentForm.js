const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
var uniqueValidator = require('mongoose-unique-validator');
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
                unique: true
        },
        agent_email: {
                type: String,
                minlength: 3,
                unique: true
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

        },
        agent_vehicle_type: {
                type: Array,
        },
        agent_service_city: {
                type: Array,
                required: true,
        },
        profilePic: {
                type: mongoose.Schema.Types.ObjectId, ref: 'DocsSchema'
        },
        docs: {
                type: mongoose.Schema.Types.ObjectId, ref: 'DocsSchema'
        },
        status: {
                type: Number,
                required: true,
                minlength: 1,
                maxlength: 1,
                default:1

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

AgentFormSchema.plugin(uniqueValidator);

AgentFormSchema.methods.genrateAuthToken = function (){
        let Agent = this;
        let access = 'auth';
        let token = jwt.sign({_id:Agent._id.toHexString(),access},process.env.JWT_SECRET).toString();
        console.log(token);
        Agent.tokens.push({access,token});
        return Agent.save().then(()=>{
                return token;
        })
}

AgentFormSchema.statics.findByToken = function(token){
        let Agent = this;let decoded;
        console.log(token+"dssd")
        try{
                decoded = jwt.verify(token,process.env.JWT_SECRET);
        }
        catch(e){
                console.log(e);
                return Promise.reject();
        }
        console.log(decoded._id);
       return Agent.find({
                _id:decoded._id,
                'tokens.token':token,
                'token.access':'auth'
        });
}

let AgentSchema = mongoose.model('agent_schema', AgentFormSchema);
module.exports = { AgentSchema };