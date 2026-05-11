const User = require('../models/User');
const bcrypt = require('bcrypt');

/*-----Registration Logic----*/
exports.register = (req, res) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send("Error registering user.");
    }
};

/*-----Login Logic-----*/
exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { id: user._id, role: user.role };
        res.redirect('/dashboard');
    } else {
        res.send("Invalid credentials.");
    }
};