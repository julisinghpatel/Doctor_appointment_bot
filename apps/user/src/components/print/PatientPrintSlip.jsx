import React from 'react'
import { Phone, MessageSquare, CheckSquare, Square } from 'lucide-react'
import { HospitalLogo } from './HospitalLogo'
import { formatDate } from '../../utils/formatters'
import { mockMedicines, mockLabTests } from '../../data/mockData'
import styles from './PatientPrintSlip.module.css'

function formatDateTime(d = new Date()) {
  const dateObj = d instanceof Date ? d : new Date(d)
  if (isNaN(dateObj.getTime())) return new Date().toLocaleString()
  return dateObj.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function SingleSlipCard({ booking }) {
  if (!booking) return null

  const isIPD =
    booking.type === 'HOSPITALIZATION' ||
    booking.service_name?.toLowerCase().includes('ipd') ||
    booking.service_name?.toLowerCase().includes('hospitalization')

  const docTitle = isIPD ? 'IPD Admission Ticket' : 'OPD Consultation Slip'
  const isOldPatient = Boolean(booking.isOld || booking.is_old)
  const patientStatusLabel = isOldPatient ? ' (Old Patient पुराना मरीज)' : ' (नया मरीज)'

  // Extract prescription data if available
  const rx = booking.prescription || booking.meta?.prescription || {}
  const rxVitals = rx.vitals || {}
  const rxNotes = rx.doctor_notes || ''
  const prescribedMeds = rx.medicines || []
  const orderedTests = rx.tests || []

  // Address Formatting
  const addrLine = booking.address || booking.patient_address || booking.patientId?.address || booking.patient?.address || ''
  const distLine = booking.district || booking.patient_district || booking.patientId?.district || booking.patient?.district || ''
  const pinLine = booking.pinCode || booking.pincode || booking.pin_code || booking.patient_pin_code || booking.patientId?.pinCode || booking.patient?.pinCode || ''
  const addressParts = [addrLine, distLine, pinLine].filter(Boolean)
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '—'

  // Build Medicine Rows (ONLY SELECTED MEDICINES)
  const medicineRows = prescribedMeds.map((pm, idx) => ({
    srNo: idx + 1,
    name: pm.name || pm.medicine_name || '',
    dosage: pm.dosage || '—',
    frequency: pm.frequency || '—',
    duration: pm.duration || '—',
    remarks: pm.remarks || '',
    checked: true,
  }))

  // Build Test Rows (ONLY SELECTED LAB TESTS)
  const testRows = orderedTests.map((pt, idx) => ({
    srNo: idx + 1,
    name: pt.name || pt.test_name || '',
    remarks: pt.remarks || '',
    checked: true,
  }))

  return (
    <div className={`${styles.slipCard} ${isIPD ? styles.ipdSlipCard : ''}`}>
      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.brandGroup}>
          <HospitalLogo height={44} />
          <div>
            <h1 className={styles.hospitalTitle}>KG Nanda Hospital</h1>
            <div className={`${styles.docTitle} ${isIPD ? styles.ipdDocTitle : ''}`}>{docTitle}</div>
          </div>
        </div>
        <div className={styles.generatedTime}>
          Generated: {formatDateTime(booking.updated_at || booking.created_at || new Date())}
        </div>
      </div>

      {/* ── TOP STATS BAR ── */}
      <div className={`${styles.statsBar} ${isIPD ? styles.ipdStatsBar : ''}`}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>UHID:</span>
          <span className={`${styles.statValue} ${isIPD ? styles.ipdStatValue : ''}`}>
            {booking.uhid || 'KGN-PENDING'}
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>TOKEN:</span>
          <span className={`${styles.statValue} ${isIPD ? styles.ipdStatValue : ''}`}>
            {booking.token_number
              ? String(booking.token_number).startsWith('T-')
                ? booking.token_number
                : `Token #${booking.token_number}`
              : booking.time_slot || '—'}
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>SOURCE:</span>
          <span className={`${styles.statValue} ${isIPD ? styles.ipdStatValue : ''}`}>
            {booking.source_label || booking.created_by || booking.bookingSource || 'WhatsApp Bot'}
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>DOCTOR FEES:</span>
          <span className={`${styles.statValue} ${isIPD ? styles.ipdStatValue : ''}`}>
            ₹ {booking.consultation_fee || booking.doctor_fee || 500}
          </span>
        </div>
      </div>

      {/* ── TWO COLUMNS: PATIENT & VISIT ── */}
      <div className={styles.twoColGrid}>
        {/* Left Column: Patient Details */}
        <div className={styles.detailsBox}>
          <div className={styles.boxHeader}>
            PATIENT DETAILS<span className={styles.highlightText}>{patientStatusLabel}</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>Name:</span>
            <span className={styles.fieldVal}>{booking.patient_name || '—'}</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>Age/Gender:</span>
            <span className={styles.fieldVal}>
              {booking.age ? `${booking.age} Yrs` : '—'} / {booking.gender || '—'}
            </span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>Mobile:</span>
            <span className={styles.fieldVal}>+91 {booking.mobile || '—'}</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>Address:</span>
            <span className={styles.fieldVal}>{fullAddress}</span>
          </div>
        </div>

        {/* Right Column: Visit Details */}
        <div className={styles.detailsBox}>
          <div className={styles.boxHeader}>VISIT & CLINICAL DETAILS</div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>Visit Type:</span>
            <span className={styles.fieldVal}>
              {isIPD ? 'Hospitalization (IPD Admission)' : 'OPD Appointment'}
            </span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>{isIPD ? 'Admission Date:' : 'Appt Date:'}</span>
            <span className={styles.fieldVal}>{formatDate(booking.date)}</span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>Dept / Doctor:</span>
            <span className={styles.fieldVal}>
              {booking.doctor_name || 'Dr. Anand Prakash Tiwari'}
              {booking.doctor_specialization ? ` — ${booking.doctor_specialization}` : ''}
            </span>
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.fieldName}>Chief Complaint:</span>
            <span className={styles.fieldVal}>
              {booking.problemDescription || booking.problem_description || 'Routine Consultation / Checkup'}
            </span>
          </div>
        </div>
      </div>

      {/* ── VITALS SECTION ── */}
      <div className={styles.vitalsContainer}>
        <div className={styles.vitalsTitle}>VITALS SECTION (FOR CLINICAL USE)</div>
        <div className={styles.vitalsGrid}>
          <div className={styles.vitalHeaderCol}>BP (mmHg)</div>
          <div className={styles.vitalHeaderCol}>Pulse (bpm)</div>
          <div className={styles.vitalHeaderCol}>Temp (°F)</div>
          <div className={styles.vitalHeaderCol}>Weight (kg)</div>
          <div className={styles.vitalHeaderCol}>SpO2 (%)</div>

          <div className={styles.vitalCell}>{rxVitals.bp || ''}</div>
          <div className={styles.vitalCell}>{rxVitals.pulse || ''}</div>
          <div className={styles.vitalCell}>{rxVitals.temp || ''}</div>
          <div className={styles.vitalCell}>{rxVitals.weight || ''}</div>
          <div className={styles.vitalCell}>{rxVitals.spo2 || ''}</div>
        </div>
      </div>

      {/* ── DOCTOR'S NOTES ── */}
      <div className={styles.prescriptionBox}>
        <div className={styles.prescriptionTitle}>DOCTOR'S NOTES</div>
        {rxNotes ? (
          <div className={styles.printedNotesText}>{rxNotes}</div>
        ) : (
          <div className={styles.ruledLines}>
            <div className={styles.line} />
            <div className={styles.line} />
            <div className={styles.line} />
          </div>
        )}
      </div>

      {/* ── PRESCRIPTION TABLE (15 ROWS) ── */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderBar}>
          <span>PRESCRIPTION</span>
          <span className={styles.tableHeaderSub}>(Doctor can mark applicable medicines for the patient)</span>
        </div>
        <table className={styles.printTable}>
          <thead>
            <tr>
              <th style={{ width: '38px', textAlign: 'center' }}>Sr. No.</th>
              <th style={{ textAlign: 'left' }}>Medicine Name</th>
              <th style={{ width: '90px' }}>Dosage</th>
              <th style={{ width: '100px' }}>Frequency</th>
              <th style={{ width: '80px' }}>Duration</th>
              <th style={{ width: '120px' }}>Remarks</th>
              <th style={{ width: '38px', textAlign: 'center' }}>Mark</th>
            </tr>
          </thead>
          <tbody>
            {medicineRows.map((row) => (
              <tr key={row.srNo}>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.srNo}</td>
                <td>{row.name}</td>
                <td>{row.dosage}</td>
                <td>{row.frequency}</td>
                <td>{row.duration}</td>
                <td>{row.remarks}</td>
                <td style={{ textAlign: 'center' }}>
                  <div className={styles.checkboxOutline}>{row.checked ? '✓' : ''}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── TESTS NEEDED TABLE (10 ROWS) ── */}
      <div className={styles.tableContainer} style={{ marginTop: '8px' }}>
        <div className={styles.tableHeaderBar}>
          <span>TESTS NEEDED</span>
          <span className={styles.tableHeaderSub}>(Doctor can mark applicable tests for the patient)</span>
        </div>
        <table className={styles.printTable}>
          <thead>
            <tr>
              <th style={{ width: '38px', textAlign: 'center' }}>Sr. No.</th>
              <th style={{ textAlign: 'left' }}>Test Name</th>
              <th style={{ width: '250px' }}>Remarks</th>
              <th style={{ width: '38px', textAlign: 'center' }}>Mark</th>
            </tr>
          </thead>
          <tbody>
            {testRows.map((row) => (
              <tr key={row.srNo}>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.srNo}</td>
                <td>{row.name}</td>
                <td>{row.remarks}</td>
                <td style={{ textAlign: 'center' }}>
                  <div className={styles.checkboxOutline}>{row.checked ? '✓' : ''}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── SIGNATURE & STAMP ── */}
      <div className={styles.sigArea}>
        <div className={styles.sigLeft}>
          <div className={styles.sigBox}>
            <div className={styles.sigTitle}>Doctor's Signature</div>
          </div>
          <div className={styles.noticeText}>
            Please present this slip at the department {isIPD ? 'IPD admission' : 'OPD'} counter.
            <br />
            कृपया इस पर्ची को संबंधित विभाग के {isIPD ? 'आईपीडी' : 'ओपीडी'} काउंटर पर प्रस्तुत करें।
          </div>
        </div>
        <div className={styles.stampRight}>HOSPITAL STAMP</div>
      </div>

      {/* ── FOOTER CONTACTS ── */}
      <div className={styles.footerBar}>
        <div className={styles.contactItem}>
          <div className={styles.iconCircle}>
            <MessageSquare size={11} />
          </div>
          <span>
            WhatsApp Chatbot <strong>+91 8853991899</strong>
          </span>
        </div>
        <div className={styles.contactItem}>
          <div className={`${styles.iconCircle} ${styles.phoneIconCircle}`}>
            <Phone size={11} />
          </div>
          <span>
            Call Helpline Number <strong>+91 9838850287</strong>
          </span>
        </div>
        <div className={styles.contactItem}>
          <div className={`${styles.iconCircle} ${styles.phoneIconCircle}`}>
            <Phone size={11} />
          </div>
          <span>
            Helpdesk <strong>+91 8840376333</strong>
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Full A4 Page Patient OPD Consultation Print Slip
 */
export function PatientPrintSlip({ bookings = [], topBooking }) {
  const targetBooking = bookings[0] || topBooking || null

  return (
    <div id="printable-slip-area" className={styles.printPageContainer}>
      <div className={styles.pageSheet}>
        {targetBooking && <SingleSlipCard booking={targetBooking} />}
      </div>
    </div>
  )
}

export default PatientPrintSlip
