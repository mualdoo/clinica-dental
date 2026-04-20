import { ClinicalNote } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controler.js'

class ClinicalNoteService extends BaseService {
    constructor() {
        super(ClinicalNote)
    }
}

export const clinicalNoteService = new ClinicalNoteService()

class ClinicalNoteController extends BaseController {
    constructor() {
        super(clinicalNoteService)
    }
}

export const clinicalNoteController = new ClinicalNoteController()
