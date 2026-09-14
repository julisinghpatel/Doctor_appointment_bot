import sql from '../../config/database.js'

function formatDate(date) {
  if (!date) return null
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function mapTimeSlot(row) {
  if (!row) return null
  return {
    id: row.id,
    _id: row.id,
    doctorId: row.doctor_id,
    date: row.slot_date,
    startTime: row.start_time,
    endTime: row.end_time,
    isAvailable: row.is_available,
    createdAt: row.created_at,
  }
}

class TimeSlotRepository {
  async findByDoctorAndDate(doctorId, date) {
    const slotDate = formatDate(date)
    const rows = await sql`
      SELECT * FROM time_slots
      WHERE doctor_id = ${doctorId} AND slot_date = ${slotDate}
      ORDER BY start_time ASC
    `
    return rows.map(mapTimeSlot)
  }

  async findAvailable(doctorId, date) {
    const slotDate = formatDate(date)
    const rows = await sql`
      SELECT * FROM time_slots
      WHERE doctor_id = ${doctorId} AND slot_date = ${slotDate} AND is_available = true
      ORDER BY start_time ASC
    `
    return rows.map(mapTimeSlot)
  }

  async findById(id) {
    if (!id) return null
    const [row] = await sql`
      SELECT * FROM time_slots
      WHERE id = ${id}
    `
    return mapTimeSlot(row)
  }

  async create(data) {
    const slotDate = formatDate(data.date)
    const [row] = await sql`
      INSERT INTO time_slots (doctor_id, slot_date, start_time, end_time, is_available)
      VALUES (
        ${data.doctorId},
        ${slotDate},
        ${data.startTime},
        ${data.endTime},
        ${data.isAvailable !== undefined ? data.isAvailable : true}
      )
      RETURNING *
    `
    return mapTimeSlot(row)
  }

  async createMany(slots) {
    if (!slots || slots.length === 0) return []
    const insertData = slots.map(s => ({
      doctor_id: s.doctorId,
      slot_date: formatDate(s.date),
      start_time: s.startTime,
      end_time: s.endTime,
      is_available: s.isAvailable !== undefined ? s.isAvailable : true,
    }))

    const rows = await sql`
      INSERT INTO time_slots ${sql(insertData, 'doctor_id', 'slot_date', 'start_time', 'end_time', 'is_available')}
      RETURNING *
    `
    return rows.map(mapTimeSlot)
  }

  async delete(id) {
    const [row] = await sql`
      DELETE FROM time_slots
      WHERE id = ${id}
      RETURNING *
    `
    return mapTimeSlot(row)
  }

  async setAvailability(id, isAvailable) {
    const [row] = await sql`
      UPDATE time_slots
      SET is_available = ${isAvailable}
      WHERE id = ${id}
      RETURNING *
    `
    return mapTimeSlot(row)
  }

  async findByDoctor(doctorId) {
    const rows = await sql`
      SELECT * FROM time_slots
      WHERE doctor_id = ${doctorId}
      ORDER BY slot_date ASC, start_time ASC
    `
    return rows.map(mapTimeSlot)
  }

  async existsForDate(doctorId, date) {
    const slotDate = formatDate(date)
    const [row] = await sql`
      SELECT EXISTS(
        SELECT 1 FROM time_slots
        WHERE doctor_id = ${doctorId} AND slot_date = ${slotDate}
      ) AS exists
    `
    return Boolean(row?.exists)
  }
}

export default new TimeSlotRepository()
