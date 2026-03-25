const { Tooth } = require('../models');
const { ok, fail } = require('@aldop-11/shared');

exports.addTooth = async (req, res) => {
    try {
        const tooth = await Tooth.create({
            ...req.body,
            patientId: req.params.id
        });

        const dataResponse = {
            id: tooth.id,
            number: tooth.number
        };
        return ok(res, dataResponse, 201);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.getAllTeeth = async (req, res) => {
    try {
        const teeth = await Tooth.findAll({
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
        const tooth = await Tooth.findByPk(req.params.toothId);

        if (!tooth) return fail(res, 'Tooth not found', 404);

        return ok(res, tooth);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.getTeethByNumber = async (req, res) => {
    try {
        const teeth = await Tooth.findAll({
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
        const tooth = await Tooth.findByPk(req.params.toothId);

        if (!tooth) return fail(res, 'Tooth not found', 404);

        await tooth.update(req.body);

        return ok(res, 'Tooth updated');
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.deleteTooth = async (req, res) => {
    try {
        const tooth = await Tooth.findByPk(req.params.toothId);

        if (!tooth) return fail(res, 'Tooth not found', 404);

        await tooth.destroy();

        return ok(res, 'Tooth deleted');
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};