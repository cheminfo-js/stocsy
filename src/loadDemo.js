'use strict';
const fs = require("fs");
var sdf = fs.readFileSync('./src/molecules/set2.sdf').toString();
var parser = new OCL.SDFileParser(sdf);
var promises = [];
var molfiles = [];

while(parser.next()) {
    let molecule = parser.getMolecule();
    let molfile = molecule.toMolfile();
    molfiles.push(molfile);
    promises.push(agent.post("http://www.nmrdb.org/service/predictor")
        .type('form')
        .send({molfile: molfile}));
}
function fromPromises(options) {
    let options = Object.assign({}, defaultOptions, options)

    Promise.all(promises).then( function (result) {
        result.forEach((a,index) => {
            var predictor = new Predictor("spinus")
            var prediction = predictor.predict(molfiles[index],a.text);
        const spinSystem = nmr.SpinSystem.fromPrediction(prediction);

        spinSystem.ensureClusterSize(options);
        var simulation = nmr.simulate1D(spinSystem, options);

        // normalizing each spectrum to facilitate analysis
        var sum = simulation.reduce((a, b) => a + b*b, 0);
        var sum = Math.sqrt(sum);

        for (var j = 0; j < simulation.length; j++) {
            simulation[j] /= sum;
        }

        spectra.push(simulation);
    });

        var dataSet = [], weights = [];

        for (var i = 0; i < 100; i++) {
            var value = i/100 //Math.random();
            if (value <= 0.23) var spectraTMP = [spectra[0],spectra[1]];
            if (value > 0.23 && value <= 0.5) var spectraTMP = [spectra[0],spectra[2]];
            if (value > 0.5 && value <= 0.75) var spectraTMP = [spectra[1],spectra[2]];
            if (value > 0.75) var spectraTMP = [spectra[0],spectra[1],spectra[2]];
            var dataSet = generator(spectraTMP,1,0);
        }
    });
}
