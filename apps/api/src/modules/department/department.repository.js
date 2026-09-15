import sql from '../../config/database.js'
import { toObjectIdString } from '../../utils/registration.js'

function mapDepartment(row) {
  if (!row) return null
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

class DepartmentRepository {
  async findAll(filter = {}) {
    let rows
    if (filter.isActive !== undefined) {
      rows = await sql`
        SELECT * FROM departments
        WHERE is_active = ${filter.isActive}
        ORDER BY name ASC
      `
    } else {
      rows = await sql`
        SELECT * FROM departments
        ORDER BY name ASC
      `
    }
    const mapped = rows.map(mapDepartment)
    return mapped.sort((a, b) => {
      const isGynA = /gyn|obstetric|स्त्री/i.test(a.name || '')
      const isGynB = /gyn|obstetric|स्त्री/i.test(b.name || '')
      if (isGynA && !isGynB) return -1
      if (!isGynA && isGynB) return 1
      return (a.name || '').localeCompare(b.name || '')
    })
  }

  async findActive() {
    const rows = await sql`
      SELECT * FROM departments
      WHERE is_active = true
      ORDER BY name ASC
    `
    const mapped = rows.map(mapDepartment)
    return mapped.sort((a, b) => {
      const isGynA = /gyn|obstetric|स्त्री/i.test(a.name || '')
      const isGynB = /gyn|obstetric|स्त्री/i.test(b.name || '')
      if (isGynA && !isGynB) return -1
      if (!isGynA && isGynB) return 1
      return (a.name || '').localeCompare(b.name || '')
    })
  }

  async findById(id) {
    const coercedId = toObjectIdString(id)
    if (!coercedId) return null
    const [row] = await sql`
      SELECT * FROM departments
      WHERE id = ${coercedId}
    `
    return mapDepartment(row)
  }

  async create(data) {
    const [row] = await sql`
      INSERT INTO departments (name, description, is_active)
      VALUES (${data.name}, ${data.description || ''}, ${data.isActive !== undefined ? data.isActive : true})
      RETURNING *
    `
    return mapDepartment(row)
  }

  async update(id, data) {
    const [row] = await sql`
      UPDATE departments
      SET
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        is_active = COALESCE(${data.isActive}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return mapDepartment(row)
  }

  async delete(id) {
    const [row] = await sql`
      DELETE FROM departments
      WHERE id = ${id}
      RETURNING *
    `
    return mapDepartment(row)
  }
}

export default new DepartmentRepository()
