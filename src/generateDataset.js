/**
 * Created by acastillo on 11/15/16.
 */

const Predictor = require("nmr-predictor");
const nmr = require("nmr-simulation");
const OCL = require("openchemlib");
const fs = require("fs");
const agent = require("superagent")
const request = require('request');


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
    console.log('hola')
}


Promise.all(promises).then( function (result) {
    result.forEach((a,index) => {
        var predictor = new Predictor("spinus")
        var prediction = predictor.predict(molfiles[index],a.text);
        const spinSystem = nmr.SpinSystem.fromPrediction(prediction);
        var options = {
            frequency: 400.082470657773,
            from: 2,
            to: 9,
            lineWidth: 1,
            nbPoints: 1024,
            maxClusterSize: 6
        };
        spinSystem.ensureClusterSize(options);
        var simulation = nmr.simulate1D(spinSystem, options);
        
        // normalizing each spectrum to facilitate analysis
        var sum = simulation.reduce((a, b) => a + b*b, 0);
        var sum = Math.sqrt(sum);
        
        for (var j = 0; j < simulation.length; j++) {
            simulation[j] /= sum;
        }
        
        writeFile('src/data/spectrum'+index,simulation)
        
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
        writeFile("src/data/comb"+i,dataSet.combinations,"combi"+i+" is saved");
        writeFile("src/data/weight"+i,dataSet.combinations,"weight"+i+" is saved");
    }
});

function generator(spectra,Ncomb,threshold) {
    var weights = new Array(Ncomb);
    var combinations = new Array(Ncomb);
    for (var i = 0; i < Ncomb; i++) {
        var tmp = new Array(spectra[0].length).fill(0);
        var weight = new Array(spectra.length);
        for(var j = 0; j < spectra.length; j++) {
            weight[j] = Math.random();
            if (Math.random() > threshold) {
                for (var k = 0; k < spectra[0].length; k++) {
                    tmp[k] += spectra[j][k]*weight[j];
                }
            } else weight[j] = 0;
        }
        weights[i] = weight;
        combinations[i] = tmp;
    }
    return {weights:weights,combinations:combinations};
}
function writeFile(path,variable,msg) {
    fs.writeFile(path,variable, (err) => {
        if (err) throw err;
        console.log(msg ? msg : 'It\'s saved!');
    });
}

function stack(mainV,secondV) {
    for (var i = 0; i < secondV.length; i++) {
        mainV.push(secondV[i]);
    }
    return mainV;
}
