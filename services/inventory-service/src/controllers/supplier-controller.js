import { Supplier } from '../models/index.js'
import { BaseService, BaseController } from './base/base-controller.js'

class SupplierService extends BaseService {
    constructor() {
        super(Supplier)
    }
}

export const supplierService = new SupplierService()

class SupplierController extends BaseController {
    constructor() {
        super(supplierService)
    }
}

export const supplierController = new SupplierController()
