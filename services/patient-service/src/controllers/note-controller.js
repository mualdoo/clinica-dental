import { ClinicalNote } from '../models/index.js';
import { BaseAssociatedService, BaseAssociatedController } from './base/base-associated-controler.js';

class ClinicalNoteService extends BaseAssociatedService {
    constructor() {
        super(ClinicalNote);
    }
}

class ClinicalNoteController extends BaseAssociatedController {
    constructor() {
        super(new ClinicalNoteService());
    }
}

export default new ClinicalNoteController();