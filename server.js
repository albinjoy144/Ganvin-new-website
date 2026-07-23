const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable server and browser caching
app.set('etag', false);
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Block access to experience-premium-care.html from server (file remains on local disk)
app.all(['/experience-premium-care.html', '/experience-premium-care'], (req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Serve static assets from the current directory without caching
app.use(express.static(__dirname, {
    etag: false,
    lastModified: false,
    maxAge: 0
}));

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
