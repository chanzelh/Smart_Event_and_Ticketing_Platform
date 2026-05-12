const User = require('../models/User');
const bcrypt = require('bcrypt');

/*----- Registration Logic ----*/
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword, role } = req.body;

        if (!fullName || !email || !password || !confirmPassword || !role) {
            return res.status(400).send('Please fill in all fields.');
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match.');
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).send('A user with this email already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        res.redirect('/auth');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user.');
    }
};

/*----- Login Logic ----*/
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send('Invalid credentials.');
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.send('Invalid credentials.');
        }

        req.session.user = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        };

        if (user.role === 'Admin') {
            return res.redirect('/admin/dashboard');
        }

        if (user.role === 'Merchant') {
            return res.redirect('/admin/merchant/dashboard');
        }

        return res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in.');
    }
};

/*----- Logout Logic ----*/
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth');
    });
};