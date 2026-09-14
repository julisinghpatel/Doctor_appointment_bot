import api, { isMockMode } from './api'
import { bookingService } from './bookingService'
import { patientService } from './patientService'
import { mockPatients, mockDoctors } from '../data/mockData'

const digitsOnly = (v) => String(v || '').replace(/\D/g, '')

/** Channel labels for the SOURCE box — matches bookingSource enum. */
export const SOURCE_LABELS = {
  whatsapp: 'WhatsApp Bot',
  admin: 'Admin Panel',
  offline: 'Front Desk',
  website: 'Website',
}

export function sourceLabel(booking = {}) {
  const src = booking.booking_source || booking.bookingSource
  if (src && SOURCE_LABELS[src]) return SOURCE_LABELS[src]
  return null
}

function mergeSlipFields(row, patient, doctorSpec) {
  // Channel defaults to whatsapp unless the row says otherwise; a staff
  // code without a channel means the offline front desk.
  const source = row.booking_source || row.bookingSource || (row.created_by ? 'offline' : 'whatsapp')
  const pObj = (row.patientId && typeof row.patientId === 'object') ? row.patientId : {}
  return {
    ...row,
    booking_source: source,
    patient_name: row.patient_name || pObj.name || row.name || patient?.name || '',
    mobile: row.mobile || row.patient_phone || pObj.phone || patient?.phone || '',
    age: row.age ?? pObj.age ?? patient?.age ?? null,
    gender: row.gender || pObj.gender || patient?.gender || '',
    address: row.address || pObj.address || patient?.address || '',
    district: row.district || pObj.district || patient?.district || '',
    pinCode: row.pinCode || pObj.pinCode || patient?.pinCode || patient?.pin_code || '',
    uhid: row.uhid || pObj.uhid || patient?.uhid || 'KGN-PENDING',
    isOld: Boolean(row.isOld || row.is_old || pObj.isOld || patient?.isOld || patient?.is_old),
    doctor_name: row.doctor_name || row.doctorId?.name || '',
    doctor_specialization: row.doctor_specialization || doctorSpec || '',
    source_label: SOURCE_LABELS[source] || '—',
  }
}

/**
 * Print data service — builds the complete object PatientPrintSlip needs.
 * List rows only carry names; age/gender/address/UHID/doctor-specialization
 * come from the booking detail + patient record (real mode) or the mock
 * patients/doctors tables (mock mode).
 */
export const printService = {
  async getSlipData(booking) {
    if (!booking) throw new Error('No booking provided')

    if (isMockMode()) {
      const key = digitsOnly(booking.mobile).slice(-10)
      const patient = mockPatients.find((p) => digitsOnly(p.mobile).slice(-10) === key) || null
      const doctor = mockDoctors.find((d) => d.id === Number(booking.doctor_id)) || null
      return mergeSlipFields(booking, patient, doctor?.specialization)
    }

    // Real mode: booking detail (populated doctor + patient age/gender/address) …
    const detail = await bookingService.getBooking(booking.id)
    // … plus the patient record (address/district/UHID/isOld).
    const targetPatientId = detail.patient_id || detail.patientId?.id || (typeof detail.patientId === 'number' ? detail.patientId : null)
    let patient = null
    if (targetPatientId) {
      try {
        patient = await patientService.getPatient(targetPatientId)
      } catch {
        patient = null
      }
    }
    const merged = mergeSlipFields(detail, patient, detail.doctor_specialization)
    // patient detail nests bookings; keep the slip flat
    delete merged.bookings
    return merged
  },
}
