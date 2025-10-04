const checkPermission = (permission) => {
    
    return (req, res, next) => {
        if (req.user.level === '1') {
            return next();
        }

        if (!req.user.permissions.includes(permission)) {
            return res.status(400).send('Access denied.');
        }

        next();
    };
};

module.exports = checkPermission;