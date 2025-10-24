import * as tf from '@tensorflow/tfjs';

export async function predictCategory(text) {
    const model = await tf.loadLayersModel('/model/model.json');
    const inputTensor = preprocessText(text); // Tokenize, pad, etc.
    const prediction = model.predict(inputTensor);
    const categoryIndex = prediction.argMax(-1).dataSync()[0];
    return categoryIndex;
}