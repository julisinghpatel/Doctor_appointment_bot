import sql from '../../config/database.js'

export const ROLES = ['superadmin', 'admin', 'doctor', 'receptionist', 'pharmacy']

export const STAFF_CODE_PREFIX = {
  superadmin: 'KGN_SA_',
  admin: 'KGN_ADM_',
  doctor: 'KGN_DOC_',
  receptionist: 'KGN_RC_',
  pharmacy: 'KGN_PHR_',
}

function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    doctorId: row.doctor_id,
    staffCode: row.staff_code,
    phone: row.phone || '',
    salary: Number(row.salary || 0),
    joiningDate: row.joining_date,
    address: row.address || '',
    activeDays: Array.isArray(row.active_days) ? row.active_days : [],
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

class UserRepository {
  async findByEmail(email) {
    if (!email) return null
    const [row] = await sql`
      SELECT * FROM users
      WHERE email = ${String(email).toLowerCase()}
    `
    return mapUser(row)
  }

  async findById(id) {
    if (!id) return null
    const [row] = await sql`
      SELECT * FROM users
      WHERE id = ${id}
    `
    return mapUser(row)
  }

  async find(filter = {}) {
    let rows
    const { role, search } = filter

    if (role && search) {
      const q = `%${search}%`
      rows = await sql`
        SELECT * FROM users
        WHERE role = ${role}
          AND (name ILIKE ${q} OR email ILIKE ${q} OR staff_code ILIKE ${q})
        ORDER BY created_at DESC
        LIMIT 200
      `
    } else if (role) {
      rows = await sql`
        SELECT * FROM users
        WHERE role = ${role}
        ORDER BY created_at DESC
        LIMIT 200
      `
    } else if (search) {
      const q = `%${search}%`
      rows = await sql`
        SELECT * FROM users
        WHERE (name ILIKE ${q} OR email ILIKE ${q} OR staff_code ILIKE ${q})
        ORDER BY created_at DESC
        LIMIT 200
      `
    } else {
      rows = await sql`
        SELECT * FROM users
        ORDER BY created_at DESC
        LIMIT 200
      `
    }

    return rows.map(mapUser)
  }

  async create(data) {
    const activeDays = Array.isArray(data.activeDays) && data.activeDays.length > 0
      ? data.activeDays
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const [row] = await sql`
      INSERT INTO users (
        name, email, password_hash, role, doctor_id, staff_code,
        phone, salary, joining_date, address, active_days, is_active
      ) VALUES (
        ${data.name},
        ${String(data.email).toLowerCase()},
        ${data.passwordHash},
        ${data.role},
        ${data.doctorId || null},
        ${data.staffCode || null},
        ${data.phone || ''},
        ${data.salary || 0},
        ${data.joiningDate || null},
        ${data.address || ''},
        ${sql.array(activeDays)},
        ${data.isActive !== undefined ? data.isActive : true}
      )
      RETURNING *
    `
    return mapUser(row)
  }

  async update(id, updateData) {
    const currentUser = await this.findById(id)
    if (!currentUser) return null

    const name = updateData.name !== undefined ? updateData.name : currentUser.name
    const role = updateData.role !== undefined ? updateData.role : currentUser.role
    const doctorId = updateData.doctorId !== undefined ? (updateData.doctorId || null) : currentUser.doctorId
    const phone = updateData.phone !== undefined ? updateData.phone : currentUser.phone
    const salary = updateData.salary !== undefined ? Number(updateData.salary) : currentUser.salary
    const joiningDate = updateData.joiningDate !== undefined ? updateData.joiningDate : currentUser.joiningDate
    const address = updateData.address !== undefined ? updateData.address : currentUser.address
    const activeDays = updateData.activeDays !== undefined ? updateData.activeDays : currentUser.activeDays
    const isActive = updateData.isActive !== undefined ? !!updateData.isActive : currentUser.isActive
    const passwordHash = updateData.passwordHash !== undefined ? updateData.passwordHash : currentUser.passwordHash

    const [row] = await sql`
      UPDATE users
      SET
        name = ${name},
        role = ${role},
        doctor_id = ${doctorId},
        phone = ${phone},
        salary = ${salary},
        joining_date = ${joiningDate},
        address = ${address},
        active_days = ${sql.array(activeDays)},
        is_active = ${isActive},
        password_hash = ${passwordHash}
      WHERE id = ${id}
      RETURNING *
    `
    return mapUser(row)
  }

  async toggleActive(id) {
    const [row] = await sql`
      UPDATE users
      SET is_active = NOT is_active
      WHERE id = ${id}
      RETURNING *
    `
    return mapUser(row)
  }
}

export default new UserRepository()
