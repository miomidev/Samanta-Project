import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No GEMINI_API_KEY found.');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];

    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

    for (const modelName of models) {
        try {
            console.log(`Checking ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            console.log(`✅ SUCCESS: ${modelName} responded: ${result.response.text()}`);
        } catch (e: any) {
            console.log(`❌ ERROR ${modelName}: [${e.status}] ${e.message}`);
        }
    }
}

testModels();
