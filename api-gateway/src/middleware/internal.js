export const verifyInternalKey = async (req, res, next) => {
    const internalKey = req.headers['x-internal-key']

    if (internalKey !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(401).json({
            success: false,
            error: 'Access denied',
        })
    }
    next()
}
