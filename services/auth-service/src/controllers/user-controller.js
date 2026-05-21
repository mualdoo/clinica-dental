import { User, ActivationToken } from '../models/index.js'
import { generateToken } from './user-service.js'
import { ok, fail, catchAsync, publishEvent } from '@mualdoo/shared'
import { Op } from 'sequelize'
import jwt from 'jsonwebtoken'
import amqp from 'amqplib'

export const verifyPatientAccount = catchAsync(async (req, res) => {
    const { token, email, password } = req.body
    const user = await User.findOne({
        where: { email },
        include: ActivationToken,
    })

    if (!user) return fail(res, 'User not found')
    if (!user.ActivationToken.isTokenValid(token))
        return fail(res, 'Invalid or expired token')

    await user.update({ password })
    await user.ActivationToken.destroy()

    return ok(res, 'Account verified')
})

const setRefreshTokenInCookie = (res, refreshToken, days = 7) => {
    const daysInMIllis = days * 24 * 60 * 60 * 1000
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: daysInMIllis,
    })
}

const setAccessTokenInCookie = (res, accessToken, minutes = 30) => {
    const minutesInMillis = minutes * 60 * 1000
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: minutesInMillis,
    })
}

const register = async (res, data, setCookies = true) => {
    const user = await User.create(data)

    const { accessToken, refreshToken } = generateToken(user)
    await user.update({ refreshToken })

    if (setCookies) {
        setRefreshTokenInCookie(res, refreshToken)
        setAccessTokenInCookie(res, accessToken)
    }

    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            lastName: user.lastName,
        },
        accessToken,
    }
}

export const registerPatient = catchAsync(async (req, res) => {
    const user = await register(res, {
        ...req.body,
        role: 'patient',
    })
    return ok(res, user, 201)
})

export const registerUser = catchAsync(async (req, res) => {
    const dataResponse = await register(res, req.body, false)

    const activationToken = await ActivationToken.create({
        userId: dataResponse.user.id,
    })

    await publishEvent(
        amqp,
        'user_account_created_exchange',
        process.env.RABBITMQ_URL,
        {
            email: dataResponse.user.email,
            fullName: `${dataResponse.user.name} ${dataResponse.user.lastName}`,
            token: activationToken.activationToken,
            role: dataResponse.user.role,
        }
    )

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

    setRefreshTokenInCookie(res, refreshToken)
    setAccessTokenInCookie(res, accessToken)

    const dataResponse = {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            lastName: user.lastName,
        },
        accessToken,
    }
    return ok(res, dataResponse)
})

export const refreshToken = catchAsync(async (req, res) => {
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

    setRefreshTokenInCookie(res, refreshToken)
    setAccessTokenInCookie(res, accessToken)

    const dataResponse = {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            lastName: user.lastName,
        },
        accessToken,
    }

    return ok(res, dataResponse)
})

export const logout = catchAsync(async (req, res) => {
    const cookieToken = req.cookies.refreshToken

    if (cookieToken) {
        await User.update(
            { refreshToken: null },
            { where: { refreshToken: cookieToken } }
        )
    }
    const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        expires: new Date(0), // Fecha en el pasado
    }

    res.cookie('accessToken', '', cookieOptions)
    res.cookie('refreshToken', '', cookieOptions)

    return ok(res, 'Session closed')
})

export const getInfo = catchAsync(async (req, res) => {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) return fail(res, 'User not found')

    const dataResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
    }

    return ok(res, dataResponse)
})

export const findDentistByKey = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, key } = req.query
    const term = `%${key.trim()}%`

    const result = await User.findAndCountAll({
        where: {
            [Op.or]: [
                { name: { [Op.iLike]: term } },
                { lastName: { [Op.iLike]: term } },
                { email: { [Op.iLike]: term } },
            ],
            role: 'dentist',
        },
        limit,
        order: [
            ['lastName', 'ASC'],
            ['name', 'ASC'],
        ],
        attributes: ['id', 'name', 'lastName', 'email'],
    })

    const dataResponse = {
        data: result.rows,
        total: result.count,
        page: parseInt(page),
        totalPages: Math.ceil(result.count / limit),
    }

    return ok(res, dataResponse)
})

export const getUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, role = null } = req.query

    const filter = role ? { role } : {}

    const offset = (page - 1) * limit

    const result = await User.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: {
            exclude: ['password', 'refreshToken'],
        },
        where: filter,
    })

    const response = {
        data: result.rows,
        total: result.count,
        page: parseInt(page),
        totalPages: Math.ceil(result.count / limit),
    }

    return ok(res, response)
})
