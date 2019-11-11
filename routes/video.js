var express = require('express');
var router = express.Router();
var Vimeo = require('vimeo').Vimeo;
var path = require('path');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
var socketio = require('../socketio');

var client = new Vimeo(process.env.VIMEO_CLIENT, process.env.VIMEO_SECRET, process.env.VIMEO_ACCESS);
/* GET home page. */
router.post('/upload', function (req, res, next) {
    var io = socketio.getSocketIO();
    var ns = io.of("/");
    var socket;
    if (ns && ns.connected) {
        socket = ns.connected[req.body.socket_id];
    }
    console.log();
    const file_extension = req.body.file_extension;
    if (!file_extension)
        return res.status(500).send("error: file_extension");

    if (!req.files.video)
        return res.status(500).send("error: video");

    const file_name = uuidv4();
    const file_path = "video/" + file_name + '.' + file_extension;


    req.files.video.mv(file_path, function (err) {
        if (err) {
            console.log(err);
            return res.status(501).send(err);
        }
        const realFilePath = path.resolve(__dirname, "../" + file_path);
        console.log(realFilePath);
        client.upload(
            realFilePath,
            {name: req.body.file_name},
            function (uri) {
                try {
                    fs.unlinkSync(realFilePath);
                } catch (err) {
                    console.error(err)
                }
                res.json({"uri": uri});
                console.log('File upload completed. Your Vimeo URI is:', uri)
            },
            function (bytesUploaded, bytesTotal) {
                var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
                console.log(bytesUploaded, bytesTotal, percentage + '%')
                if (socket) {
                    socket.emit("video-upload", {percent: percentage})
                }
            },
            function (error) {
                console.log('Failed because: ' + error)
                try {
                    fs.unlinkSync(realFilePath);
                } catch (err) {
                    console.error(err)
                }
                res.status(500).send("upload error")
            }
        )
    });


    // client.upload(
    //     req.files.video.tempFilePath,
    //     {name: req.body.file_name},
    //     function (uri) {
    //         console.log('File upload completed. Your Vimeo URI is:', uri)
    //         res.send("ok");
    //     },
    //     function (bytesUploaded, bytesTotal) {
    //         var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
    //         console.log(bytesUploaded, bytesTotal, percentage + '%')
    //     },
    //     function (error) {
    //         console.log('Failed because: ' + error)
    //         res.send("ok");
    //     }
    // )
});


module.exports = router;
