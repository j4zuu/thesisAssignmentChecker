import React from 'react';
import AssignmentList from './components/AssignmentList';
import AddAssignment from './components/AddAssignment';
import CheckAssignment from './components/CheckAssignment';

const App: React.FC = () => {
    return (
        <div>
            <h1>Assignment Checker App</h1>
            <AddAssignment />
            <AssignmentList />
            <CheckAssignment />
        </div>
    );
};

export default App;
