import { User, PatientToken } from '../models/index.js'
import { generateToken } from './user-service.js'
import { ok, fail, catchAsync } from '@mualdoo/shared'

export const verifyPatientAccount = catchAsync(async (req, res) => {
    const { token, email, password } = req.body
    const user = await User.findOne({ where: { email }, include: PatientToken })

    if (!user) return fail(res, 'User not found')
    if (!user.PatientToken.isTokenValid(token))
        return fail(res, 'Invalid or expired token')

    await user.update({ password })
    await user.PatientToken.destroy()

    return ok(res, 'Account verified')
})

const setCookieToken = (res, refreshToken, days = 7) => {
    const daysInMIllis = days * 24 * 60 * 60 * 1000
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: daysInMIllis,
    })
}

export const register = catchAsync(async (req, res) => {
    const user = await User.create({
        ...req.body,
        role: 'patient',
    })

    const { accessToken, refreshToken } = generateToken(user)
    await user.update({ refreshToken })

    setCookieToken(res, refreshToken)

    const dataResponse = {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        accessToken,
    }
    return ok(res, dataResponse, 201)
})

export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })

    if (!user) return fail(res, 'Invallid login')
    if (!user.isVerified()) return fail(res, 'User email is not verified')
    const rightPassword = await user.verifyPassword(password)
    if (!rightPassword) return fail(res, 'Invallid login')

    const { accessToken, refreshToken } = generateToken(user)
    await user.update({ refreshToken })

    setCookieToken(res, refreshToken)

    const dataResponse = {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        accessToken,
    }
    return ok(res, dataResponse)
})

export const refreshToken = async (req, res) => {
    const cookieToken = req.cookies.refreshToken

    if (!cookieToken) {
        return fail(res, 'Not active session', 401)
    }

    const decoded = jwt.verify(cookieToken, process.env.JWT_REFRESH_SECRET)

    const user = await User.findByPk(decoded.id)
    if (!user || user.refreshToken !== cookieToken) {
        return fail(res, 'Invalid or expired session', 403)
    }

    const { accessToken, refreshToken } = generateToken(user)

    await user.update({ refreshToken })

    setCookieToken(res, refreshToken)

    return ok(res, { accessToken })
}

export const logout = async (req, res) => {
    const cookeToken = req.cookies.refreshToken

    if (cookieToken) {
        await User.update(
            { refreshToken: null },
            { where: { refreshToken: cookieToken } }
        )
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'Strict',
    })

    return ok(res, 'Session closed')
}

export const getInfo = catchAsync(async (req, res) => {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) return fail(res, 'Patient not found')

    const dataResponse = {
        email: user.email,
        fullName: user.getFullName(),
        role: user.role,
    }

    return ok(res, dataResponse)
})
