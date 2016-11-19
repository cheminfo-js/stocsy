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
            lineWidth: 1,
            nbPoints: 12288,
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
    });
    // normalizing each spectrum to facilitate analysis
    for (var i = 0; i < spectra.length; i++) {
        var spectrum = spectra[i];
        var sum = spectrum.reduce((a, b) => a + b*b, 0);
        var norm = Math.sqrt(sum);
        for (var j = 0; j < spectrum.length; j++) {
            spectrum[j] /= norm;
        }
    }
    var content = [spectra[0],spectra[1]];
    generator(content,25,0);
    var content = [spectra[2],spectra[1]];
    generator(content,25,25);
    var content = [spectra[2],spectra[0]];
    generator(content,25,50);
    generator(spectra,25,75);
});

function generator(spectra,Ncomb,label) {
    for (var i = label; i < label+Ncomb; i++) {
        var tmp = new Array(spectra[0].length).fill(0);
        var weigth = new Array(spectra.length);
        for(var j = 0; j < spectra.length; j++) {
            weigth[j] = Math.random();
            //if (weigth[j] < 0.1) weigth[j] = 0;
            for (var k = 0; k < spectra[0].length; k++) {
                tmp[k] += spectra[j][k]*weigth[j];
            }
        }
        writeFile('src/data/comb'+i.toString(),tmp);
        writeFile('src/data/weigth'+i.toString(),weigth);
    }
}

function writeFile(path,variable) {
    fs.writeFile(path,variable, (err) => {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}

