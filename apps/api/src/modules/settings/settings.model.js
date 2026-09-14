import settingsRepo from './settings.repository.js'

export async function getSettings() {
  return settingsRepo.getSettings()
}

export async function updateSettings(data) {
  return settingsRepo.updateSettings(data)
}

export default settingsRepo
