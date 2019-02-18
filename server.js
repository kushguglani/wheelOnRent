require('./config/config')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');

const { mongoose } = require('./db/mongooseConection');
app.set('trust proxy', 1) // trust first proxy

// all model schema

const { AgentSchema } = require('./models/agentForm');
const { VehicleSchema } = require('./models/vehicleDetails');
const { DocsSchema } = require('./models/docs');

const { authenticateAgent } = require('./middleware/authenticateAgent')

const port = process.env.PORT;


app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


//agent api start from here

app.post('/saveAgentFormDetails', (req, res) => {
    let agentDetails = new AgentSchema(req.body);
    agentDetails.save().then(() => {
        return agentDetails.genrateAuthToken();
    })
        .then((token) => {
            console.log(agentDetails);
            console.log(agentDetails._id);
            res.header('x-auth', token).send(agentDetails);
        })
        .catch(err => {
            console.log(err);
            if (err.name === 'MongoError' && err.code === 11000)
                res.send({ error: true, message: `Mobile No. ${req.body.agent_mobile} already exist` })
            res.status(400).send(err);
        })
});

app.post('/uploadProfile', (req, res) => {
    var form = new formidable.IncomingForm(), uploadStatus, filePath, agent_id;
    form.uploadDir = path.join(__dirname, './uploads/profile');
    form.parse(req, function (err, fields, files) {
        agent_id = fields._id;
    });
    form.on('file', function (field, file) {
        // console.log(Date.now() + '-' + file.name);
        console.log("----------------------");
        console.log(file.uploadDir);
        filePath = form.uploadDir + '/' + Date.now() + '-' + file.name;
        console.log(path.join(form.uploadDir, Date.now() + '-' + file.name));
        file.path = path.join(form.uploadDir, Date.now() + '-' + file.name;
        fs.rename(file.path, path.join(form.uploadDir, Date.now() + '-' + file.name), (err) => {
            if (err) return console.log(err);
        })
        console.log("File Uploaded Successfully")
    })
    form.on('error', (err) => {
        console.log(err)
    });
    form.on('end', (file) => {
        uploadStatus = 'File Uploaded Successfully';
        let body = {
            docs_name: filePath
        }
        let docsSchema = new DocsSchema(body);
        docsSchema.save().then((response) => {
            //need agent id here
            AgentSchema.findByIdAndUpdate(agent_id, { $set: { profilePic: response._id } }, { upsert: true }).then(agent => {
                console.log(agent);
                res.send({ status: uploadStatus, filename: `Profile photo uploaded successfully` })
            })
                .catch(e => {
                    console.log(e);
                })
        })
            .catch(e => {
                console.log(e);
            })

    })

})


app.post('/uploadDocs', (req, res) => {
    var form = new formidable.IncomingForm(), uploadStatus, filePaths=[], agent_id;
    form.uploadDir = path.join(__dirname, './uploads/docs');
    form.parse(req, function (err, fields,files) {
        agent_id = fields._id;
    });
    form.on('file', function (fields, files) {
        filePath = form.uploadDir + '/' + Date.now()+'-'+files.name;
        filePaths.push(filePath);
        console.log("******************");
        console.log(files.path);
        fs.rename(files.path, path.join(form.uploadDir, Date.now()+'-'+files.name), (err) => {
            if (err) return console.log(err);
        })
        console.log("File Uploaded Successfully")
    })
    form.on('error', (err) => {
        console.log(err)
    });
    form.on('end', (file) => {
        uploadStatus = 'File Uploaded Successfully';
        let body = {
            docs_name: filePaths
        }
        let docsSchema = new DocsSchema(body);
        docsSchema.save().then((response) => {
            AgentSchema.findByIdAndUpdate(agent_id, { $set: { docs: response._id } }, { upsert: true }).then(agent => {
                res.send({ status: uploadStatus, filename: `Document uploaded successfully` })
            })
                .catch(e => {
                    console.log(e);
                })
        })
            .catch(e => {
                console.log(e);
            })

    })

})



//commmon api start from here

app.get('/fetchVehicleType', (req, res) => {
    VehicleSchema.find({ status: 1 }, null, { sort: { _id: -1 } }).then(vehicle => {
        if (vehicle.length === 0) res.status(200).send({msz:"empty"});
        else res.status(200).send(vehicle);
    })
        .catch((e) => {
            res.status(401).send(e);
        })
})

// admin api start from here

app.get('/fetchAllAgents', (req, res) => {
    console.log("hello");
    AgentSchema.find({}).then(user => {
        if (user.length === 0) res.status(200).send("No agent found");
        else res.status(200).send(user);
    })
        .catch((e) => {
            console.log(e);
            res.status(401).send(e);
        })
})

app.post('/submitVehicleDetails', (req, res) => {
    // console.log(req.body);
    let body = _.pick(req.body, ['vehicle_name', 'vehicle_type', 'vehicle_number_of_seats', 'status']);
    // console.log(body);
    let vehicleDetails = new VehicleSchema(body);
    vehicleDetails.save().then(data => {
        // console.log(data);
        res.send(data);
    })
        .catch(err => {
            console.log(err);
            if (err.name === 'MongoError' && err.code === 11000)
                res.send({ error: true, message: `Veheicle ${body.vehicle_name} already exist` })
            else res.status(500).send(err)
        })
})

app.post('/deleteVehicle',(req,res)=>{
    console.log(req.body.id);
    VehicleSchema.findByIdAndUpdate(req.body.id,{$set:{status:0}},{new:true}).then(result=>{
        console.log(result);
        res.send(`Vehicle ${res.vehicle_name} deleted successfully`);
    })
})

app.listen(port, () => {
    console.log(`Server is up on ${port}`);
});