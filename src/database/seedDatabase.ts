import sqlite3 from 'sqlite3';

// Seed the database with initial data
async function seedDatabase() {
    const db = new sqlite3.Database('./database.sqlite', (err) => {
        if (err) {
            console.error('Error opening database ' + err.message);
        } else {
            const assignments = [
                {
                    title: 'Log to Console',
                    description: "Write a program that logs to the console this text: I'm printing to console! (1p)",
                    solution: `'use strict';\nconsole.log("I'm printing to console!");`,
                },
                {
                    title: 'Greet User',
                    description: "Write a program that prompts for the user's name and then greets the user. Print the result to the HTML document: Hello, Name! (2p)",
                    solution: `'use strict';\nconst username = prompt('Write your name.');\ndocument.querySelector('#target').innerHTML = \`Hello, \${username}!\`;`,
                },
                {
                    title: 'Sum, Product, and Average',
                    description: 'Write a program that prompts for three integers. The program prints the sum, product, and average of the numbers to the HTML document. (3p)',
                    solution: `'use strict';\nconst first = +prompt('Enter first integer');\nconst second = +prompt('Enter second integer');\nconst third = +prompt('Enter third integer');\ndocument.querySelector('#sum').innerHTML = \`The sum is \${first + second + third}\`;\ndocument.querySelector('#product').innerHTML = \`The product is \${first * second * third}\`;\ndocument.querySelector('#average').innerHTML = \`The average is \${(first + second + third) / 3}\`;`,
                },
            ];

            assignments.forEach((assignment) => {
                db.run(
                    `INSERT INTO assignments (title, description, solution) VALUES (?, ?, ?)`,
                    [assignment.title, assignment.description, assignment.solution],
                    (err) => {
                        if (err) {
                            console.error('Error inserting data ' + err.message);
                        }
                    }
                );
            });

            console.log('Database seeded with initial data.');
        }
    });
}

seedDatabase();
