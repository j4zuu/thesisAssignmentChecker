import { useState } from 'react';
import axios from 'axios';
import Editor, { useMonaco } from '@monaco-editor/react';

const CheckAssignment = () => {
    const [assignmentId, setAssignmentId] = useState('');
    const [studentAnswer, setStudentAnswer] = useState('');
    const [openaiFeedback, setOpenaiFeedback] = useState('');
    const [geminiFeedback, setGeminiFeedback] = useState('');
    const [error, setError] = useState('');
    const [editorInstance, setEditorInstance] = useState<any>(null);
    const monaco = useMonaco();

    const handleCheck = async () => {
        try {
            const response = await axios.post('http://localhost:3000/assignments/check', {
                assignmentId,
                studentAnswer,
            });

            const { openaiFeedback, errorLocations } = response.data;

            setOpenaiFeedback(openaiFeedback || 'No feedback from OpenAI');
            setGeminiFeedback('No feedback from Gemini'); // Adjust if needed
            setError('');

            // Apply error markers if Monaco and the editor instance are available
            if (editorInstance && errorLocations) {
                const model = editorInstance.getModel();

                const markers = errorLocations.map((error: any) => ({
                    startLineNumber: error.startLine,
                    startColumn: error.startColumn,
                    endLineNumber: error.endLine,
                    endColumn: error.endColumn,
                    message: error.hint, // AI-generated hint
                    severity: monaco.MarkerSeverity.Error,
                }));

                monaco.editor.setModelMarkers(model, 'owner', markers);
            }
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
            <Editor
                height="400px"
                language="javascript"
                value={studentAnswer}
                onChange={(value) => setStudentAnswer(value || '')}
                options={{
                    minimap: { enabled: false },
                    automaticLayout: true,
                }}
                onMount={(editor) => {
                    setEditorInstance(editor);
                }}
            />
            <button onClick={handleCheck}>Check Answer</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {openaiFeedback && (
                <div>
                    <h3>OpenAI Feedback:</h3>
                    <p>{openaiFeedback}</p>
                </div>
            )}

            {geminiFeedback && (
                <div>
                    <h3>Gemini Feedback:</h3>
                    <p>{geminiFeedback}</p>
                </div>
            )}
        </div>
    );
};

export default CheckAssignment;