const bcrypt = require('bcrypt'); // or 'bcrypt'
const User = require('../models/User'); // Path to your User model

/*-----Registration Logic----*/
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            fullName,
            email,
            username: email, // ✅ This maps the Email Address to the Username field
            password: hashedPassword, 
            role: role || 'user' 
        });
        
        await newUser.save();
        res.redirect('/auth/login?success=true');
    } catch (err) {
        console.error("DETAILED REGISTER ERROR:", err);
        res.status(500).send("Error registering user: " + err.message);
    if (err.code === 11000) {
        return res.status(400).send("That email is already registered. Please login instead.");
    }
    console.error("Reg Error:", err);
    res.status(500).send("Error registering user: " + err.message);
}
};

/*-----Login Logic-----*/
exports.login = async (req, res) => {
    console.log("RAW BODY RECEIVED:", req.body);
    try {
        let { username, password } = req.body;

        // 1. Normalize the email (username) to lowercase
        // This prevents login failure if the user types "John@Gmail.com" 
        // but registered as "john@gmail.com"
        const cleanUsername = username.trim().toLowerCase();

        const user = await User.findOne({ username: cleanUsername });

        console.log("--- Login Debug ---");
        console.log("Searching for:", cleanUsername);
        console.log("User found in DB:", user ? "Yes" : "No");
        
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            console.log("Password Match:", isMatch);
            
            if (isMatch) {
                // Store minimal info in session
                req.session.user = { 
                    id: user._id, 
                    role: user.role, 
                    fullName: user.fullName,
                    username: user.username 
                };
                
                console.log("Session set for:", user.username);
                return res.redirect('/'); 
            }
        }

        // If we get here, either user wasn't found or password failed
        res.send("Invalid credentials.");

    } catch (error) {
        console.error("Critical Login Error:", error);
        res.status(500).send("Login Error");
    }
};