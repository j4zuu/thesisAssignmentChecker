import React, { useState } from 'react';
import axios from 'axios';

const AddAssignment: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:3000/assignments', {
                title,
                description,
                correctAnswer,
            });
            alert('Assignment added successfully!');
            setTitle('');
            setDescription('');
            setCorrectAnswer('');
        } catch (error) {
            console.error('Error adding assignment:', error);
        }
    };

    return (
        <div>
            <h2>Add Assignment</h2>
                <form onSubmit={handleSubmit}>
                <input
                    type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />
                <textarea
                placeholder="Correct Answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                />
                <button type="submit">Add Assignment</button>
                </form>
                </div>
            )
};

export default AddAssignment;
