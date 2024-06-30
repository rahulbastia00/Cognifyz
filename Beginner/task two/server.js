const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2/promise'); // Import with promise support

const app = express();

// Set view engine to ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database connection pool (replace placeholders with your credentials)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Rahul@234',
  database: 'registration',
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/submit',
  body('email').isEmail(),
  body('dob').isISO8601().withMessage('Invalid date of birth format (YYYY-MM-DD)'),
  body('phonenum').isMobilePhone().isLength({ min: 10 }).withMessage('Enter a valid phone number (min 10 digits)'),
  body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 }).withMessage("Password must include lowercase, uppercase, and a number (min 8 characters)"),
  (async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Connect to the database
    const connection = await pool.getConnection();

    try {
      // Prepare the SQL statement to prevent SQL injection
      const sql = 'INSERT INTO information (username, email, phonenum) VALUES (?, ?, ?)';
      const [results] = await connection.query(sql, [req.body.username, req.body.email, req.body.phonenum]);

      console.log('Data submitted successfully:', results);

      // Release the connection back to the pool
      await connection.release();

      res.render('index2.ejs', {
        success: true,
        username: req.body.username,
        email: req.body.email,
        phonenum: req.body.phonenum,
        // Include data for other fields
        errors: errors.array() // Include errors if validation fails
      });
    } catch (error) {
      console.error('Error saving data to database:', error);
      res.status(500).json({ success: false, message: 'Error saving data' });
    } finally {
      // Ensure connection is released even on errors
      if (connection) await connection.release();
    }
  })
);

app.listen(port);
console.log('localhost:', port);
