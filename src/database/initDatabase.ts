import sqlite3 from 'sqlite3';

// Initialize the SQLite database and create the assignments table
async function initializeDatabase() {
    const db = new sqlite3.Database('./database.sqlite', (err) => {
        if (err) {
            console.error('Error opening database ' + err.message);
        } else {
            db.run(`
        CREATE TABLE IF NOT EXISTS assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          solution TEXT NOT NULL
        );
      `, (err) => {
                if (err) {
                    console.error('Error creating table ' + err.message);
                } else {
                    console.log('Database and table initialized.');
                }
            });
        }
    });
}

initializeDatabase();
