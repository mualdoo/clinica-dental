const { HealthAlert } = require('../models');
const { ok, fail, catchAsync } = require('@mualdoo/shared');

exports.addAlert = catchAsync(async (req, res) => {
    const alert = await HealthAlert.create({
        ...req.body,
        patientId: req.params.id
    });

    const { id, type } = alert;
    return ok(res, { id, type }, 201);
});

exports.getAllTeeth = async (req, res) => {
    try {
        const teeth = await HealthAlert.findAll({
            where: { patientId: req.params.id },
            attributes: ['id', 'number']
        });

        return ok(res, teeth);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.getToothById = async (req, res) => {
    try {
        const tooth = await HealthAlert.findByPk(req.params.toothId);

        if (!tooth) return fail(res, 'Tooth not found', 404);

        return ok(res, tooth);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.getTeethByNumber = async (req, res) => {
    try {
        const teeth = await HealthAlert.findAll({
            where: {
                patientId: req.params.id,
                number: req.params.toothNumber
            }
        });

        return ok(res, teeth);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.updateTooth = async (req, res) => {
    try {
        const tooth = await HealthAlert.findByPk(req.params.toothId);

        if (!tooth) return fail(res, 'Tooth not found', 404);

        await tooth.update(req.body);

        return ok(res, 'Tooth updated');
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.deleteTooth = async (req, res) => {
    try {
        const tooth = await HealthAlert.findByPk(req.params.toothId);

        if (!tooth) return fail(res, 'Tooth not found', 404);

        await tooth.destroy();

        return ok(res, 'Tooth deleted');
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};