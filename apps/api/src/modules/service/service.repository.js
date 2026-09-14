import sql from '../../config/database.js'

function mapService(row) {
  if (!row) return null
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    duration: row.duration_minutes || 30,
    durationMinutes: row.duration_minutes || 30,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

class ServiceRepository {
  async findAll(filter = {}) {
    let rows
    if (filter.isActive !== undefined) {
      rows = await sql`
        SELECT * FROM services
        WHERE is_active = ${filter.isActive}
        ORDER BY name ASC
      `
    } else {
      rows = await sql`
        SELECT * FROM services
        ORDER BY name ASC
      `
    }
    return rows.map(mapService)
  }

  async findActive() {
    const rows = await sql`
      SELECT * FROM services
      WHERE is_active = true
      ORDER BY name ASC
    `
    return rows.map(mapService)
  }

  async findById(id) {
    if (!id) return null
    const [row] = await sql`
      SELECT * FROM services
      WHERE id = ${id}
    `
    return mapService(row)
  }

  async create(data) {
    const duration = data.duration !== undefined ? data.duration : (data.durationMinutes !== undefined ? data.durationMinutes : 30)
    const [row] = await sql`
      INSERT INTO services (name, description, price, duration_minutes, is_active)
      VALUES (
        ${data.name},
        ${data.description || ''},
        ${data.price !== undefined ? data.price : 0},
        ${duration},
        ${data.isActive !== undefined ? data.isActive : true}
      )
      RETURNING *
    `
    return mapService(row)
  }

  async update(id, data) {
    const duration = data.duration !== undefined ? data.duration : data.durationMinutes
    const [row] = await sql`
      UPDATE services
      SET
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        price = COALESCE(${data.price}, price),
        duration_minutes = COALESCE(${duration}, duration_minutes),
        is_active = COALESCE(${data.isActive}, is_active)
      WHERE id = ${id}
      RETURNING *
    `
    return mapService(row)
  }

  async delete(id) {
    const [row] = await sql`
      DELETE FROM services
      WHERE id = ${id}
      RETURNING *
    `
    return mapService(row)
  }
}

export default new ServiceRepository()
