const { Patient } = require('../models');
const { ok, fail, publishEvent } = require('@mualdoo/shared');

exports.addPatient = async (req, res) => {
    try {
        const patient = await Patient.create(req.body);

        return ok(res, patient, 201);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll({ attributes: ['id', 'name', 'lastName', 'email', 'phone'] });

        return ok(res, patients);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) return fail(res, 'Patient not found', 404);

        return ok(res, patient);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) return fail(res, 'Patient not found', 404);

        await patient.update(req.body);

        return ok(res, 'Patient updated');
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) return fail(res, 'Patient not found', 404);

        await patient.destroy();

        return ok(res, 'Patient deleted');
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};