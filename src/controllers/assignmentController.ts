import { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import OpenAI from 'openai';
import * as esprima from 'esprima';
import estraverse from 'estraverse'; // For traversing the ASTs
import dotenv from "dotenv";

console.log(esprima); // This should not be undefined

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

// Compare two ASTs
function compareASTs(studentAST: any, solutionAST: any): ErrorLocation[] {
    const errorLocations: ErrorLocation[] = [];

    estraverse.traverse(studentAST, {
        enter: function (node: { type: any; loc: { start: { line: any; column: any; }; end: { line: any; column: any; }; }; }, parent: any) {
            // Find the corresponding node in the solution AST
            const correspondingNode = solutionAST.body.find((solNode: any) => solNode.type === node.type);
            if (!correspondingNode) {
                errorLocations.push({
                    startLine: node.loc.start.line,
                    startColumn: node.loc.start.column,
                    endLine: node.loc.end.line,
                    endColumn: node.loc.end.column,
                    hint: `Check the usage of ${node.type}. It might not match the expected solution.`,
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

        // Try to parse the student's code and the correct solution using esprima
        let studentAST, solutionAST;
        try {
            studentAST = esprima.parseScript(studentAnswer, { loc: true });
            solutionAST = esprima.parseScript(correctSolution, { loc: true });
        } catch (error) {
            return res.status(400).json({
                error: 'Failed to parse student or solution code.',
                details: error.message,
            });
        }

        // Compare the ASTs and get error locations
        const errorLocations = compareASTs(studentAST, solutionAST);

        // Prepare a prompt for OpenAI to get hints
        const prompt = `Evaluate the following student's answer and provide constructive feedback for the following error locations: ${JSON.stringify(errorLocations)}. Student Answer: ${studentAnswer} Correct Solution: ${correctSolution}`;

        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a programming instructor." },
                { role: "user", content: prompt },
            ],
        });

        const openaiFeedback = openaiResponse.choices[0]?.message?.content;

        // Send the feedback and error locations to the client
        res.json({
            openaiFeedback,
            errorLocations: errorLocations.map((error, index) => ({
                ...error,
                hint: openaiFeedback?.split('\n')[index] || error.hint, // Use AI-generated hints
            })),
        });
    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).json({ error: 'Error processing the request.' });
    }
};