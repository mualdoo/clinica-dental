import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ message: 'Token is required' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decodedUser) => {
        if (err)
            return res.status(403).json({ message: 'Token expired or invalid' })

        req.headers['x-user-id'] = decodedUser.id
        req.headers['x-user-role'] = decodedUser.role
        if (decodedUser.activePatientId)
            req.headers['x-active-patient-id'] = decodedUser.activePatientId

        next()
    })
}
