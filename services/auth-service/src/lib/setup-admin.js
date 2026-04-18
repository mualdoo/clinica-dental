import { User } from '../models/index.js'

export default async () => {
    try {
        const adminExists = await User.findOne({ where: { role: 'admin' } })

        if (!adminExists) {
            await User.create({
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                name: 'Admin',
                lastName: 'Principal',
                role: 'admin',
            })
        }
    } catch (error) {
        console.log('Error creating default admin')
    }
}
