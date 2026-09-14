import sql from '../../config/database.js'
import patientRepo from '../patient/patient.repository.js'

function mapBooking(row) {
  if (!row) return null
  const meta = row.meta || {}
  return {
    id: row.id,
    _id: row.id,
    bookingId: row.booking_id,
    preferredDate: row.appointment_date,
    appointmentDate: row.appointment_date,
    status: row.status,
    tokenNumber: row.token_number,
    tokenIssued: Boolean(meta.tokenIssued),
    notes: row.problem_description || '',
    problemDescription: row.problem_description || '',
    visitType: row.type || 'OPD',
    type: row.type || 'OPD',
    vitalBp: meta.vitalBp || '',
    vitalPulse: meta.vitalPulse || '',
    vitalTemp: meta.vitalTemp || '',
    vitalWeight: meta.vitalWeight || '',
    vitalSpo2: meta.vitalSpo2 || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    doctorId: row.doctor_id ? {
      id: row.doctor_id,
      _id: row.doctor_id,
      name: row.doctor_name || '',
      department: row.department_name || '',
      role: 'doctor',
      consultationFee: Number(row.doctor_fee || 0),
    } : null,
    patientId: row.patient_id ? {
      id: row.patient_id,
      _id: row.patient_id,
      name: row.patient_name || '',
      phone: row.patient_phone || '',
      uhid: row.patient_uhid !== null && row.patient_uhid !== undefined ? String(row.patient_uhid) : null,
      age: row.patient_age || null,
      gender: row.patient_gender || null,
      isOld: Boolean(row.patient_is_old),
    } : null,
    serviceId: row.service_id ? {
      id: row.service_id,
      _id: row.service_id,
      name: row.service_name || '',
      price: Number(row.service_price || 0),
      duration: row.service_duration || 30,
    } : null,
    slotId: row.slot_id ? {
      id: row.slot_id,
      _id: row.slot_id,
      date: row.slot_date,
      startTime: row.slot_start_time,
      endTime: row.slot_end_time,
    } : null,
  }
}

const SELECT_BOOKING_WITH_JOINS = sql`
  SELECT
    b.*,
    d.name AS doctor_name,
    d.consultation_fee AS doctor_fee,
    dep.name AS department_name,
    p.name AS patient_name,
    p.phone AS patient_phone,
    p.uhid AS patient_uhid,
    p.age AS patient_age,
    p.gender AS patient_gender,
    p.is_old AS patient_is_old,
    s.name AS service_name,
    s.price AS service_price,
    s.duration_minutes AS service_duration,
    ts.slot_date,
    ts.start_time AS slot_start_time,
    ts.end_time AS slot_end_time
  FROM bookings b
  LEFT JOIN doctors d ON b.doctor_id = d.id
  LEFT JOIN departments dep ON d.department_id = dep.id
  LEFT JOIN patients p ON b.patient_id = p.id
  LEFT JOIN services s ON b.service_id = s.id
  LEFT JOIN time_slots ts ON b.slot_id = ts.id
`

