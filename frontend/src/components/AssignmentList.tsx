// src/components/AssignmentList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Assignment {
    id: string;
    title: string;
    description: string;
    correctAnswer: string;
}

const AssignmentList: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);

    useEffect(() => {
        axios.get('http://localhost:3000/assignments')
            .then(response => setAssignments(response.data))
            .catch(error => console.error('Error fetching assignments:', error));
    }, []);

    return (
        <div>
            <h2>Assignments</h2>
        <ul>
        {assignments.map((assignment) => (
                <li key={assignment.id}>
                    <h3>{assignment.title}</h3>
                    <p>{assignment.description}</p>
                    </li>
            ))}
        </ul>
        </div>
    );
};

export default AssignmentList;
