
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
            console.warn(`Access Denied: User role "${userRole}" attempted to access: ${allowedRoles}`);
            return res.status(403).send('Access denied: Unauthorized role.');
        }

        next();
    };
};

module.exports = { isAuthenticated, authorizeRoles };