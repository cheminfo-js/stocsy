/**
 * Created by acastillo on 11/15/16.
 */

const Predictor = require("nmr-predictor");
const nmr = require("nmr-simulation");
const OCL = require("openchemlib");
const fs = require("fs");
const request = require('request');

console.log(nmr.SpinSystem);

var sdf = fs.readFileSync('./src/molecules/set10.sdf').toString();
var parser = new OCL.SDFileParser(sdf);
var index = 0;
while(parser.next()) {
    let molecule = parser.getMolecule();
    let molfile = molecule.toMolfile();
    request.post("http://www.nmrdb.org/service/predictor", {form: {molfile: molfile}}, function (error, response, body) {
        var predictor = new Predictor("spinus");
        var prediction = predictor.predict(molfile, body);
        const spinSystem = nmr.SpinSystem.fromPrediction(prediction);
        var options = {
            frequency: 400.082470657773,
            from: 0,
            to: 11,
            lineWidth: 1,
            nbPoints: 16384,
            maxClusterSize: 6
        };

        spinSystem.ensureClusterSize(options);
        var simulation = nmr.simulate1D(spinSystem, options);

        console.log("prediction", simulation.length);
        console.log(index++);

    });
}

