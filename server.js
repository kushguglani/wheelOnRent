require('./config/config')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const _ = require('lodash');
const multer = require('multer');
const formidable = require('formidable');
const fs = require('fs');

const { mongoose } = require('./db/mongooseConection');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
app.set('trust proxy', 1) // trust first proxy
app.use(session({ secret: 'keyboard cat', store: new MongoStore(options)}))

const { AgentSchema } = require('./models/agentForm');
const { VehicleSchema } = require('./models/vehicleDetails');
const { DocsSchema } = require('./models/docs');

const { authenticateAgent } = require('./middleware/authenticateAgent')

const port = process.env.PORT;
let userId;
// SET STORAGE


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/submitVehicleDetails', (req, res) => {
    // console.log(req.body);
    let body = _.pick(req.body, ['vehicle_name', 'vehicle_type', 'vehicle_number_of_seats']);
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

app.post('/uploadProfile', (req, res) => {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, './uploads');
    let uploadStatus, filePath;
    // console.log("Ssdds");

    form.parse(req);
    form.on('file', function (field, file) {
        // console.log(file.name);
        // console.log("jihbg tf " + form.uploadDir);
        filePath = form.uploadDir + '/' + file.name;
        fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
            // console.log("dsddsasda sdds", err);
            if (err) return console.log(err);
            // console.log("File Uploaded Successfully")
        })
        console.log("File Uploaded Successfully")
    })
    form.on('error', (err) => {
        console.log(err)
    });
    form.on('end', (file) => {
        // console.log(filePath);
        // console.log("dd");
        // console.log(req.session.agentId);
        // console.log("agent")
        uploadStatus = 'File Uploaded Successfully';
        let profilePhoto = { profilePic: req.session.agentId + '-' + Date.now() };
        // console.log(profilePhoto);
        // console.log(userId);
        let body = {
            docs_name: filePath
        }
        let docsSchema = new DocsSchema(body);
        docsSchema.save().then((response) => {
            console.log(response);
            AgentSchema.findByIdAndUpdate(req.session.agentId, { $set: { profilePic: response._id} }, { upsert: true }).then(agent => {
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


app.post('/saveAgentFormDetails', (req, res) => {
    console.log(req.body);
    let agentDetails = new AgentSchema(req.body);
    agentDetails.save().then(() => {
        return agentDetails.genrateAuthToken();
    })
        .then((token) => {
            console.log(agentDetails);
            console.log(agentDetails._id);
            req.session.agentId = agentDetails._id;
            console.log(req.session.agentId);
            console.log("SD");
            res.header('x-auth', token).send(agentDetails);
        })
        .catch(err => {
            console.log(err);
            if (err.name === 'MongoError' && err.code === 11000)
                res.send({ error: true, message: `Mobile No. ${req.body.agent_mobile} already exist` })
            res.status(400).send(err);
        })
});

app.get('/fetchVehicleType', (req, res) => {
    VehicleSchema.find({}).then(vehicle => {
        if (vehicle.length === 0) res.status(404).send();
        else res.status(200).send(vehicle);
    })
        .catch((e) => {
            res.status(401).send(e);
        })
})

app.listen(port, () => {
    console.log(`Server is up on ${port}`);
});