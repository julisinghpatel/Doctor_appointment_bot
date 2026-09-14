import bookingRepo from './booking.repository.js'

export const reportController = {
  /**
   * GET /api/reports/bookings?from=&to=
   * Returns daily booking counts (same shape as dashboard chart).
   */
  async getBookingTrends(req, res, next) {
    try {
      const data = await bookingRepo.getChartData(30)
      res.json(data.map(d => ({
        date: d._id,
        bookings: d.bookings,
        confirmed: d.confirmed,
        cancelled: d.cancelled,
      })))
    } catch (err) { next(err) }
  },

  /**
   * GET /api/reports/doctors
   * Returns per-doctor booking stats.
   */
  async getDoctorStats(req, res, next) {
    try {
      const data = await bookingRepo.getDoctorReportStats()
      res.json(data)
    } catch (err) { next(err) }
  },

  /**
   * GET /api/reports/status-distribution
   * Returns booking counts grouped by status.
   */
  async getStatusDistribution(req, res, next) {
    try {
      const data = await bookingRepo.getStatusDistribution()
      res.json(data)
    } catch (err) { next(err) }
  },

  /**
   * GET /api/reports/revenue?from=&to=
   * Returns total/average revenue and growth.
   */
  async getRevenue(req, res, next) {
    try {
      const data = await bookingRepo.getRevenueStats()
      res.json(data)
    } catch (err) { next(err) }
  },
}
