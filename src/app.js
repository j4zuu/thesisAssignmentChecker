// src/app.ts
import express from 'express';
import bodyParser from 'body-parser';
import assignmentRoutes from './routes/assignments';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the cors middleware
dotenv.config(); // Load environment variables from .env file
var app = express();
var PORT = 3000;
// Use CORS middleware to allow requests from the front-end
app.use(cors({
    origin: 'http://localhost:5173', // Allow only the front-end server to access
}));
app.use(bodyParser.json());
app.use('/assignments', assignmentRoutes);
app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
});
