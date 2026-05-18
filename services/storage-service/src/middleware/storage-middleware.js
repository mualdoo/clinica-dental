export const hybridAuth = (allowedRoles) => {
    return (req, res, next) => {
        // 1. VÍA INTERNA
        const internalKey = req.headers['x-internal-key']

        if (internalKey) {
            if (internalKey === process.env.INTERNAL_SERVICE_KEY) {
                req.isInternalCall = true
                return next()
            }
            return res
                .status(401)
                .json({
                    success: false,
                    error: 'Access denied: Invalid internal key',
                })
        }

        // 2. VÍA EXTERNA
        const userRole = req.headers['x-user-role']

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res
                .status(403)
                .json({ message: 'Invalid role or unauthorized access' })
        }

        // El rol es válido
        req.isInternalCall = false
        next()
    }
}
