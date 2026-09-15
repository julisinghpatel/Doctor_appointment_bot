import { describe, it, expect, vi } from 'vitest'
import bookingService from '../src/modules/booking/booking.service.js'
import bookingRepo from '../src/modules/booking/booking.repository.js'

describe('BookingService - Date Filter (preferredDate)', () => {
  it('builds YYYY-MM-DD preferredDate string for `date`', async () => {
    const spy = vi.spyOn(bookingRepo, 'findAll').mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })

    await bookingService.getBookings({ date: '2026-08-20' })

    expect(spy).toHaveBeenCalledWith(
      { preferredDate: '2026-08-20' },
      { page: 1, limit: 10, sortBy: 'preferredDate', sortOrder: 'desc' }
    )

    spy.mockRestore()
  })

  it('passes status and doctorId in filter', async () => {
    const repoSpy = vi.spyOn(bookingRepo, 'findAll').mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 30,
      totalPages: 0,
    })

    await bookingService.getBookings({ date: '2026-08-20', status: 'confirmed', doctor_id: 5, limit: 30 })

    expect(repoSpy).toHaveBeenCalledWith(
      { preferredDate: '2026-08-20', status: 'confirmed', doctorId: 5 },
      { page: 1, limit: 30, sortBy: 'preferredDate', sortOrder: 'desc' }
    )

    repoSpy.mockRestore()
  })
})