class BookingRepository {
  async findAll(filter = {}, { page = 1, limit = 10, sortBy = 'preferredDate', sortOrder = 'desc' } = {}) {
    page = parseInt(page, 10) || 1
    limit = parseInt(limit, 10) || 10
    limit = Math.min(Math.max(limit, 1), 200)
    const offset = (page - 1) * limit

    const conditions = []
    if (filter.doctorId) conditions.push(sql`b.doctor_id = ${filter.doctorId}`)
    if (filter.patientId) conditions.push(sql`b.patient_id = ${filter.patientId}`)
    if (filter.status) conditions.push(sql`b.status = ${filter.status}`)
    if (filter.visitType || filter.type) conditions.push(sql`b.type = ${filter.visitType || filter.type}`)
    if (filter.preferredDate || filter.appointmentDate) {
      conditions.push(sql`b.appointment_date = ${filter.preferredDate || filter.appointmentDate}`)
    }

    const whereClause = conditions.length > 0
      ? sql`WHERE ${conditions.reduce((acc, curr) => sql`${acc} AND ${curr}`)}`
      : sql``

    const sortCol = (sortBy === 'createdAt' || sortBy === 'created_at') ? sql`b.created_at` : sql`b.appointment_date`
    const orderDir = (sortOrder === 'asc' || sortOrder === '1' || sortOrder === 1) ? sql`ASC` : sql`DESC`

    const rows = await sql`
      ${SELECT_BOOKING_WITH_JOINS}
      ${whereClause}
      ORDER BY ${sortCol} ${orderDir}, b.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const [totalRow] = await sql`SELECT count(*) FROM bookings b ${whereClause}`
    const [confirmedRow] = await sql`SELECT count(*) FROM bookings b ${whereClause ? sql`${whereClause} AND b.status = 'confirmed'` : sql`WHERE b.status = 'confirmed'`}`
    const [pendingRow] = await sql`SELECT count(*) FROM bookings b ${whereClause ? sql`${whereClause} AND b.status = 'pending'` : sql`WHERE b.status = 'pending'`}`
    const [cancelledRow] = await sql`SELECT count(*) FROM bookings b ${whereClause ? sql`${whereClause} AND b.status = 'cancelled'` : sql`WHERE b.status = 'cancelled'`}`
    const [completedRow] = await sql`SELECT count(*) FROM bookings b ${whereClause ? sql`${whereClause} AND b.status = 'completed'` : sql`WHERE b.status = 'completed'`}`
    const [oldRow] = await sql`SELECT count(*) FROM bookings b JOIN patients p ON b.patient_id = p.id ${whereClause ? sql`${whereClause} AND p.is_old = true` : sql`WHERE p.is_old = true`}`
    const [newRow] = await sql`SELECT count(*) FROM bookings b JOIN patients p ON b.patient_id = p.id ${whereClause ? sql`${whereClause} AND p.is_old = false` : sql`WHERE p.is_old = false`}`

    const total = Number(totalRow.count)

    return {
      data: rows.map(mapBooking),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalBookings: total,
        confirmedCount: Number(confirmedRow.count),
        pendingCount: Number(pendingRow.count),
        cancelledCount: Number(cancelledRow.count),
        completedCount: Number(completedRow.count),
        oldPatientCount: Number(oldRow.count),
        newPatientCount: Number(newRow.count),
      },
    }
  }

  async findById(id) {
    if (!id) return null
    const [row] = await sql`
      ${SELECT_BOOKING_WITH_JOINS}
      WHERE b.id = ${id}
    `
    return mapBooking(row)
  }

  async findDistinctPatientIdsByDoctor(doctorId) {
    const rows = await sql`
      SELECT DISTINCT patient_id
      FROM bookings
      WHERE doctor_id = ${doctorId} AND status != 'cancelled'
    `
    return rows.map(r => r.patient_id)
  }

  async findByPatientPhone(phone) {
    const patient = await patientRepo.findByPhone(phone)
    if (!patient) return []

    const rows = await sql`
      ${SELECT_BOOKING_WITH_JOINS}
      WHERE b.patient_id = ${patient.id} AND b.status != 'cancelled'
      ORDER BY b.created_at DESC
    `
    return rows.map(mapBooking)
  }

  async create(data) {
    const meta = {
      vitalBp: data.vitalBp || '',
      vitalPulse: data.vitalPulse || '',
      vitalTemp: data.vitalTemp || '',
      vitalWeight: data.vitalWeight || '',
      vitalSpo2: data.vitalSpo2 || '',
      tokenIssued: Boolean(data.tokenIssued),
    }

    const [row] = await sql`
      INSERT INTO bookings (
        booking_id, doctor_id, patient_id, department_id, service_id, slot_id,
        appointment_date, type, status, token_number, problem_description,
        contact_phone, meta
      ) VALUES (
        ${data.bookingId},
        ${data.doctorId || null},
        ${data.patientId || null},
        ${data.departmentId || null},
        ${data.serviceId || null},
        ${data.slotId || null},
        ${data.preferredDate || data.appointmentDate || null},
        ${data.visitType || data.type || 'OPD'},
        ${data.status || 'pending'},
        ${data.tokenNumber || null},
        ${data.notes || data.problemDescription || ''},
        ${data.phone || data.contactPhone || ''},
        ${sql.json(meta)}
      )
      RETURNING id
    `
    return this.findById(row.id)
  }

  async updateStatus(id, status) {
    const [row] = await sql`
      UPDATE bookings
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `
    if (!row) return null
    return this.findById(row.id)
  }

  async updateVitals(id, vitals) {
    const [existing] = await sql`SELECT meta FROM bookings WHERE id = ${id}`
    const currentMeta = existing?.meta || {}
    const newMeta = {
      ...currentMeta,
      vitalBp: vitals.vitalBp !== undefined ? vitals.vitalBp : currentMeta.vitalBp,
      vitalPulse: vitals.vitalPulse !== undefined ? vitals.vitalPulse : currentMeta.vitalPulse,
      vitalTemp: vitals.vitalTemp !== undefined ? vitals.vitalTemp : currentMeta.vitalTemp,
      vitalWeight: vitals.vitalWeight !== undefined ? vitals.vitalWeight : currentMeta.vitalWeight,
      vitalSpo2: vitals.vitalSpo2 !== undefined ? vitals.vitalSpo2 : currentMeta.vitalSpo2,
    }

    const [row] = await sql`
      UPDATE bookings
      SET
        meta = ${sql.json(newMeta)},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `
    if (!row) return null
    return this.findById(row.id)
  }

  async delete(id) {
    const booking = await this.findById(id)
    if (!booking) return null
    await sql`DELETE FROM bookings WHERE id = ${id}`
    return booking
  }

  async countByDatePrefix(prefix) {
    const pattern = `${prefix}%`
    const [row] = await sql`
      SELECT count(*) FROM bookings
      WHERE booking_id LIKE ${pattern}
    `
    return Number(row.count)
  }

  async getStats() {
    const [row] = await sql`
      SELECT
        count(*) AS total,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE) AS today_count,
        count(*) FILTER (WHERE status = 'confirmed') AS confirmed,
        count(*) FILTER (WHERE status = 'cancelled') AS cancelled
      FROM bookings
    `
    return {
      total: Number(row.total),
      todayCount: Number(row.today_count),
      confirmed: Number(row.confirmed),
      cancelled: Number(row.cancelled),
    }
  }

  async getRecent(limit = 5) {
    const rows = await sql`
      ${SELECT_BOOKING_WITH_JOINS}
      ORDER BY b.created_at DESC
      LIMIT ${limit}
    `
    return rows.map(mapBooking)
  }

  async getChartData(daysBack = 7) {
    const rows = await sql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') AS _id,
        count(*)::int AS bookings,
        count(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
        count(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
      FROM bookings
      WHERE created_at >= CURRENT_DATE - (INTERVAL '1 day' * ${daysBack})
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY _id ASC
    `
    return rows
  }

  async getDoctorReportStats() {
    const rows = await sql`
      SELECT
        d.name AS doctor,
        count(b.id)::int AS bookings,
        COALESCE(SUM(d.consultation_fee), 0)::numeric AS revenue,
        count(b.id) FILTER (WHERE b.status IN ('confirmed', 'completed'))::int AS completed,
        CASE
          WHEN count(b.id) > 0 THEN
            ROUND((count(b.id) FILTER (WHERE b.status IN ('confirmed', 'completed'))::numeric / count(b.id)::numeric) * 100)
          ELSE 0
        END AS completion_rate
      FROM bookings b
      JOIN doctors d ON b.doctor_id = d.id
      GROUP BY d.id, d.name
      ORDER BY bookings DESC
    `
    return rows.map(r => ({
      doctor: r.doctor,
      bookings: Number(r.bookings),
      revenue: Number(r.revenue),
      completion_rate: Number(r.completion_rate),
    }))
  }

  async getStatusDistribution() {
    const rows = await sql`
      SELECT
        INITCAP(status::text) AS name,
        count(*)::int AS value
      FROM bookings
      GROUP BY status
      ORDER BY name ASC
    `
    return rows
  }

  async getRevenueStats() {
    const [row] = await sql`
      SELECT
        COALESCE(SUM(d.consultation_fee), 0)::numeric AS total,
        count(b.id)::int AS count,
        MIN(b.created_at) AS oldest_booking
      FROM bookings b
      JOIN doctors d ON b.doctor_id = d.id
      WHERE b.status != 'cancelled'
    `
    const total = Number(row?.total || 0)
    const oldest = row?.oldest_booking ? new Date(row.oldest_booking) : new Date()
    const daySpan = Math.max(1, Math.ceil((Date.now() - oldest.getTime()) / 86400000))

    return {
      total,
      average_per_day: Math.round(total / daySpan),
      growth: 0,
    }
  }
}

export default new BookingRepository()
