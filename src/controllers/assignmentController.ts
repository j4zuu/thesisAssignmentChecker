import {Request, Response} from 'express';
import sqlite3 from 'sqlite3';
import {Database, open} from 'sqlite';
import OpenAI from 'openai';
import dotenv from "dotenv";

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI API client using the API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

// Function to open a database connection
async function getDbConnection(): Promise<Database> {
    return open({
        filename: './database.sqlite',
        driver: sqlite3.Database // Specify the driver
    });
}


// Function to call Gemini's API (Replace with actual implementation)
async function getGeminiFeedback(prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        const result = model.generateContent(prompt)
        return await result;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to fetch feedback from Gemini.');
    }
}


// Get all assignments
export const getAssignments = async (req: Request, res: Response) => {
    try {
        const db = await getDbConnection();
        const assignments = await db.all('SELECT * FROM assignments');
        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch assignments.' });
    }
};

// Add a new assignment
export const addAssignment = async (req: Request, res: Response) => {
    const { title, description, correctAnswer } = req.body;
    try {
        const db = await getDbConnection();
        const result = await db.run(
            'INSERT INTO assignments (title, description, solution) VALUES (?, ?, ?)',
            title,
            description,
            correctAnswer
        );

        const newAssignment = {
            id: result.lastID, // Get the ID of the newly inserted row
            title,
            description,
            correctAnswer,
        };

        res.status(201).json(newAssignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add assignment.' });
    }
};

// Check a student's assignment answer
export const checkAssignment = async (req: Request, res: Response) => {
    const { studentAnswer, assignmentId } = req.body;
    try {
        const db = await getDbConnection();
        const assignment = await db.get('SELECT * FROM assignments WHERE id = ?', assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Prepare the prompt for OpenAI API
        const prompt = `Evaluate the following student answer against the correct answer. 
        Assignment: ${assignment.title}
        Correct Answer: ${assignment.solution}
        Student Answer: ${studentAnswer}
        
        Feedback:`;

        // Fetch feedback from OpenAI and Gemini APIs in parallel
        const [openaiResponse, geminiResponse] = await Promise.all([
            openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a programming instructor." },
                    { role: "user", content: prompt },
                ],
            }),
            getGeminiFeedback(prompt)
        ]);

        // Extract feedback from OpenAI response
        const openaiFeedback = openaiResponse.choices[0]?.message?.content;
        // @ts-ignore
        const geminiFeedback = geminiResponse.response?.candidates[0]?.content?.parts[0]?.text;

        // Send both feedbacks to the client
        res.json({
            openaiFeedback,
            geminiFeedback,
        });
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).json({ error: 'Error processing the request.' });
    }
};