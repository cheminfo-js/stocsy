'use strict'
/**
 * Created by Abol on 11/15/2016.
 */
const fs = require("fs");
const Matrix = require("ml-matrix");
const PCA = require("ml-pca");

const Ncomb = 100;

var content = new Array(Ncomb);
for (var i = 0; i < Ncomb; i++) {
    var data = fs.readFileSync('src/data/comb'+i).toString()
    content[i] = JSON.parse("[" + data + "]");
}

// normalizing each spectrum to facilitate analysis
for (var i = 0; i < content.length; i++) {
    var spectrum = content[i];
    var sum = spectrum.reduce((a, b) => a + b*b, 0);
    var norm = Math.sqrt(sum)
    for (var j = 0; j < spectrum.length; j++) {
        spectrum[j] /= norm;
    }
}

// suppressing columns of zeros
content = new Matrix(content).transpose();
var columnsDeleted = [];
var dataWhitoutZeros = [];
for (var i = 0; i < content.rows; i++) {
    var column = content[i];
    if (column.reduce((a,b) => a+b,0) !== 0) {
        dataWhitoutZeros.push(column);
    } else columnsDeleted.push(i);
}
dataWhitoutZeros = new Matrix(dataWhitoutZeros).transpose();

// writing some combinations to view
writeFile('src/data/combWhitoutZeros1',dataWhitoutZeros[0])
writeFile('src/data/combWhitoutZeros2',dataWhitoutZeros[1])
writeFile('src/data/combWhitoutZeros3',dataWhitoutZeros[2])

// creating covariance matrix
var covMatrix = covMatrix(dataWhitoutZeros);
// writing the covariance matrix in 'data' folder
writeFile('src/data/CovM_Normalize',JSON.stringify(covMatrix));
// it's doing the pca
var pca_result = new PCA(covMatrix,{isCovarianceMatrix: true});

// // writing some eigenvector to view
var eigenVector = new Matrix(pca_result.getEigenvectors()).transpose()
writeFile('src/data/eigenVector1',eigenVector[0]);
writeFile('src/data/eigenVector2',eigenVector[1]);
writeFile('src/data/eigenVector3',eigenVector[2]);
writeFile('src/data/eigenVector4',eigenVector[3]);
writeFile('src/data/eigenVector5',eigenVector[4]);
var eigenvalue = pca_result.getEigenvalues()

console.log(eigenvalue[0])
console.log(eigenvalue[1])
console.log(eigenvalue[2])
console.log(eigenvalue[3])
console.log(eigenvalue[4])

// writing the Eigenvectors matrix
writeFile('src/data/Eigenvector_Normalize',JSON.stringify(pca_result.getEigenvectors()));




// make the dot product between two spectra
function dotProduct(vector1, vector2) {
    var tmp = 0;
    if (vector1.length == vector2.length) {
        for (var i = 0; i < vector1.length; i++) {
            tmp += vector1[i]*vector2[i];
        }
        return tmp;
    } else {
        error('vectors length not match')
    }
}

function writeFile(path,variable) {
    fs.writeFile(path,variable, (err) => {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}

function corrMatrix(matrix) {
    let rows = matrix.rows;
    var corrMatrix = new Matrix(rows, rows);
    for (var i = 0; i < rows; i++) {
        for (var j = i; j < rows; j++) {
            corrMatrix[i][j] = dotProduct(matrix[i],matrix[j]);
            corrMatrix[j][i] = corrMatrix[i][j];
        }
    }
    // // normalize of matrix
    // for (var i = 0; i < rows; i++) {
    //     for (var j = i; j < rows; j++) {
    //         if (corrMatrix[i][i] !== 0 && corrMatrix[j][j] !== 0) {
    //             corrMatrix[i][j] = corrMatrix[i][j]/Math.sqrt(corrMatrix[i][i] * corrMatrix[j][j]);
    //         } else corrMatrix[i][j] = 0;
    //         corrMatrix[j][i] = corrMatrix[i][j];
    //     }
    // }
    return corrMatrix;
}

function covMatrix(matrix) {
    return corrMatrix(matrix.transpose());
}

//reading each spectra suppressing columns of zeros (for debugging)
var contentSpectra = new Array(3);
for (var i = 0; i < 3; i++) {
    var data = fs.readFileSync('src/data/spectra'+i).toString()
    contentSpectra[i] = JSON.parse("[" + data + "]");
}

// for (var i = 0; i < contentSpectra.length; i++) {
//     var spectrum = contentSpectra[i];
//     var sum = spectrum.reduce((a, b) => a + b*b, 0);
//     var norm = Math.sqrt(sum)
//     for (var j = 0; j < spectrum.length; j++) {
//         spectrum[j] /= norm;
//     }
// }
contentSpectra = new Matrix(contentSpectra).transpose();
var spectraWhitoutZeros = [];
for (var i = 0; i < contentSpectra.rows; i++) {
    var column = contentSpectra[i];
    if (column.reduce((a,b) => a+b,0) !== 0) {
        spectraWhitoutZeros.push(column);
    }
}
spectraWhitoutZeros = new Matrix(spectraWhitoutZeros).transpose();
writeFile('src/data/spectraWhitoutZeros1',spectraWhitoutZeros[0])
writeFile('src/data/spectraWhitoutZeros2',spectraWhitoutZeros[1])
writeFile('src/data/spectraWhitoutZeros3',spectraWhitoutZeros[2])
