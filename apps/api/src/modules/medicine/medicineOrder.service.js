import medOrderRepo from './medicineOrder.repository.js'
import idsService from '../ids/ids.service.js'

class MedicineOrderService {
  async createOrder(data) {
    const orderId = await idsService.generateMedOrderId()
    return medOrderRepo.create({ ...data, orderId })
  }
}

export default new MedicineOrderService()
