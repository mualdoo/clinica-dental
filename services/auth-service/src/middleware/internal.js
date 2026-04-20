import { catchAsync, AppError } from '@mualdoo/shared'

export const verifyInternalKey = catchAsync(async (req, res, next) => {
    const internalKey = req.headers['x-internal-service-key']

    if (internalKey !== process.env.INTERNAL_SERVICE_KEY) {
        throw new AppError('Access denied', 401)
    }
    next()
})
