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
        const identifier = (username || "").toLowerCase().trim();

        // CHANGE: Query 'email' instead of 'username'
        const foundUser = await User.findOne({ email: identifier });

        if (foundUser) {
            const isMatch = await bcrypt.compare(password, foundUser.password);

            if (isMatch) {
                req.session.user = { 
                id: foundUser._id, 
                role: foundUser.role, // This will be "Admin" or "Merchant" from DB
                fullName: foundUser.fullName 
    };

    // Use exact casing for redirects
    if (foundUser.role === 'Admin') return res.redirect('/admin/dashboard');
    if (foundUser.role === 'Merchant') return res.redirect('/admin/merchant/dashboard');
    
    return res.redirect('/'); 
}
        }

        // If we reach here, either user wasn't found OR password didn't match
        return res.render('auth/auth', { 
            error: "Invalid email or password.", 
            success: null 
        });

    } catch (error) {
        console.error("CRITICAL LOGIN ERROR:", error);
        return res.status(500).render('auth/auth', { 
            error: "A server error occurred.", 
            success: null 
        });
    }
};

/*----- Logout Logic ----*/
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout Error:", err);
        }
        // Change from '/auth' to '/auth/login'
        res.redirect('/auth/login'); 
    });
};