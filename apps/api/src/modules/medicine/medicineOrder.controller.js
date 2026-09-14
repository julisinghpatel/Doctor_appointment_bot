import medOrderRepo from './medicineOrder.repository.js'
import bookingRepo from '../booking/booking.repository.js'
import { uploadPrescriptionImage } from '../../utils/cloudinary.js'

class MedicineOrderController {
  async getOrders(req, res) {
    const { page = 1, limit = 10, status } = req.query
    const filter = {}
    if (status) filter.status = status

    if (req.admin?.role === 'doctor') {
      if (!req.admin.doctorId) {
        return res.status(403).json({ success: false, message: 'No doctor profile linked to this login' })
      }
      filter.patientIds = await bookingRepo.findDistinctPatientIdsByDoctor(req.admin.doctorId)
    }

    const result = await medOrderRepo.findAll(filter, { page, limit })
    res.json(result)
  }

  async updateStatus(req, res) {
    if (req.admin?.role === 'receptionist') {
      return res.status(403).json({ success: false, message: 'Forbidden: receptionists have read-only access to medicine orders' })
    }
    const { id } = req.params
    const { status, staffNotes } = req.body

    const order = await medOrderRepo.updateStatus(id, { status, staffNotes })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    res.json(order)
  }

  async uploadPrescription(req, res) {
    const { imageBase64, filename } = req.body
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'imageBase64 parameter is required' })
    }
    const secureUrl = await uploadPrescriptionImage(imageBase64, { filename })
    res.json({ success: true, url: secureUrl })
  }
}

export default new MedicineOrderController()
