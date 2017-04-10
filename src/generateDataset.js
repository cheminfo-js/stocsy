/**
 * Created by acastillo on 11/15/16.
 */

const Predictor = require("nmr-predictor");
const nmr = require("nmr-simulation");
const OCL = require("openchemlib");

// const agent = require("superagent")
// const request = require('request');

var defaultOptions = {
    frequency: 400.082470657773,
    from: 2,
    to: 9,
    lineWidth: 1,
    nbPoints: 1024,
    maxClusterSize: 6
};

function fromPromises(promises, options) {
    var options = Object.assign({}, {
        frequency: 400.082470657773,
        from: 2,
        to: 9,
        lineWidth: 1,
        nbPoints: 1024,
        maxClusterSize: 6
    }, options);
    var spectra = [];
    Promise.all(promises).then(function (result) {
        result.forEach((a, index) => {
            var prediction = new Predictor.spinus(molfiles[index]);
            const spinSystem = nmr.SpinSystem.fromPrediction(prediction);
            spinSystem.ensureClusterSize(options);
            var simulation = nmr.simulate1D(spinSystem, options);

            // normalizing each spectrum to facilitate analysis
            // var sum = simulation.reduce((a, b) => a + b*b, 0);
            // var sum = Math.sqrt(sum);
            //
            // for (var j = 0; j < simulation.length; j++) {
            //     simulation[j] /= sum;
            // }

            spectra.push(simulation);
        })
        return spectra;
    });
}

function fromBruker(zipFile, options) {
    var options = Object.assign({},
        {}, options);
    
}
let defaultOptions = {
    thresholdFactor: 1,
    clean: true,
    compile: true,
    optimize: true,
    integralFn: "sum",
    gsdOptions: {
        nL: 4, smoothY: false, minMaxRatio: 0.05, broadWidth: 0.2,
        functionType: "lorentzian",
        broadRatio: 0,
        sgOptions: {windowSize: 9, polynomial: 3}
    }
}

function fromJcamp(jcamps, optins) {



}
// this fucntion make a nComb random combinations of a matrix spectra
function generator(spectra, options) {
    let options = Object.assign({}, {nComb: 1, threshold: 0.5}, options)
    var weights = new Array(options.nComb);
    var combinations = new Array(options.nComb);
    for (var i = 0; i < options.nComb; i++) {
        var tmp = new Array(spectra[0].length).fill(0);
        var weight = new Array(spectra.length);
        for(var j = 0; j < spectra.length; j++) {
            weight[j] = Math.random();
            if (Math.random() > options.threshold) {
                for (var k = 0; k < spectra[0].length; k++) {
                    tmp[k] += spectra[j][k]*weight[j];
                }
            } else weight[j] = 0;
        }
        weights[i] = weight;
        combinations[i] = tmp;
    }
    return {weights: weights, combinations: combinations};
}

function stack(mainV,secondV) {
    for (var i = 0; i < secondV.length; i++) {
        mainV.push(secondV[i]);
    }
    return mainV;
}
