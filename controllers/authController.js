const User = require('../models/User');
const bcrypt = require('bcrypt');

/*----- Registration Logic ----*/
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            fullName,
            email,
            username: email.toLowerCase(),
            password: hashedPassword, 
            role: role || 'user' 
        });
        
        await newUser.save();
        return res.redirect('/auth/login?success=true');

    } catch (err) {
        // Check for MongoDB Duplicate Key Error (Code 11000)
        if (err.code === 11000) {
            // We RENDER the page and pass the error variable
            return res.render('auth/auth', { 
                error: "A user with this email already exists.", 
                success: null 
            });
        }
        
        console.error("Registration Error:", err);
        return res.status(500).render('auth/auth', { 
            error: "An error occurred. Please try again.", 
            success: null 
        });
    }
};

/*----- Login Logic ----*/
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user and normalize email to lowercase
        const foundUser = await User.findOne({ username: username.toLowerCase() });

        // Validate User & Password
        if (foundUser && await bcrypt.compare(password, foundUser.password)) {
            
            // Set Session (Use 'foundUser' because 'user' was causing the ReferenceError)
            req.session.user = { 
                id: foundUser._id, 
                role: foundUser.role, 
                fullName: foundUser.fullName 
            };

            // Role-Based Redirects (MUST be inside this success block)
            // Using toLowerCase() here makes our code safer against DB typos
            const role = foundUser.role.toLowerCase();

            if (role === 'admin') {
                return res.redirect('/admin/dashboard');
            }

            if (role === 'merchant') {
                return res.redirect('/admin/merchant/dashboard');
            }

            // Default redirect for normal users
            return res.redirect('/'); 

        } else {
            // Handle Invalid Credentials
            // Using 'return' ensures the code STOPS here
            return res.render('auth/auth', { 
                error: "Invalid email or password.", 
                success: null 
            });
        }
    } catch (error) {
        console.error("CRITICAL LOGIN ERROR:", error);
        
        // Safety check: Only send an error response if we haven't already
        if (!res.headersSent) {
            return res.status(500).render('auth/auth', { 
                error: "A server error occurred. Please try again.", 
                success: null 
            });
        }
    }
};

/*----- Logout Logic ----*/
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth');
    });
};