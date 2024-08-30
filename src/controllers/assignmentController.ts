import { Request, Response } from 'express';
import { assignments, Assignment } from '../models/assignment';
import OpenAI from 'openai';

console.log("key here:", process.env.OPENAI_API_KEY)

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getAssignments = (req: Request, res: Response) => {
    res.json(assignments);
};

export const addAssignment = (req: Request, res: Response) => {
    const { title, description, correctAnswer } = req.body;
    const newAssignment: Assignment = {
        id: new Date().toISOString(),
        title,
        description,
        correctAnswer,
    };
    assignments.push(newAssignment);
    res.status(201).json(newAssignment);
};

export const checkAssignment = async (req: Request, res: Response) => {
    const { studentAnswer, assignmentId } = req.body;
    const assignment = assignments.find((a) => a.id === assignmentId);

    if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
    }

    // Prepare the prompt for OpenAI API
    const prompt = `Evaluate the following student answer against the correct answer. 
  Assignment: ${assignment.title}
  Correct Answer: ${assignment.correctAnswer}
  Student Answer: ${studentAnswer}
  
  Feedback:`;

    try {
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