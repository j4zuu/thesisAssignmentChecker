import axios from 'axios';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const CheckAssignment = () => {
    const [assignmentId, setAssignmentId] = useState('');
    const [studentAnswer, setStudentAnswer] = useState('');
    const [openaiFeedback, setOpenaiFeedback] = useState('');
    const [geminiFeedback, setGeminiFeedback] = useState('');
    const [error, setError] = useState('');

    const handleCheck = async () => {
        try {
            const response = await axios.post('http://localhost:3000/assignments/check', {
                assignmentId,
                studentAnswer,
            });

            // Assuming the response contains both OpenAI and Gemini feedback
            setOpenaiFeedback(response.data.openaiFeedback);
            setGeminiFeedback(response.data.geminiFeedback);
            setError(''); // Clear any previous error
        } catch (error) {
            console.error('Error checking assignment:', error);
            setError('Failed to check assignment. Please try again.');
        }
    };

    return (
        <div>
            <h2>Check Assignment</h2>
            <input
                type="text"
                placeholder="Assignment ID"
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
            />
            <textarea
                placeholder="Student Answer"
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
            />
            <button onClick={handleCheck}>Check Answer</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {openaiFeedback && (
                <div>
                    <h3>OpenAI Feedback:</h3>
                    <ReactMarkdown>{openaiFeedback}</ReactMarkdown>
                </div>
            )}

            {geminiFeedback && (
                <div>
                    <h3>Gemini Feedback:</h3>
                    <ReactMarkdown>{geminiFeedback}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export default CheckAssignment;