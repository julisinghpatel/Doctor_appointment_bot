import { formatDate } from '../utils/formatters'
import { printService } from './printService'

/**
 * DoctorPrescriptionPrintHandler — Specialized print handler for Doctor's
 * Digital OPD Consultation & Prescription Slip.
 * - Renders ONLY prescribed medicines and ONLY ordered lab tests
 * - Displays Hospital Brand Logo (/image/image.png)
 * - Resolves full patient address details
 * - Expands doctor notes section space
 */
export class DoctorPrescriptionPrintHandler {
  /**
   * Print a doctor consultation slip.
   * @param {Object} booking
   */
  static async printPrescription(booking) {
    if (!booking) return console.warn('DoctorPrescriptionPrintHandler: No booking provided')

    // 1. Open popup window SYNCHRONOUSLY before async calls to prevent browser popup blocking
    let printWin = null
    try {
      printWin = window.open('', '_blank', 'width=920,height=780,scrollbars=yes')
      if (printWin) {
        printWin.document.open()
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
          <head><title>Preparing Doctor Prescription...</title></head>
          <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:90vh; color:#0369a1;">
            <div style="font-size:18px; font-weight:700; margin-bottom:8px;">KG Nanda Hospital</div>
            <div style="font-size:14px; color:#64748b;">Generating Doctor Prescription Slip...</div>
          </body>
          </html>
        `)
        printWin.document.close()
      }
    } catch (e) {
      console.warn('Popup window blocked, fallback to window.print()', e)
    }

    // 2. Fetch enriched slip details
    let slipData = booking
    try {
      slipData = await printService.getSlipData(booking)
    } catch (err) {
      console.warn('Using provided booking object for prescription print', err)
    }

    // Preserve locally passed prescription if available on booking
    if (booking.prescription) {
      slipData.prescription = booking.prescription
    }

    // 3. Populate print window HTML
    if (printWin && !printWin.closed) {
      const html = this._buildPrescriptionHTML(slipData)
      printWin.document.open()
      printWin.document.write(html)
      printWin.document.close()

      const triggerPrint = () => {
        try {
          printWin.focus()
          printWin.print()
        } catch (e) {
          console.error('Print trigger failed', e)
        }
      }

      printWin.onload = () => setTimeout(triggerPrint, 300)
      setTimeout(triggerPrint, 600)
    } else {
      window.print()
    }
  }

  /** Build HTML document for Doctor's Prescription slip */
  static _buildPrescriptionHTML(booking) {
    const isIPD =
      booking.type === 'HOSPITALIZATION' ||
      booking.service_name?.toLowerCase().includes('ipd') ||
      booking.service_name?.toLowerCase().includes('hospitalization')

    const docTitle = isIPD ? 'IPD Doctor Prescription' : 'OPD Doctor Consultation Slip'
    const isOldPatient = Boolean(booking.isOld || booking.is_old)
    const patientStatusLabel = isOldPatient ? ' (Old Patient पुराना मरीज)' : ' (नया मरीज)'

    const tokenDisplay = booking.token_number
      ? String(booking.token_number).startsWith('T-')
        ? booking.token_number
        : `Token #${booking.token_number}`
      : booking.time_slot || '—'

    const generatedTime = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const appointmentDate = formatDate(booking.preferredDate || booking.date)
    const source = booking.source_label || booking.created_by || booking.bookingSource || 'WhatsApp Bot'
    const doctorFee = booking.consultation_fee || booking.doctor_fee || 500

    // Full Address Resolution
    const addrLine = booking.address || booking.patient_address || booking.patientId?.address || booking.patient?.address || ''
    const distLine = booking.district || booking.patient_district || booking.patientId?.district || booking.patient?.district || ''
    const pinLine = booking.pinCode || booking.pincode || booking.pin_code || booking.patient_pin_code || booking.patientId?.pinCode || booking.patient?.pinCode || ''
    const addressParts = [addrLine, distLine, pinLine].filter(Boolean)
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '—'

    const accentBg = isIPD ? '#dcfce7' : '#e0f2fe'
    const accentBorder = isIPD ? '#bbf7d0' : '#bae6fd'
    const accentText = isIPD ? '#14532d' : '#0c4a6e'
    const titleColor = isIPD ? '#15803d' : '#0284c7'

    // Prescription Data
    const rx = booking.prescription || booking.meta?.prescription || {}
    const rxVitals = rx.vitals || {}
    const rxNotes = rx.doctor_notes || ''
    const prescribedMeds = rx.medicines || []
    const orderedTests = rx.tests || []

    // Build ONLY Prescribed Medicines Rows HTML
    let medRowsHTML = ''
    if (prescribedMeds && prescribedMeds.length > 0) {
      prescribedMeds.forEach((pm, idx) => {
        const srNo = idx + 1
        const name = pm.name || pm.medicine_name || ''
        const dosage = pm.dosage || '—'
        const frequency = pm.frequency || '—'
        const duration = pm.duration || '—'
        const remarks = pm.remarks || ''

        medRowsHTML += `<tr>
          <td style="text-align:center; font-weight:600;">${srNo}</td>
          <td style="font-weight:700; color:#0369a1;">${name}</td>
          <td>${dosage}</td>
          <td>${frequency}</td>
          <td>${duration}</td>
          <td>${remarks}</td>
          <td style="text-align:center;"><div class="chk">✓</div></td>
        </tr>`
      })
    } else {
      medRowsHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b; font-style:italic; padding:8px 4px;">No medicines prescribed on this slip</td></tr>`
    }

    // Build ONLY Ordered Lab Tests Rows HTML
    let testRowsHTML = ''
    if (orderedTests && orderedTests.length > 0) {
      orderedTests.forEach((pt, idx) => {
        const srNo = idx + 1
        const name = pt.name || pt.test_name || ''
        const remarks = pt.remarks || ''

        testRowsHTML += `<tr>
          <td style="text-align:center; font-weight:600;">${srNo}</td>
          <td style="font-weight:700; color:#0369a1;">${name}</td>
          <td>${remarks}</td>
          <td style="text-align:center;"><div class="chk">✓</div></td>
        </tr>`
      })
    } else {
      testRowsHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; font-style:italic; padding:8px 4px;">No lab tests requested on this slip</td></tr>`
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${docTitle} — ${booking.patient_name || 'Patient'}</title>
<style>
  @page { size: A4 portrait; margin: 4mm 6mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .slip {
    border: 1.5px solid ${isIPD ? '#16a34a' : '#0284c7'};
    border-radius: 8px;
    padding: 10px 12px;
    background: #fff;
    margin: 0 auto;
    max-width: 800px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .logo-img { height: 48px; max-width: 180px; object-fit: contain; }
  .hospital-name { font-size: 19px; font-weight: 800; color: #0369a1; line-height: 1.1; }
  .doc-title { font-size: 13px; font-weight: 700; color: ${titleColor}; margin-top: 1px; }
  .gen-time { font-size: 10px; color: #64748b; font-weight:600; text-align: right; }
  /* Stats Bar */
  .stats-bar {
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: ${accentBg}; border: 1px solid ${accentBorder};
    border-radius: 5px; padding: 4px 8px; margin-bottom: 6px; gap: 6px;
  }
  .stat-label { font-size: 9px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.3px; }
  .stat-value { font-size: 11px; font-weight: 700; color: ${accentText}; margin-top: 1px; }
  /* Two Columns */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }
  .detail-box { border: 1px solid #cbd5e1; border-radius: 5px; padding: 5px 8px; background: #f8fafc; }
  .box-header {
    font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase;
    letter-spacing: 0.3px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 4px;
  }
  .highlight { color: #d97706; font-weight: 700; }
  .field-row { display: flex; font-size: 10px; line-height: 1.35; margin-bottom: 2px; }
  .field-name { font-weight: 700; color: #334155; min-width: 80px; }
  .field-val { color: #0f172a; font-weight: 600; flex: 1; }
  /* Vitals */
  .vitals-wrap { border: 1px solid #cbd5e1; border-radius: 5px; overflow: hidden; margin-bottom: 6px; }
  .vitals-title { font-size: 9.5px; font-weight: 800; color: #0369a1; background: #f0f9ff; padding: 3px 8px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
  .vitals-grid { display: grid; grid-template-columns: repeat(5, 1fr); text-align: center; }
  .vital-header { font-size: 8.5px; font-weight: 700; color: #0369a1; padding: 2px 2px; border-right: 1px solid #e2e8f0; background: #f8fafc; }
  .vital-header:last-child { border-right: none; }
  .vital-cell { height: 18px; font-size: 10px; font-weight: 700; color: #0f172a; display:flex; align-items:center; justify-content:center; border-right: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; }
  .vital-cell:last-child { border-right: none; }
  /* Doctor Notes */
  .rx-box { border: 1px solid #cbd5e1; border-radius: 5px; padding: 6px 10px; margin-bottom: 6px; min-height: 130px; }
  .rx-title { font-size: 9.5px; font-weight: 800; color: #0369a1; text-transform: uppercase; margin-bottom: 3px; }
  .notes-text { font-size: 10.5px; color: #1e293b; font-weight: 600; line-height: 1.4; white-space: pre-wrap; }
  .ruled-line { border-bottom: 1px solid #e2e8f0; margin-top: 16px; height: 1px; }
  /* Tables */
  .tbl-wrap { border: 1px solid #0284c7; border-radius: 5px; overflow: hidden; margin-bottom: 6px; }
  .tbl-header { background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800; padding: 4px 8px; display: flex; justify-content: space-between; border-bottom: 1px solid #0284c7; }
  .tbl-sub { font-size: 8.5px; font-weight: 600; color: #0284c7; }
  table.p-tbl { width: 100%; border-collapse: collapse; font-size: 9.5px; }
  table.p-tbl th { background: #f8fafc; color: #0369a1; font-weight: 700; padding: 3px 6px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #e2e8f0; text-align: left; }
  table.p-tbl th:last-child { border-right: none; }
  table.p-tbl td { padding: 3px 6px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #e2e8f0; color: #0f172a; height: 18px; overflow: hidden; white-space: nowrap; }
  table.p-tbl td:last-child { border-right: none; }
  .chk { display: inline-block; width: 11px; height: 11px; border: 1.2px solid #0369a1; border-radius: 2px; text-align: center; line-height: 9px; font-size: 8px; font-weight: 800; color: #0369a1; }
  /* Signature */
  .sig-area { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 6px; padding-top: 2px; }
  .sig-box { width: 180px; height: 38px; border: 1px solid #cbd5e1; border-radius: 4px; background: #fafafa; display: flex; align-items: flex-end; padding: 2px 6px; }
  .sig-title { font-size: 9px; font-weight: 700; color: #475569; }
  .notice { font-size: 8.5px; color: #0284c7; font-weight: 700; margin-top: 2px; line-height: 1.25; }
  .stamp { font-size: 9px; font-weight: 800; color: #94a3b8; border: 1px dashed #94a3b8; padding: 12px 18px; border-radius: 4px; text-align: center; }
  /* Footer */
  .footer-bar { display: flex; align-items: center; justify-content: space-around; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 5px; padding: 4px 8px; margin-top: 6px; }
  .contact { display: flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 700; color: #0369a1; }
</style>
</head>
<body>

<div class="slip">
  <!-- Header -->
  <div class="header">
    <div class="brand">
      <img src="/image/image.png" class="logo-img" alt="Hospital Logo" onError="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
      <div style="display:none; width:40px; height:40px; background:#0284c7; border-radius:50%; color:#fff; align-items:center; justify-content:center; font-weight:800; font-size:18px;">KGN</div>
      <div>
        <div class="hospital-name">KG Nanda Hospital</div>
        <div class="doc-title">${docTitle}</div>
      </div>
    </div>
    <div class="gen-time">Generated: ${generatedTime}</div>
  </div>

  <!-- Stats Bar -->
  <div class="stats-bar">
    <div><div class="stat-label">UHID:</div><div class="stat-value">${booking.uhid || 'KGN-PENDING'}</div></div>
    <div><div class="stat-label">TOKEN:</div><div class="stat-value">${tokenDisplay}</div></div>
    <div><div class="stat-label">SOURCE:</div><div class="stat-value">${source}</div></div>
    <div><div class="stat-label">DOCTOR FEES:</div><div class="stat-value">₹ ${doctorFee}</div></div>
  </div>

  <!-- Two Column Details -->
  <div class="two-col">
    <div class="detail-box">
      <div class="box-header">PATIENT DETAILS<span class="highlight">${patientStatusLabel}</span></div>
      <div class="field-row"><span class="field-name">Name:</span><span class="field-val">${booking.patient_name || '—'}</span></div>
      <div class="field-row"><span class="field-name">Age/Gender:</span><span class="field-val">${booking.age ? booking.age + ' Yrs' : '—'} / ${booking.gender || '—'}</span></div>
      <div class="field-row"><span class="field-name">Mobile:</span><span class="field-val">+91 ${booking.mobile || '—'}</span></div>
      <div class="field-row"><span class="field-name">Address:</span><span class="field-val">${fullAddress}</span></div>
    </div>
    <div class="detail-box">
      <div class="box-header">VISIT &amp; CLINICAL DETAILS</div>
      <div class="field-row"><span class="field-name">Visit Type:</span><span class="field-val">${isIPD ? 'Hospitalization (IPD Admission)' : 'OPD Appointment'}</span></div>
      <div class="field-row"><span class="field-name">${isIPD ? 'Admission Date:' : 'Appt Date:'}</span><span class="field-val">${appointmentDate}</span></div>
      <div class="field-row"><span class="field-name">Dept / Doctor:</span><span class="field-val">${booking.doctor_name || 'General Doctor'}${booking.doctor_specialization ? ' — ' + booking.doctor_specialization : ''}</span></div>
      <div class="field-row"><span class="field-name">Chief Complaint:</span><span class="field-val">${booking.problemDescription || booking.problem_description || 'Routine Consultation / Checkup'}</span></div>
    </div>
  </div>

  <!-- Vitals -->
  <div class="vitals-wrap">
    <div class="vitals-title">VITALS SECTION (FOR CLINICAL USE)</div>
    <div class="vitals-grid">
      <div class="vital-header">BP (mmHg)</div>
      <div class="vital-header">Pulse (bpm)</div>
      <div class="vital-header">Temp (°F)</div>
      <div class="vital-header">Weight (kg)</div>
      <div class="vital-header">SpO2 (%)</div>
      <div class="vital-cell">${rxVitals.bp || ''}</div>
      <div class="vital-cell">${rxVitals.pulse || ''}</div>
      <div class="vital-cell">${rxVitals.temp || ''}</div>
      <div class="vital-cell">${rxVitals.weight || ''}</div>
      <div class="vital-cell">${rxVitals.spo2 || ''}</div>
    </div>
  </div>

  <!-- Doctor Notes -->
  <div class="rx-box">
    <div class="rx-title">DOCTOR'S NOTES / CLINICAL DIAGNOSIS</div>
    ${rxNotes ? `<div class="notes-text">${rxNotes}</div>` : `<div class="ruled-line"></div><div class="ruled-line"></div><div class="ruled-line"></div><div class="ruled-line"></div>`}
  </div>

  <!-- Prescribed Medicines Table -->
  <div class="tbl-wrap">
    <div class="tbl-header">
      <span>PRESCRIBED MEDICINES</span>
      <span class="tbl-sub">(Only selected medicines)</span>
    </div>
    <table class="p-tbl">
      <thead>
        <tr>
          <th style="width:38px; text-align:center;">Sr. No.</th>
          <th>Medicine Name</th>
          <th style="width:90px;">Dosage</th>
          <th style="width:100px;">Frequency</th>
          <th style="width:80px;">Duration</th>
          <th style="width:120px;">Remarks</th>
          <th style="width:38px; text-align:center;">Mark</th>
        </tr>
      </thead>
      <tbody>
        ${medRowsHTML}
      </tbody>
    </table>
  </div>

  <!-- Ordered Lab Tests Table -->
  <div class="tbl-wrap">
    <div class="tbl-header">
      <span>ORDERED LAB TESTS</span>
      <span class="tbl-sub">(Only selected tests)</span>
    </div>
    <table class="p-tbl">
      <thead>
        <tr>
          <th style="width:38px; text-align:center;">Sr. No.</th>
          <th>Test Name</th>
          <th style="width:250px;">Remarks</th>
          <th style="width:38px; text-align:center;">Mark</th>
        </tr>
      </thead>
      <tbody>
        ${testRowsHTML}
      </tbody>
    </table>
  </div>

  <!-- Signature -->
  <div class="sig-area">
    <div>
      <div class="sig-box"><div class="sig-title">Doctor's Signature</div></div>
    </div>
    <div class="stamp">HOSPITAL STAMP</div>
  </div>

  <!-- Footer -->
  <div class="footer-bar">
    <div class="contact">WhatsApp Chatbot <strong>+91 8853991899</strong></div>
    <div class="contact">Call Helpline Number <strong>+91 9838850287</strong></div>
    <div class="contact">Helpdesk <strong>+91 8840376333</strong></div>
  </div>
</div>

</body>
</html>`
  }
}

export default DoctorPrescriptionPrintHandler
