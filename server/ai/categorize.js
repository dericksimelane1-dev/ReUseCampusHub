const tf = require('@tensorflow/tfjs-node');

async function categorizeItem(title, description) {
    const inputText = `${title} ${description}`;
    const inputTensor = preprocessText(inputText);
    const model = await tf.loadLayersModel('file://models/model.json');
    const prediction = model.predict(inputTensor);
    const categoryIndex = prediction.argMax(-1).dataSync()[0];
    return categories[categoryIndex];
}