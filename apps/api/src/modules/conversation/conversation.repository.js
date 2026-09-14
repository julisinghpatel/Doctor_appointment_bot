import redis from '../../config/redis.js'

const KEY_PREFIX = 'conv:'
const TTL_SECONDS = 86400 * 7 // 7 days retention

class ConversationRepository {
  async findByPhone(phone) {
    if (!phone) return null
    const data = await redis.get(`${KEY_PREFIX}${phone}`)
    return data ? JSON.parse(data) : null
  }

  async upsert(phone, updates) {
    if (!phone) return null
    const key = `${KEY_PREFIX}${phone}`
    const existing = await this.findByPhone(phone) || { phone }
    const merged = {
      ...existing,
      ...updates,
      phone,
      lastUpdated: new Date().toISOString(),
    }
    await redis.set(key, JSON.stringify(merged), 'EX', TTL_SECONDS)
    return merged
  }

  async resetState(phone) {
    if (!phone) return null
    return this.upsert(phone, {
      currentStep: 'WELCOME',
      currentFlow: null,
      selectedDoctorId: null,
      selectedServiceId: null,
      selectedSlotId: null,
      selectedDate: null,
      tempName: null,
      tempAge: null,
      tempGender: null,
      stateData: {},
    })
  }

  async deleteByPhone(phone) {
    if (!phone) return
    await redis.del(`${KEY_PREFIX}${phone}`)
  }
}

export default new ConversationRepository()
