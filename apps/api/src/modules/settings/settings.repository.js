import sql from '../../config/database.js'

function mapSettings(row) {
  if (!row) return null
  return {
    id: row.id,
    _id: row.id,
    clinic_name: row.clinic_name || 'DocBot Clinic',
    clinic_phone: row.clinic_phone || '',
    clinic_address: row.clinic_address || '',
    whatsapp_number: row.whatsapp_number || '',
    whatsapp_api_status: row.whatsapp_api_status || 'connected',
    notification_booking_confirm: Boolean(row.notification_booking_confirm),
    notification_booking_reminder: Boolean(row.notification_booking_reminder),
    notification_booking_cancel: Boolean(row.notification_booking_cancel),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

class SettingsRepository {
  async getSettings() {
    const [row] = await sql`SELECT * FROM settings WHERE id = 1`
    if (!row) {
      const [inserted] = await sql`
        INSERT INTO settings (id, clinic_name)
        VALUES (1, 'DocBot Clinic')
        ON CONFLICT (id) DO NOTHING
        RETURNING *
      `
      return mapSettings(inserted) || this.getSettings()
    }
    return mapSettings(row)
  }

  async updateSettings(data) {
    const current = await this.getSettings()
    const clinicName = data.clinic_name !== undefined ? data.clinic_name : current.clinic_name
    const clinicPhone = data.clinic_phone !== undefined ? data.clinic_phone : current.clinic_phone
    const clinicAddress = data.clinic_address !== undefined ? data.clinic_address : current.clinic_address
    const whatsappNumber = data.whatsapp_number !== undefined ? data.whatsapp_number : current.whatsapp_number
    const whatsappApiStatus = data.whatsapp_api_status !== undefined ? data.whatsapp_api_status : current.whatsapp_api_status
    const notifConfirm = data.notification_booking_confirm !== undefined ? Boolean(data.notification_booking_confirm) : current.notification_booking_confirm
    const notifReminder = data.notification_booking_reminder !== undefined ? Boolean(data.notification_booking_reminder) : current.notification_booking_reminder
    const notifCancel = data.notification_booking_cancel !== undefined ? Boolean(data.notification_booking_cancel) : current.notification_booking_cancel

    const [updated] = await sql`
      UPDATE settings
      SET
        clinic_name = ${clinicName},
        clinic_phone = ${clinicPhone},
        clinic_address = ${clinicAddress},
        whatsapp_number = ${whatsappNumber},
        whatsapp_api_status = ${whatsappApiStatus},
        notification_booking_confirm = ${notifConfirm},
        notification_booking_reminder = ${notifReminder},
        notification_booking_cancel = ${notifCancel},
        updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `
    return mapSettings(updated)
  }
}

export default new SettingsRepository()
