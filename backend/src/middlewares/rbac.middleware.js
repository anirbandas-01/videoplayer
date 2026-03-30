export const  checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if(!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.json(" or ")}`
            });
        }

        next();
    };
};

export const adminOnly = (req, res, next) => {
    if(!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authorization required"
        });
    }

    if(req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin details required"
        });
    }

    next();
};

export const editOrAdmin = (req, res, next) => {
    if(!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if(!["editor", "admin"].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Editor or Admin role required."
        });
    }

    next();
};


export const checkTenant = (req, res, next) => {
    if(!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    next();
};
