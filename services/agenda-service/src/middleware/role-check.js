import { AppError, catchAsync } from '@mualdoo/shared'

export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role']

        if (!allowedRoles.includes(userRole)) {
            throw new AppError('Permission denied', 403)
        }
        next()
    }
}
