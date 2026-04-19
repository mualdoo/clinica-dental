export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role']

        if (!allowedRoles.includes(userRole)) {
            return res.statur(403).json({ message: 'Invalid role' })
        }
        next()
    }
}
