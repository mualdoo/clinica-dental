import { ClinicalNote } from '../models/index.js'
import {
    BaseAssociatedService,
    BaseAssociatedController,
} from './base/base-associated-controler.js'

class ClinicalNoteService extends BaseAssociatedService {
    constructor() {
        super(ClinicalNote)
    }
}

export const clinicalNoteService = new ClinicalNoteService()

class ClinicalNoteController extends BaseAssociatedController {
    constructor() {
        super(clinicalNoteService)
    }
}

export const clinicalNoteController = new ClinicalNoteController()
