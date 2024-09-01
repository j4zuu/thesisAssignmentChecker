import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import OpenAI from 'openai';
import dotenv from "dotenv";

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

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a programming instructor." },
                { role: "user", content: prompt },
            ],
        });

        const feedback = response.choices[0]?.message?.content;
        res.json({ feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing the request.' });
    }
};