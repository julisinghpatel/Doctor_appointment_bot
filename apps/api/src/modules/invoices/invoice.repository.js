import sql from '../../config/database.js';

class InvoiceRepository {
  /**
   * Find patient by UHID, Phone, or ID
   */
  async findPatientByUhidOrPhone(searchTerm) {
    if (!searchTerm) return null;
    const [row] = await sql`
      SELECT * FROM patients
      WHERE LOWER(uhid) = LOWER(${searchTerm})
         OR uhid ILIKE ${'%' + searchTerm + '%'}
         OR phone = ${searchTerm}
         OR id::text = ${searchTerm}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return row || null;
  }

  /**
   * Find booking with patient & doctor details by booking_id, token_number, or UHID
   */
  async findBookingForInvoice(searchTerm) {
    if (!searchTerm) return null;
    const [row] = await sql`
      SELECT b.*, p.name AS p_name, p.phone AS p_phone, p.age AS p_age, p.gender AS p_gender,
             p.uhid AS p_uhid, p.address AS p_address, p.district AS p_district,
             d.name AS doctor_name, dep.name AS department_name
      FROM bookings b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN doctors d ON b.doctor_id = d.id
      LEFT JOIN departments dep ON b.department_id = dep.id
      WHERE b.booking_id = ${searchTerm}
         OR b.token_number = ${searchTerm}
         OR LOWER(p.uhid) = LOWER(${searchTerm})
         OR p.uhid ILIKE ${'%' + searchTerm + '%'}
      ORDER BY b.created_at DESC
      LIMIT 1
    `;
    return row || null;
  }

  /**
   * Find latest booking by patient ID
   */
  async findLatestBookingByPatientId(patientId) {
    if (!patientId) return null;
    const [row] = await sql`
      SELECT b.*, d.name AS doctor_name, dep.name AS department_name
      FROM bookings b
      LEFT JOIN doctors d ON b.doctor_id = d.id
      LEFT JOIN departments dep ON b.department_id = dep.id
      WHERE b.patient_id = ${patientId}
      ORDER BY b.created_at DESC
      LIMIT 1
    `;
    return row || null;
  }
}

export default new InvoiceRepository();
