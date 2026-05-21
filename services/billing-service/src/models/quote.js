import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class Quote extends Model {
    isActive() {
        return this.status !== 'draft'
    }
    isOverdue() {
        const today = new Date()
        return today > new Date(this.validUntil)
    }
    isAmountValid(amount) {
        return this.total - amount >= 0
    }
}

Quote.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        patientId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        notes: {
            type: DataTypes.STRING,
        },
        total: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        itemCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM(
                'draft',
                'sent',
                'accepted',
                'rejected',
                'expired',
                'paid'
            ),
            defaultValue: 'draft',
        },
        validUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        hooks: {
            beforeUpdate: (quote) => {
                // Obtenemos los campos modificados al inicio para poder usarlos en ambas validaciones
                const changedFields = quote.changed() || []

                // Nueva validación: Bloquear el cambio de estado si el no hay items registrados
                if (
                    changedFields.includes('status') &&
                    Number(quote.getDataValue('itemCount')) === 0
                ) {
                    throw new Error(
                        'Acción bloqueada: No se puede cambiar el estado de la cotización si no tiene tratamientos registrados.'
                    )
                }

                const previousStatus = quote.previous('status')

                if (previousStatus !== 'draft') {
                    const forbiddenChanges = changedFields.filter(
                        (field) => field !== 'status'
                    )

                    if (forbiddenChanges.length > 0) {
                        throw new Error(
                            `Acción bloqueada: La cotización está en estado '${previousStatus}'. ` +
                                `Solo se permite cambiar su estado. Intentaste modificar: ${forbiddenChanges.join(', ')}`
                        )
                    }

                    if (
                        changedFields.includes('status') &&
                        quote.getDataValue('status') === 'draft'
                    ) {
                        throw new Error(
                            `Acción bloqueada: Una cotización activa (estado actual: '${previousStatus}') no puede regresar a estado 'draft'.`
                        )
                    }
                }
            },
            beforeDestroy: (quoteInstance) => {
                if (quoteInstance.isActive())
                    throw new Error('Active quotes cannot be changed')
            },
        },
    }
)

export default Quote
