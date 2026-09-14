import sql from '../../config/database.js'

function mapPatient(row) {
  if (!row) return null
  return {
    id: row.id,
    _id: row.id,
    uhid: row.uhid !== null && row.uhid !== undefined ? String(row.uhid) : null,
    phone: row.phone || '',
    name: row.name || '',
    age: row.age || null,
    gender: row.gender || null,
    identityKey: row.identity_key || null,
    isOld: Boolean(row.is_old),
    lastVisited: row.last_visited || null,
    createdAt: row.created_at,
  }
}

function buildIdentityKey(phone, name) {
  const p = String(phone || '').trim()
  const n = String(name || 'unknown').trim().toLowerCase()
  return `${p}:${n}`
}

class PatientRepository {
  async findByPhone(phone) {
    if (!phone) return null
    const [row] = await sql`
      SELECT * FROM patients
      WHERE phone = ${phone}
      LIMIT 1
    `
    return mapPatient(row)
  }

  async findAllByPhone(phone) {
    if (!phone) return []
    const rows = await sql`
      SELECT * FROM patients
      WHERE phone = ${phone} AND LOWER(name) != 'unknown'
      ORDER BY created_at ASC
    `
    return rows.map(mapPatient)
  }

  async findOrCreate(phone, data = {}) {
    const name = data.name ? String(data.name).trim() : ''

    if (name && name.toLowerCase() !== 'unknown') {
      // 1. Try to find existing patient with same phone and name (case-insensitive)
      const [existing] = await sql`
        SELECT * FROM patients
        WHERE phone = ${phone} AND LOWER(name) = ${name.toLowerCase()}
        LIMIT 1
      `
      if (existing) {
        let needsUpdate = false
        let isOld = existing.is_old
        let lastVisited = existing.last_visited

        if (data.isOld !== undefined && existing.is_old !== Boolean(data.isOld)) {
          isOld = Boolean(data.isOld)
          needsUpdate = true
        }
        if (data.lastVisited) {
          lastVisited = data.lastVisited
          needsUpdate = true
        }

        if (needsUpdate) {
          const [updated] = await sql`
            UPDATE patients
            SET is_old = ${isOld}, last_visited = ${lastVisited}
            WHERE id = ${existing.id}
            RETURNING *
          `
          return mapPatient(updated)
        }
        return mapPatient(existing)
      }

      // 2. Check if an 'Unknown' placeholder exists for this phone to upgrade it
      const [unknownPatient] = await sql`
        SELECT * FROM patients
        WHERE phone = ${phone} AND LOWER(name) = 'unknown'
        LIMIT 1
      `
      if (unknownPatient) {
        const [upgraded] = await sql`
          UPDATE patients
          SET
            name = ${name},
            age = COALESCE(${data.age}, age),
            gender = COALESCE(${data.gender}, gender),
            is_old = COALESCE(${data.isOld}, is_old),
            last_visited = COALESCE(${data.lastVisited}, last_visited)
          WHERE id = ${unknownPatient.id}
          RETURNING *
        `
        return mapPatient(upgraded)
      }

      // 3. Create a distinct patient record
      const [newPatient] = await sql`
        INSERT INTO patients (
          phone, name, age, gender, is_old, last_visited
        ) VALUES (
          ${phone},
          ${name},
          ${data.age || null},
          ${data.gender || null},
          ${data.isOld !== undefined ? Boolean(data.isOld) : false},
          ${data.lastVisited || null}
        )
        ON CONFLICT (identity_key) DO UPDATE SET
          is_old = EXCLUDED.is_old,
          last_visited = COALESCE(EXCLUDED.last_visited, patients.last_visited)
        RETURNING *
      `
      return mapPatient(newPatient)
    }

    // 4. Default fallback when name is 'Unknown' or not provided
    const [patient] = await sql`
      SELECT * FROM patients
      WHERE phone = ${phone}
      LIMIT 1
    `
    if (patient) return mapPatient(patient)

    const [created] = await sql`
      INSERT INTO patients (
        phone, name, age, gender, is_old, last_visited
      ) VALUES (
        ${phone},
        'Unknown',
        ${data.age || null},
        ${data.gender || null},
        ${data.isOld !== undefined ? Boolean(data.isOld) : false},
        ${data.lastVisited || null}
      )
      ON CONFLICT (identity_key) DO UPDATE SET phone = EXCLUDED.phone
      RETURNING *
    `
    return mapPatient(created)
  }

  async findById(id) {
    if (!id) return null
    const [row] = await sql`
      SELECT * FROM patients
      WHERE id = ${id}
    `
    return mapPatient(row)
  }

  async search(query, filters = {}) {
    const { isOld, sortBy = 'createdAt', sortOrder = 'desc' } = filters
    const q = query ? `%${query}%` : null
    const isOldBool = isOld !== undefined && isOld !== null && isOld !== '' ? (isOld === 'true' || isOld === true) : null

    // Perform parameterized query based on conditions
    let rows
    if (q && isOldBool !== null) {
      rows = await sql`
        SELECT * FROM patients
        WHERE (name ILIKE ${q} OR phone ILIKE ${q})
          AND is_old = ${isOldBool}
        ORDER BY created_at DESC
        LIMIT 100
      `
    } else if (q) {
      rows = await sql`
        SELECT * FROM patients
        WHERE (name ILIKE ${q} OR phone ILIKE ${q})
        ORDER BY created_at DESC
        LIMIT 100
      `
    } else if (isOldBool !== null) {
      rows = await sql`
        SELECT * FROM patients
        WHERE is_old = ${isOldBool}
        ORDER BY created_at DESC
        LIMIT 100
      `
    } else {
      rows = await sql`
        SELECT * FROM patients
        ORDER BY created_at DESC
        LIMIT 100
      `
    }

    return rows.map(mapPatient)
  }

  async update(id, data) {
    const current = await this.findById(id)
    if (!current) return null

    const name = data.name !== undefined ? data.name : current.name
    const phone = data.phone !== undefined ? data.phone : current.phone
    const age = data.age !== undefined ? data.age : current.age
    const gender = data.gender !== undefined ? data.gender : current.gender
    const isOld = data.isOld !== undefined ? Boolean(data.isOld) : current.isOld
    const lastVisited = data.lastVisited !== undefined ? data.lastVisited : current.lastVisited
    const uhid = data.uhid !== undefined ? data.uhid : current.uhid

    const [row] = await sql`
      UPDATE patients
      SET
        name = ${name},
        phone = ${phone},
        age = ${age},
        gender = ${gender},
        is_old = ${isOld},
        last_visited = ${lastVisited},
        uhid = ${uhid}
      WHERE id = ${id}
      RETURNING *
    `
    return mapPatient(row)
  }

  async countAll() {
    const [row] = await sql`SELECT count(*) FROM patients`
    return Number(row.count)
  }
}

export default new PatientRepository()
