import express from 'express';
import bodyParser from 'body-parser';
import assignmentRoutes from './routes/assignments';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/assignments', assignmentRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});