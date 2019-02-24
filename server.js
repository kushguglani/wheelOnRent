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
const s3 = require('./config/s3.config.js');
const { authenticateAgent } = require('./middleware/authenticateAgent')

const port = process.env.PORT;

let upload = require('./config/multer.config.js');

const awsWorker = require('./middleware/aws.controller.js');

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
            if (err.errors.agent_mobile)
                res.send({ error: true, message: err.errors.agent_mobile.message })
            else if (err.errors.agent_email)
                res.send({ error: true, message: err.errors.agent_email.message })
            else res.status(400).send(err);
        })
});

// app.post('/uploadProfile', upload.single("image"), awsWorker.doUpload);
app.post('/uploadProfile', upload.single("image"), (req, res) => {
    const s3Client = s3.s3Client;
    const params = s3.uploadParams;
    // console.log(req.body._id);
    params.Key = Date.now() + "-" + req.file.originalname;
    params.Bucket = 'otravel/profile',
    params.Body = req.file.buffer;
   
    s3Client.upload(params, (err, data) => {
        if (err) {
            res.status(500).json({ error: "Error -> " + err });
        }
        //save file name in mongo
        let body = {
            docs_name: (Date.now() + "-" + req.file.originalname).toString()
        }
        let docsSchema = new DocsSchema(body);
        docsSchema.save().then((response) => {
            //need agent id here
            AgentSchema.findByIdAndUpdate(req.body._id, { $set: { profilePic: response._id } }, { upsert: true }).then(agent => {
                console.log(agent);
                // res.send({ status: uploadStatus, filename: `Profile photo uploaded successfully` })

                res.send({ message: 'File uploaded successfully! -> keyname = ' + req.file.originalname });
            })
                .catch(e => {
                    console.log(e);
                })
        })
            .catch(e => {
                console.log(e);
            })
    })
});
app.post('/uploadDocs', upload.array("image"), (req, res) => {
    const s3Client = s3.s3Client;
    const params = s3.uploadParams;
    let ResponseData = [];
    req.files.map((item) => {
        var params = {
            Key: Date.now() + "-" + item.originalname,
            Body: item.buffer,
            Bucket: 'otravel/docs',
        };
        s3Client.upload(params, (err, data) => {
            // console.log(err);
            // console.error(data);

            if (err) {
                res.status(500).json({ error: "Error -> " + err });
            }
            else {
                ResponseData.push(data);
                //save file name in mongo
                let body = {
                    docs_name: (Date.now() + "-" + item.originalname).toString()
                }
                let docsSchema = new DocsSchema(body);
                docsSchema.save().then((response) => {
                    //need agent id here
                    AgentSchema.findByIdAndUpdate(req.body._id, { $set: { profilePic: response._id } }, { upsert: true }).then(agent => {
                        // console.log(agent);
                        // res.send({ status: uploadStatus, filename: `Profile photo uploaded successfully` })
                        console.log(ResponseData.length);
                        console.error(req.files.length);
                        
                        if (ResponseData.length === req.files.length) {
                            res.send({  message: req.files.length + ' Docs uploaded successfully!' });
                        }
                    })
                        .catch(e => {
                            console.log(e);
                        })
                })
                    .catch(e => {
                        console.log(e);
                    })
            }
        })
    });
});



app.post('/uploadDocs1', (req, res) => {
    var form = new formidable.IncomingForm(), uploadStatus, filePaths = [], agent_id;
    form.uploadDir = path.join(__dirname, './uploads/docs');
    form.parse(req, function (err, fields, files) {
        agent_id = fields._id;
    });
    form.on('file', function (fields, files) {
        filePath = form.uploadDir + '/' + Date.now() + '-' + files.name;
        filePaths.push(filePath);
        console.log("******************");
        console.log(files.path);
        fs.rename(files.path, path.join(form.uploadDir, Date.now() + '-' + files.name), (err) => {
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
        if (vehicle.length === 0) res.status(200).send({ msz: "empty" });
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

app.post('/deleteVehicle', (req, res) => {
    console.log(req.body.id);
    VehicleSchema.findByIdAndUpdate(req.body.id, { $set: { status: 0 } }, { new: true }).then(result => {
        console.log(result);
        res.send(`Vehicle ${res.vehicle_name} deleted successfully`);
    })
})

app.listen(port, () => {
    console.log(`Server is up on ${port}`);
});