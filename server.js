
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);


const geminiConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
};


const geminiModel = googleAI.getGenerativeModel({
    model: 'gemini-pro',
    geminiConfig,
});


const getBotResponseFromGemini = async (message) => {
    try {
        const result = await geminiModel.generateContent(message);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Error fetching response from Gemini:", error);
        throw new Error("Sorry, something went wrong with the bot. Please try again later.");
    }
};


io.on('connection', (socket) => {
    console.log('A user connected');


    socket.on('user message', async (msg) => {
        try {
            const botResponse = await getBotResponseFromGemini(msg);
            socket.emit('bot response', botResponse);
        } catch (error) {
            socket.emit('bot response', error.message || 'Something went wrong. Please try again later.');
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});


server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});