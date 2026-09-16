import doctorService from './doctor.service.js'

export const doctorController = {
  async getAll(req, res, next) {
    try {
      const { departmentId, category, visitNumber, patientId } = req.query
      let doctors
      if (departmentId) {
        doctors = await doctorService.getDoctorsByDepartment(departmentId)
      } else {
        doctors = await doctorService.getActiveDoctors()
      }

      if (category) {
        let n = parseInt(visitNumber, 10)
        if (isNaN(n) && patientId) {
          const { default: bookingRepo } = await import('../booking/booking.repository.js')
          n = (await bookingRepo.getLatestInfertilityVisitCount(patientId)) + 1
        }
        if (isNaN(n)) n = 1

        const drAnandDocs = doctors.filter(d => /anand/i.test(d.name))
        const otherDocs = doctors.filter(d => !/anand/i.test(d.name))

        if (category === 'Others' || n === 1 || n % 3 === 1) {
          doctors = drAnandDocs.length > 0 ? drAnandDocs : doctors
        } else {
          doctors = otherDocs.length > 0 ? otherDocs : doctors
        }
      }

      res.json(doctors)
    } catch (err) { next(err) }
  },

  async getById(req, res, next) {
    try {
      const doctor = await doctorService.getDoctorById(req.params.id)
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' })
      res.json(doctor)
    } catch (err) { next(err) }
  },

  async create(req, res, next) {
    try {
      const doctor = await doctorService.createDoctor(req.body)
      res.status(201).json(doctor)
    } catch (err) { next(err) }
  },

  async update(req, res, next) {
    try {
      const doctor = await doctorService.updateDoctor(req.params.id, req.body)
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' })
      res.json(doctor)
    } catch (err) { next(err) }
  },

  async delete(req, res, next) {
    try {
      await doctorService.deleteDoctor(req.params.id)
      res.json({ success: true })
    } catch (err) { next(err) }
  },

  async toggleActive(req, res, next) {
    try {
      const doctor = await doctorService.toggleActive(req.params.id)
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' })
      res.json(doctor)
    } catch (err) { next(err) }
  },
}
