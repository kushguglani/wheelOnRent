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

s3.s3Client.listBuckets(function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        // console.log("Success", data.Buckets);
    }
});
// var bucketParams = {
//     Bucket: 'ezytrip',
//     Prefix: 'docs'
// };
// s3.s3Client.listObjects(bucketParams, function (err, data) {
//     if (err) {
//         console.log("Error", err);
//     } else {
//         var href = this.request.httpRequest.endpoint.href;
//         var bucketUrl = href + 'ezytrip' + '/';
//         // console.log(bucketUrl+encodeURIComponent(data.Contents[1].Key))
//         // // console.log("Success", data.Contents);
//         var photos = data.Contents.map(function (photo) {
//             var photoKey = photo.Key;
//             var photoUrl = bucketUrl + encodeURIComponent(photoKey);
//             console.log(photoUrl)
//         })
//     }
// });
//old
// app.post('/uploadProfile', upload.single("image"), awsWorker.doUpload);
app.post('/uploadProfile', upload.single("image"), (req, res) => {
    const s3Client = s3.s3Client;
    const params = s3.uploadParams;
    let date = Date.now();
    // console.log(req.body._id);
    params.Key = date + "-" + req.file.originalname;
    params.Bucket = 'ezytrip-proj/profile',
        params.Body = req.file.buffer;

    s3Client.upload(params, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error -> " + err });
        }
        //save file name in mongo
        let body = {
            docs_name: (date + "-" + req.file.originalname).toString()
        }
        let docsSchema = new DocsSchema(body);
        docsSchema.save().then((response) => {
            //need agent id here
            AgentSchema.findByIdAndUpdate(req.body._id, { $set: { profilePic: response._id } }, { upsert: true }).then(agent => {
                console.log(agent);
                // res.send({ status: uploadStatus, filename: `Profile photo uploaded successfully` })

                res.send({ message: 'File uploaded successfully' });
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
    let date = Date.now();
    let ResponseData = [];
    req.files.map((item) => {
        var params = {
            Key: date + "-" + item.originalname,
            Body: item.buffer,
            Bucket: 'ezytrip-proj/docs',
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
                if (ResponseData.length === req.files.length) {
                    let body = {
                        docs_name: req.files.map(curr => (date + "-" + curr.originalname).toString())
                    }
                    console.log(body);
                    let docsSchema = new DocsSchema(body);
                    docsSchema.save().then((response) => {
                        //need agent id here
                        AgentSchema.findByIdAndUpdate(req.body._id, { $set: { docs: response._id } }, { upsert: true }).then(agent => {
                            // console.log(agent);
                            // res.send({ status: uploadStatus, filename: `Profile photo uploaded successfully` })
                            res.send({ message: req.files.length + ' Docs uploaded successfully!' });

                        })
                            .catch(e => {
                                console.log(e);
                            })
                    })
                        .catch(e => {
                            console.log(e);
                        })
                }
            }
        })
    });
});

app.post('/submitFeedback', (req, res) => {
    console.log(req.body);
    AgentSchema.updateOne({ _id: req.body.agentID }, { $push: { agent_feedback: req.body.agentFeedback } }, { upsert: true }).then(agent => {
        res.send({ status: 'Feedback submitted successfully' })
    })
        .catch(e => {
            console.log(e);
        })
})

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
        console.log(vehicle);
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
    AgentSchema.find({})
        .populate("profilePic")
        .populate("docs")
        .then(user => {
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