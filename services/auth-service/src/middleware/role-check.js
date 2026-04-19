import { AppError, catchAsync } from '@mualdoo/shared'

export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role']

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Permission denied',
            })
        }
        next()
    }
}
