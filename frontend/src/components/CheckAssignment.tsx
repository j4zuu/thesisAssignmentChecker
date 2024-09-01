import React, { useState } from 'react';
import axios from 'axios';

const CheckAssignment: React.FC = () => {
    const [assignmentId, setAssignmentId] = useState('');
    const [studentAnswer, setStudentAnswer] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleCheck = async () => {
        try {
            const response = await axios.post('http://localhost:3000/assignments/check', {
                assignmentId,
                studentAnswer,
            });
            setFeedback(response.data.feedback);
        } catch (error) {
            console.error('Error checking assignment:', error);
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
            {feedback && (
                <div>
                    <h3>Feedback:</h3>
                    <p>{feedback}</p>
                </div>
            )}
        </div>
    );
};

export default CheckAssignment;
