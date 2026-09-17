import invoiceService from "./invoice.service.js";
export const invoiceController = {
  /**
   * GET /api/invoices/lookup?value=KGN-123&type=uhid
   * GET /api/invoices/lookup?uhid=KGN-123
   */
  async lookup(req, res, next) {
    try {
      const { uhid, bookingNo, value, type } = req.query;
      const data = await invoiceService.lookupPatientForInvoice({
        uhid,
        bookingNo,
        value,
        type,
      });
      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Patient / booking details not found for the provided UHID or Token Number.",
        });
      }
      res.json({
        success: true,
        patient: data,
        data: data,
      });
    } catch (err) {
      next(err);
    }
  },
  /**
   * GET /api/invoices/uhid/:uhid
   */
  async getByUhid(req, res, next) {
    try {
      const { uhid } = req.params;
      const data = await invoiceService.lookupPatientForInvoice({ uhid });
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Patient details not found for UHID: " + uhid,
        });
      }
      res.json({
        success: true,
        patient: data,
        data: data,
      });
    } catch (err) {
      next(err);
    }
  },
  /**
   * GET /api/invoices/booking/:bookingNo
   */
  async getByBooking(req, res, next) {
    try {
      const { bookingNo } = req.params;
      const data = await invoiceService.lookupPatientForInvoice({ bookingNo });
      if (!data) {
        return res.status(404).json({
          success: false,
          message:
            "Booking details not found for Token / Booking No: " + bookingNo,
        });
      }

      res.json({
        success: true,
        patient: data,
        data: data,
      });
    } catch (err) {
      next(err);
    }
  },
};
