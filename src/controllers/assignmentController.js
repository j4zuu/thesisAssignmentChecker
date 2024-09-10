var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import OpenAI from 'openai';
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();
// Initialize OpenAI API client using the API key from environment variables
var openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// Function to open a database connection
function getDbConnection() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, open({
                    filename: './database.sqlite',
                    driver: sqlite3.Database // Specify the driver
                })];
        });
    });
}
// Get all assignments
export var getAssignments = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, assignments, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, getDbConnection()];
            case 1:
                db = _a.sent();
                return [4 /*yield*/, db.all('SELECT * FROM assignments')];
            case 2:
                assignments = _a.sent();
                res.json(assignments);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error(error_1);
                res.status(500).json({ error: 'Failed to fetch assignments.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Add a new assignment
export var addAssignment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, correctAnswer, db, result, newAssignment, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, title = _a.title, description = _a.description, correctAnswer = _a.correctAnswer;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, getDbConnection()];
            case 2:
                db = _b.sent();
                return [4 /*yield*/, db.run('INSERT INTO assignments (title, description, solution) VALUES (?, ?, ?)', title, description, correctAnswer)];
            case 3:
                result = _b.sent();
                newAssignment = {
                    id: result.lastID,
                    title: title,
                    description: description,
                    correctAnswer: correctAnswer,
                };
                res.status(201).json(newAssignment);
                return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                console.error(error_2);
                res.status(500).json({ error: 'Failed to add assignment.' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Check a student's assignment answer
export var checkAssignment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, studentAnswer, assignmentId, db, assignment, prompt_1, response, feedback, error_3;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = req.body, studentAnswer = _a.studentAnswer, assignmentId = _a.assignmentId;
                _d.label = 1;
            case 1:
                _d.trys.push([1, 5, , 6]);
                return [4 /*yield*/, getDbConnection()];
            case 2:
                db = _d.sent();
                return [4 /*yield*/, db.get('SELECT * FROM assignments WHERE id = ?', assignmentId)];
            case 3:
                assignment = _d.sent();
                if (!assignment) {
                    return [2 /*return*/, res.status(404).json({ error: 'Assignment not found' })];
                }
                prompt_1 = "Evaluate the following student answer against the correct answer. \n        Assignment: ".concat(assignment.title, "\n        Correct Answer: ").concat(assignment.solution, "\n        Student Answer: ").concat(studentAnswer, "\n        \n        Feedback:");
                return [4 /*yield*/, openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [
                            { role: "system", content: "You are a programming instructor." },
                            { role: "user", content: prompt_1 },
                        ],
                    })];
            case 4:
                response = _d.sent();
                feedback = (_c = (_b = response.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
                res.json({ feedback: feedback });
                return [3 /*break*/, 6];
            case 5:
                error_3 = _d.sent();
                console.error(error_3);
                res.status(500).json({ error: 'Error processing the request.' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
