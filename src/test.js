/**
 * Created by acastillo on 11/15/16.
 */

const Predictor = require("nmr-predictor");
const nmr = require("nmr-simulation");
const OCL = require("openchemlib");
const fs = require("fs");
const agent = require("superagent")
const request = require('request');

console.log(nmr.SpinSystem);

var sdf = fs.readFileSync('./src/molecules/set2.sdf').toString();
var parser = new OCL.SDFileParser(sdf);
var spectra = [];
var promises = [];
var molfiles = [];

while(parser.next()) {
    let molecule = parser.getMolecule();
    let molfile = molecule.toMolfile();
    molfiles.push(molfile);
    promises.push(agent.post("http://www.nmrdb.org/service/predictor")
        .type('form')
        .send({molfile: molfile}));
        //.set('Accept','application/json');
}


Promise.all(promises).then( function (result) {
    result.forEach((a,index) => {
        console.log(index)
        var predictor = new Predictor("spinus")
        var prediction = predictor.predict(molfiles[index],a.text);
        const spinSystem = nmr.SpinSystem.fromPrediction(prediction);
        var options = {
            frequency: 400.082470657773,
            from: 0,
            to: 11,
            lineWidth: 1.5,
            nbPoints: 2048,
            maxClusterSize: 6
        };
        spinSystem.ensureClusterSize(options);
        var simulation = nmr.simulate1D(spinSystem, options);
        
        // // normalizing each spectrum to facilitate analysis
        // var sum = simulation.reduce((a, b) => a + b, 0);
        // for (var j = 0; j < spectrum.length; j++) {
        //     simulation[j] /= sum;
        // }
    
        fs.writeFile('src/data/spectra'+index.toString(),simulation, (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
        })
        spectra.push(simulation);
        //console.log("prediction", simulation.length);
    });
    generator(spectra,100);
});

function generator(spectra,Ncomb) {
    // var Gspectra = new Array(Ncomb);
    // var weights = new Array(Ncomb);
    for (var i = 0; i < Ncomb; i++) {
        var tmp = new Array(spectra[0].length).fill(0);
        var weigth = new Array(spectra.length);
        for(var j = 0; j < spectra.length; j++) {
            weigth[j] = Math.random();
            // console.log(weigth[j])
            for (var k = 0; k < spectra[0].length; k++) {
                tmp[k] += spectra[j][k]*weigth[j];
            }
        }
        fs.writeFile('src/data/comb'+i.toString(),tmp, (err) => {
            if (err) throw err;
            console.log('It\'s saved!');
        })
        fs.writeFile('src/data/weigth'+i.toString(),weigth, (err) => {
            if (err) throw err;
        console.log('It\'s saved!');
        })
    }
}