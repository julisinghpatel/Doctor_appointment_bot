import settingsRepo from './settings.repository.js'

export const settingsController = {
  async get(req, res, next) {
    try {
      const settings = await settingsRepo.getSettings()
      res.json(settings)
    } catch (err) { next(err) }
  },

  async update(req, res, next) {
    try {
      const settings = await settingsRepo.updateSettings(req.body)
      res.json(settings)
    } catch (err) { next(err) }
  },
}
