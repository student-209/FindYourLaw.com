const express = require('express');
const multer = require('multer');
const fs = require('fs');
const DeepSpeech = require('deepspeech');
const wav = require('wav');
const stream = require('stream');

const app = express();
const port = 4000;
const modelPath = 'DeepSpeech-0.9.3-models.pbm';
const scorerPath = 'DeepSpeech-0.9.3-models.scorer';

const model = new DeepSpeech.Model(modelPath);
model.enableExternalScorer(scorerPath);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/transcribe', upload.single('audio'), (req, res) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const reader = new wav.Reader();
    reader.on('format', function (format) {
        const stream = model.createStream();
        reader.on('data', function (data) {
            stream.feedAudioContent(data);
        });
        reader.on('end', function () {
            const transcript = stream.finishStream();
            res.json({ transcript: transcript });
        });
    });

    bufferStream.pipe(reader);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
