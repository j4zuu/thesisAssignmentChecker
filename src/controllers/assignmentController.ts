import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import OpenAI from 'openai';
import * as esprima from 'esprima';
import estraverse from 'estraverse'; // For traversing the ASTs
import dotenv from "dotenv";

// Structure to hold error positions
interface ErrorLocation {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    hint: string;
}

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
        driver: sqlite3.Database, // Specify the driver
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

function compareASTs(studentAST: any, solutionAST: any): ErrorLocation[] {
    const errorLocations: ErrorLocation[] = [];
    console.log("student here:", studentAST.body)
    console.log("solution here:", solutionAST.body)


    estraverse.traverse(studentAST, {
        enter(node) {
            const correspondingNode = solutionAST.body.find(
                (solNode: any) => solNode.value === node.value
            );
            if (!correspondingNode) {
                errorLocations.push({
                    startLine: node.loc.start.line,
                    startColumn: node.loc.start.column,
                    endLine: node.loc.end.line,
                    endColumn: node.loc.end.column,
                    hint: `This part of your code doesn’t match the expected structure.`,
                });
            }
        },
    });

    return errorLocations;
}
// Check a student's assignment answer
export const checkAssignment = async (req: Request, res: Response) => {
    const { studentAnswer, assignmentId } = req.body;
    try {
        const db = await getDbConnection();
        const assignment = await db.get('SELECT * FROM assignments WHERE id = ?', assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const correctSolution = assignment.solution;

        // Prepare a prompt for OpenAI to get hints, including a request for line and column locations
        const prompt = `
            You are a programming instructor. Compare the following student's answer to the correct solution. Identify each difference with precise line and column positions where only the specific error occurs. Provide each issue in JSON format: 
            
            [{"startLine": number, "startColumn": number, "endLine": number, "endColumn": number, "hint": string}, ...]
            
            **Important**: 
            - The JSON should reflect *only the exact error part* for startColumn and endColumn.
            - Output JSON only. Avoid explanations, formatting markers, or code blocks.
            
            Student Answer: ${studentAnswer}
            Correct Solution: ${correctSolution}
        `;


        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a programming instructor." },
                { role: "user", content: prompt },
            ],
        });

        // Extract and clean up the response
        let openaiFeedback = openaiResponse.choices[0]?.message?.content || "";
        openaiFeedback = openaiFeedback.replace(/```json|```/g, "").trim();

        let errorLocations: ErrorLocation[] = [];

        try {
            // Parse the cleaned AI response as JSON
            errorLocations = JSON.parse(openaiFeedback);
        } catch (parseError) {
            console.error("Failed to parse AI feedback as JSON", parseError);
            console.error("Received Feedback:", openaiFeedback);
        }

        // Send the feedback and error locations to the client
        res.json({
            openaiFeedback,
            errorLocations: errorLocations.map((error, index) => ({
                ...error,
                hint: error.hint, // Use AI-generated hints
            })),
        });
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).json({ error: 'Error processing the request.' });
    }
};