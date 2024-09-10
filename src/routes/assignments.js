import express from 'express';
import { getAssignments, addAssignment, checkAssignment } from '../controllers/assignmentController';
var router = express.Router();
router.get('/', getAssignments);
router.post('/', addAssignment);
router.post('/check', checkAssignment);
export default router;
