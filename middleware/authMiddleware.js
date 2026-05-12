// middleware/authMiddleware.js

const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/auth/login');
    }

    next();
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.redirect('/auth/login');
        }

        const userRole = req.session.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).send('Access denied: You do not have permission to view this page.');
        }

        next();
    };
};

module.exports = {
    isAuthenticated,
    authorizeRoles
};