const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from the current directory
app.use(express.static(__dirname));

// Route to handle contact form submissions
app.post('/api/contact', (req, res) => {
    const { name, email, inquiry, message } = req.body;

    // Server-side validation
    if (!name || !email || !inquiry || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields (name, email, inquiry, message) are required.'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address.'
        });
    }

    // Prepare submission entry
    const newSubmission = {
        id: 'SUB-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        inquiry,
        message: message.trim(),
        submittedAt: new Date().toISOString()
    };

    // Read existing submissions and save new one
    fs.readFile(SUBMISSIONS_FILE, 'utf8', (err, data) => {
        let submissions = [];

        if (!err && data) {
            try {
                submissions = JSON.parse(data);
                if (!Array.isArray(submissions)) {
                    submissions = [];
                }
            } catch (parseErr) {
                console.error('Error parsing submissions file, resetting database:', parseErr);
                submissions = [];
            }
        }

        submissions.push(newSubmission);

        fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error saving submission to file:', writeErr);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error. Failed to save your message.'
                });
            }

            console.log(`[Success] New contact inquiry received from: ${newSubmission.email}`);
            return res.status(200).json({
                success: true,
                message: 'Your message has been received successfully!'
            });
        });
    });
});

// Serve index.html as fallback for any routes not matched
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Ganvin Server running at http://localhost:${PORT} `);
    console.log(` Press Ctrl+C to stop the server`);
    console.log(`==================================================`);
});
