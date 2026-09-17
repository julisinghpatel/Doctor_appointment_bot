import invoiceRepo from './invoice.repository.js';

class InvoiceService {
  /**
   * Look up patient details and latest booking info by UHID or Phone or Booking ID.
   */
  async lookupPatientForInvoice({ uhid, bookingNo, value, type } = {}) {
    const searchTerm = (uhid || bookingNo || value || '').trim();
    if (!searchTerm) return null;

    let patientRow = null;
    let bookingRow = null;

    // 1. Try to find patient directly via invoice repository
    patientRow = await invoiceRepo.findPatientByUhidOrPhone(searchTerm);

    // 2. Try to find booking details via invoice repository
    bookingRow = await invoiceRepo.findBookingForInvoice(searchTerm);

    if (!patientRow && bookingRow) {
      if (bookingRow.patient_id) {
        patientRow = await invoiceRepo.findPatientByUhidOrPhone(String(bookingRow.patient_id));
      }
    }

    if (!patientRow && !bookingRow) {
      return null;
    }

    // 3. If patient found but booking wasn't fetched, get their latest booking
    if (patientRow && !bookingRow) {
      bookingRow = await invoiceRepo.findLatestBookingByPatientId(patientRow.id);
    }

    const doctorName = bookingRow?.doctor_name || '';
    const consultants = doctorName ? [doctorName] : [];

    return {
      id: patientRow?.id || bookingRow?.patient_id,
      patientName: patientRow?.name || bookingRow?.p_name || '',
      name: patientRow?.name || bookingRow?.p_name || '',
      uhid: patientRow?.uhid || bookingRow?.p_uhid || searchTerm,
      mobile: patientRow?.phone || bookingRow?.p_phone || '',
      phone: patientRow?.phone || bookingRow?.p_phone || '',
      age: patientRow?.age || bookingRow?.p_age || '',
      sex: patientRow?.gender || bookingRow?.p_gender || '',
      gender: patientRow?.gender || bookingRow?.p_gender || '',
      address: patientRow?.address || patientRow?.district || bookingRow?.p_address || '',
      district: patientRow?.district || bookingRow?.p_district || '',
      bookingNo: bookingRow?.booking_id || bookingRow?.token_number || '',
      tokenNumber: bookingRow?.token_number || '',
      hospitalNo: bookingRow?.visit_type === 'HOSPITALIZATION' ? (bookingRow?.booking_id || '') : '',
      consultantName: doctorName,
      doctorName: doctorName,
      consultants: consultants,
      admissionDate: bookingRow?.preferred_date
        ? new Date(bookingRow.preferred_date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      dischargeDate: '',
      billDate: new Date().toISOString().slice(0, 10),
    };
  }
}

export default new InvoiceService();
