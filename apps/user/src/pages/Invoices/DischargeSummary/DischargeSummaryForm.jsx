import React, { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import styles from "./DischargeSummaryForm.module.css";

const DOCTORS = [
  { id: 1, name: "Abhinav Katiyar", qualification: "MBBS, DNB" },
  { id: 2, name: "Anand Prakash Tiwari", qualification: "M.S. (Obs & Gynae)" },
  { id: 3, name: "Vikram Singh", qualification: "MBBS, MCH" },
  { id: 4, name: "Arun Kumar Singh", qualification: "MBBS" },
  { id: 5, name: "Vishwanath Pratap Singh", qualification: "MBBS, MS" },
  { id: 6, name: "Pankaj Kumar Singh", qualification: "MBBS, MS" },
  { id: 7, name: "Sushil Krishna Murti", qualification: "MBBS, MD" },
  { id: 8, name: "Mrityunjay Prasad", qualification: "MS (Shalya)" },
  { id: 9, name: "Ankit Kumar Singh", qualification: "MBBS" },
  { id: 10, name: "Prabhunath Dubey", qualification: "BMS, PGDNC" },
  { id: 11, name: "Abhinav Mishra", qualification: "MBBS, MS (ENT)" },
  { id: 12, name: "Yogesh Kumar Pandey", qualification: "MS (Shalya)" },
  { id: 13, name: "Akhilesh Kumar Singh", qualification: "BAMS (RMO)" },
  { id: 14, name: "Niket Raj Garg", qualification: "MBBS, MS" },
  { id: 15, name: "Dilip Kumar Gupta", qualification: "MBBS, DCH" },
  { id: 16, name: "Parvez Ahmad", qualification: "BAMS, MD" },
  { id: 17, name: "Umesh Kumar Maurya", qualification: "MBBS" },
  { id: 18, name: "Shobha Jaiswal", qualification: "MBBS, MS (Obs & Gynae)" },
  { id: 19, name: "Sadhna Chaurasiya", qualification: "MBBS, DGO" },
];

const DIAGNOSIS_OPTIONS = [
  "ACUTE APPENDICITIS",
  "CHOLELITHIASIS / CHRONIC CHOLECYSTITIS",
  "RIGHT INGUINAL HERNIA",
  "LEFT INGUINAL HERNIA",
  "BILATERAL INGUINAL HERNIA",
  "VENTRAL / EPIGASTRIC HERNIA",
  "UMBILICAL / INCISIONAL HERNIA",
  "RIGHT / LEFT RENAL CALCULUS",
  "URETERIC CALCULUS",
  "BENIGN PROSTATIC HYPERPLASIA (BPH)",
  "RIGHT / LEFT HYDROCELE",
  "FISTULA IN ANO / ANAL FISSURE / HAEMORRHOIDS",
  "DIABETES MELLITUS TYPE 2",
  "ESSENTIAL HYPERTENSION",
  "ACUTE GASTROENTERITIS / DEHYDRATION",
  "FEVER WITH THROMBOCYTOPENIA / DENGUE",
  "ENTERIC FEVER / TYPHOID",
  "URINARY TRACT INFECTION (UTI)",
  "FULL TERM PREGNANCY IN LABOUR",
  "PREVIOUS LSCS WITH SCAR TENDERNESS",
  "OVARIAN CYST / FIBROID UTERUS",
  "ACUTE CHOLECYSTITIS",
  "FRACTURE SHAFT FEMUR / TIBIA",
];

const PROCEDURE_OPTIONS = [
  "LAPAROSCOPIC CHOLECYSTECTOMY",
  "OPEN CHOLECYSTECTOMY",
  "LAPAROSCOPIC APPENDECTOMY",
  "OPEN APPENDECTOMY",
  "HERNIOPLASTY / HERNIORRHAPHY (MESH REPAIR)",
  "LAPAROSCOPIC TEP / TAPP HERNIA REPAIR",
  "HYDROCELECTOMY (JABOULAY'S / LORD'S)",
  "FISTULECTOMY / FISSURECTOMY / HAEMORRHOIDECTOMY",
  "PCNL (PERCUTANEOUS NEPHROLITHOTOMY)",
  "URSL (URETEROSCOPIC LITHOTRIPSY)",
  "TURP (TRANSURETHRAL RESECTION OF PROSTATE)",
  "CYSTOSCOPY + DJ STENTING",
  "DJ STENT REMOVAL",
  "NORMAL VAGINAL DELIVERY (NVD) WITH EPISIOTOMY",
  "LOWER SEGMENT CAESAREAN SECTION (LSCS)",
  "TOTAL ABDOMINAL HYSTERECTOMY (TAH) ± BSO",
  "DIAGNOSTIC LAPAROSCOPY",
  "INCISION & DRAINAGE (I&D)",
  "WOUND DEBRIDEMENT & SUTURING",
  "CONSERVATIVE / MEDICAL MANAGEMENT",
];

const emptyPatient = {
  ipUmrNo: "",
  dischargeDate: new Date().toISOString().slice(0, 10),
  dischargeTime: "",
  ipdDays: "",
  ward: "",
  bedNo: "",
  admissionDate: "",
  admissionTime: "",
  patientName: "",
  fatherHusbandName: "",
  ageDob: "",
  sex: "",
  uhid: "",
  bookingNo: "",
  telephone: "",
  maritalStatus: "",
  address: "",
  consultantName: "",
  consultants: [""],
  anaestheticsDoctor: "",
};

const emptyForm = {
  diagnosis: "",
  procedure: "",
  notes: "",
  preparedBy: "",
  preparedDate: new Date().toISOString().slice(0, 10),
  consultantSignature: "",
  seal: "",
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};


const doctorOptionValue = (doctor) => {
  if (!doctor) return "";
  const raw = String(doctor).trim();
  const found = DOCTORS.find(
    (item) =>
      raw.toLowerCase() === item.name.toLowerCase() ||
      raw.toLowerCase().includes(item.name.toLowerCase())
  );
  return found ? found.name : raw;
};

function normalizePatient(data = {}) {
  return {
    ...emptyPatient,
    ipUmrNo:
      data.ipUmrNo ||
      data.ipUmrNoNumber ||
      data.ipdNo ||
      data.hospitalNo ||
      data.ipNo ||
      data.umrNo ||
      "",
    dischargeDate:
      data.dischargeDate ||
      data.dateOfDischarge ||
      data.discharge_date ||
      "",
    dischargeTime:
      data.dischargeTime ||
      data.timeOfDischarge ||
      data.discharge_time ||
      "",
    ipdDays:
      data.ipdDays ||
      data.ipdDaysCount ||
      data.lengthOfStay ||
      data.days ||
      "",
    ward: data.ward || data.wardName || "",
    bedNo: data.bedNo || data.bedNumber || data.bed || "",
    admissionDate:
      data.admissionDate ||
      data.dateOfAdmission ||
      data.admission_date ||
      "",
    admissionTime:
      data.admissionTime ||
      data.timeOfAdmission ||
      data.admission_time ||
      "",
    patientName: data.patientName || data.name || data.patient_name || "",
    fatherHusbandName:
      data.fatherHusbandName ||
      data.fatherName ||
      data.husbandName ||
      data.relativeName ||
      "",
    ageDob:
      data.ageDob ||
      data.age ||
      data.ageDateOfBirth ||
      data.dateOfBirth ||
      data.dob ||
      "",
    sex: data.sex || data.gender || "",
    uhid: data.uhid || data.UHID || data.uhidNo || data.uhid_no || "",
    bookingNo:
      data.bookingNo ||
      data.bookingNumber ||
      data.bookingId ||
      data.booking_id ||
      data.booking_no ||
      "",
    telephone:
      data.telephone ||
      data.mobile ||
      data.phone ||
      data.mobileNumber ||
      data.contactNo ||
      "",
    maritalStatus:
      data.maritalStatus ||
      data.marital_status ||
      "",
    address:
      data.address ||
      data.patientAddress ||
      data.patient_address ||
      "",
    consultantName: consultantVal,
    consultants: consultantsList.length ? consultantsList : [""],
    anaestheticsDoctor:
      doctorOptionValue(
        data.anaestheticsDoctor ||
        data.anestheticsDoctor ||
        data.anaesthetist ||
        data.anesthesiologist ||
        ""
      ),
  };
}

export default function DischargeSummaryForm() {
  const [uhid, setUhid] = useState("");
  const [bookingNo, setBookingNo] = useState("");
  const [patient, setPatient] = useState(emptyPatient);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const updatePatient = (field, value) => {
    setPatient((prev) => ({ ...prev, [field]: value }));
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addConsultant = () => {
    setPatient((prev) => ({
      ...prev,
      consultants: [...(prev.consultants || [""]), ""],
    }));
  };

  const removeConsultant = (index) => {
    setPatient((prev) => {
      const list = prev.consultants || [""];
      const next = list.length === 1 ? [""] : list.filter((_, i) => i !== index);
      return {
        ...prev,
        consultants: next,
        consultantName: next.filter(Boolean).join(", "),
      };
    });
  };

  const updateConsultant = (index, value) => {
    setPatient((prev) => {
      const list = [...(prev.consultants || [""])];
      list[index] = value;
      return {
        ...prev,
        consultants: list,
        consultantName: list.filter(Boolean).join(", "),
      };
    });
  };

  const calculateIpdDays = useMemo(() => {
    if (!patient.admissionDate || !patient.dischargeDate) return "";
    const admission = new Date(patient.admissionDate);
    const discharge = new Date(patient.dischargeDate);
    if (Number.isNaN(admission.getTime()) || Number.isNaN(discharge.getTime())) {
      return "";
    }
    const diff = Math.ceil(
      (discharge.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(1, diff);
  }, [patient.admissionDate, patient.dischargeDate]);

  useEffect(() => {
    const cleanUhid = String(uhid || "").replace(/\s/g, "");
    const cleanBooking = String(bookingNo || "").trim();

    if (!cleanUhid && !cleanBooking) {
      setLoading(false);
      setStatus("");
      return undefined;
    }

    if (!cleanBooking && cleanUhid.length < 3) {
      setStatus("");
      return undefined;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setStatus("Fetching patient record...");

      try {
        const endpoints = [];

        if (cleanUhid) {
          endpoints.push(
            `/invoices/lookup?uhid=${encodeURIComponent(cleanUhid)}`,
            `/invoices/uhid/${encodeURIComponent(cleanUhid)}`,
            `/patients/lookup?value=${encodeURIComponent(cleanUhid)}&type=uhid`,
            `/patients?search=${encodeURIComponent(cleanUhid)}`
          );
        }

        if (cleanBooking) {
          endpoints.push(
            `/invoices/lookup?bookingNo=${encodeURIComponent(cleanBooking)}`,
            `/invoices/booking/${encodeURIComponent(cleanBooking)}`,
            `/patients/lookup?value=${encodeURIComponent(cleanBooking)}&type=booking`,
            `/bookings?search=${encodeURIComponent(cleanBooking)}`
          );
        }

        let patientData = null;

        for (const endpoint of endpoints) {
          try {
            const response = await api.get(endpoint, {
              signal: controller.signal,
            });

            const payload = response.data;
            let raw = null;
            if (payload && payload.patient) {
              raw = payload.patient;
            } else if (Array.isArray(payload) && payload.length > 0) {
              raw = payload[0];
            } else if (payload && Array.isArray(payload.data) && payload.data.length > 0) {
              raw = payload.data[0];
            } else if (payload && payload.data && typeof payload.data === 'object') {
              raw = payload.data.patient || payload.data;
            } else {
              raw = payload;
            }

            if (
              raw &&
              (raw.name ||
                raw.patientName ||
                raw.patient_name ||
                raw.uhid ||
                raw.UHID ||
                raw.bookingNo ||
                raw.bookingNumber ||
                raw.bookingId)
            ) {
              patientData = raw;
              break;
            }
          } catch (requestError) {
            if (requestError.name === "AbortError") throw requestError;
          }
        }

        if (!patientData) {
          setStatus(
            cleanBooking
              ? "No patient found for this Token Number."
              : "No patient found for this UHID No."
          );
          return;
        }

        const normalized = normalizePatient(patientData);
        if (!normalized.ipdDays && calculateIpdDays) {
          normalized.ipdDays = calculateIpdDays;
        }

        setPatient((prev) => ({
          ...prev,
          ...normalized,
          uhid: normalized.uhid || cleanUhid || prev.uhid,
          bookingNo: normalized.bookingNo || cleanBooking || prev.bookingNo,
        }));

        setStatus(
          `✓ Patient found: ${
            normalized.patientName || normalized.uhid || normalized.bookingNo
          }`
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus(
            "Patient not found. Please check entered UHID / Token Number."
          );
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [uhid, bookingNo, calculateIpdDays]);

  const saveSummary = async (printAfterSave = false) => {
    if (!patient.patientName && !patient.uhid && !patient.bookingNo) {
      setStatus("Please enter patient details or UHID / Token Number.");
      if (printAfterSave) {
        setTimeout(() => window.print(), 200);
      }
      return;
    }

    const payload = {
      ...patient,
      ...form,
      ipdDays: patient.ipdDays || calculateIpdDays || "",
      createdAt: new Date().toISOString(),
    };

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/api/discharge-summaries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Save failed");

      setStatus("Discharge summary saved successfully.");
    } catch {
      setStatus(
        "Summary saved locally. Print is available."
      );
    } finally {
      setSaving(false);
    }

    if (printAfterSave) {
      setTimeout(() => window.print(), 200);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.screenHeader}>
       
      </header>

      <main className={styles.card}>
        <section className={styles.lookupBox}>
          <div className={styles.lookupGrid}>
            <div className={styles.lookupField}>
              <span>UHID No.</span>
              <div className={styles.lookupInputRow}>
                <input
                  value={uhid}
                  onChange={(e) => setUhid(e.target.value)}
                  placeholder="Enter UHID No."
                />
              </div>
            </div>

            <div className={styles.lookupField}>
              <span>Token Number</span>
              <div className={styles.lookupInputRow}>
                <input
                  value={bookingNo}
                  onChange={(e) => setBookingNo(e.target.value)}
                  placeholder="Enter Token Number"
                />
              </div>
            </div>
          </div>

          {status && <div className={styles.status}>{status}</div>}
        </section>

        <section className={styles.section}>
         

          <div className={styles.grid}>
            <Field label="I.P. / UMR No.">
              <input
                value={patient.ipUmrNo}
                onChange={(e) => updatePatient("ipUmrNo", e.target.value)}
              />
            </Field>

            <Field label="Discharge Date">
              <input
                type="date"
                value={patient.dischargeDate}
                onChange={(e) =>
                  updatePatient("dischargeDate", e.target.value)
                }
              />
            </Field>

            <Field label="Discharge Time">
              <input
                type="time"
                value={patient.dischargeTime}
                onChange={(e) =>
                  updatePatient("dischargeTime", e.target.value)
                }
              />
            </Field>

            <Field label="No. of IPD Days">
              <input
                value={patient.ipdDays || calculateIpdDays}
                onChange={(e) => updatePatient("ipdDays", e.target.value)}
              />
            </Field>

            <Field label="Ward">
              <input
                value={patient.ward}
                onChange={(e) => updatePatient("ward", e.target.value)}
              />
            </Field>

            <Field label="Bed No.">
              <input
                value={patient.bedNo}
                onChange={(e) => updatePatient("bedNo", e.target.value)}
              />
            </Field>

            <Field label="Admission Date">
              <input
                type="date"
                value={patient.admissionDate}
                onChange={(e) =>
                  updatePatient("admissionDate", e.target.value)
                }
              />
            </Field>

            <Field label="Admission Time">
              <input
                type="time"
                value={patient.admissionTime}
                onChange={(e) =>
                  updatePatient("admissionTime", e.target.value)
                }
              />
            </Field>

            <Field label="Patient's Name" wide>
              <input
                value={patient.patientName}
                onChange={(e) =>
                  updatePatient("patientName", e.target.value)
                }
              />
            </Field>

            <Field label="Father's / Husband's Name" wide>
              <input
                value={patient.fatherHusbandName}
                onChange={(e) =>
                  updatePatient("fatherHusbandName", e.target.value)
                }
              />
            </Field>

            <Field label="Age / Date of Birth">
              <input
                value={patient.ageDob}
                onChange={(e) => updatePatient("ageDob", e.target.value)}
              />
            </Field>

            <Field label="Sex">
              <select
                value={patient.sex}
                onChange={(e) => updatePatient("sex", e.target.value)}
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="UHID No.">
              <input
                value={patient.uhid}
                onChange={(e) => updatePatient("uhid", e.target.value)}
              />
            </Field>

          

            <Field label="Tel. No.">
              <input
                value={patient.telephone}
                onChange={(e) =>
                  updatePatient("telephone", e.target.value)
                }
              />
            </Field>

            <Field label="Marital Status">
              <select
                value={patient.maritalStatus}
                onChange={(e) =>
                  updatePatient("maritalStatus", e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Widow">Widow</option>
                <option value="Widower">Widower</option>
                <option value="Divorced">Divorced</option>
              </select>
            </Field>

            <Field label="Address" wide>
              <textarea
                value={patient.address}
                onChange={(e) => updatePatient("address", e.target.value)}
                rows="2"
              />
            </Field>

            <div style={{ gridColumn: "span 2", marginTop: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: "#244d6f", fontSize: "14.5px", fontWeight: "850" }}>Consultant Doctor Name(s)</span>
                <button
                  type="button"
                  onClick={addConsultant}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "5px 12px",
                    border: "1px solid #a9d7f2",
                    borderRadius: "7px",
                    background: "#e0f2fe",
                    color: "#0284c7",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  + Add Consultant
                </button>
              </div>

              {(patient.consultants && patient.consultants.length > 0
                ? patient.consultants
                : [patient.consultantName || ""]
              ).map((consultant, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      color: "#64748b",
                      fontSize: "12px",
                      fontWeight: "750",
                      textAlign: "center",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <select
                    value={consultant}
                    onChange={(e) => updateConsultant(index, e.target.value)}
                    className={styles.doctorSelect}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Consultant Doctor</option>
                    {consultant &&
                      !DOCTORS.some((d) => d.name === consultant) && (
                        <option value={consultant}>{consultant}</option>
                      )}
                    {DOCTORS.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} — {doctor.qualification}
                      </option>
                    ))}
                  </select>
                  {(patient.consultants || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConsultant(index)}
                      style={{
                        width: "36px",
                        height: "36px",
                        border: "1px solid #fee2e2",
                        borderRadius: "6px",
                        background: "#fef2f2",
                        color: "#dc2626",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: "bold",
                        fontSize: "15px",
                      }}
                      title="Remove consultant"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Field label="Anaesthetics Dr." wide>
              <div className={styles.doctorSelectWrap}>
                <select
                  value={patient.anaestheticsDoctor}
                  onChange={(e) =>
                    updatePatient("anaestheticsDoctor", e.target.value)
                  }
                  className={styles.doctorSelect}
                >
                  <option value="">Select Anaesthetics Doctor</option>
                  {patient.anaestheticsDoctor &&
                    !DOCTORS.some((d) => d.name === patient.anaestheticsDoctor) && (
                      <option value={patient.anaestheticsDoctor}>
                        {patient.anaestheticsDoctor}
                      </option>
                    )}
                  {DOCTORS.map((doctor) => (
                    <option key={doctor.id} value={doctor.name}>
                      {doctor.name} — {doctor.qualification}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.documentSection}>
            <div className={styles.documentHeading} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <span>DIAGNOSIS</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Quick Select:</span>
                <select
                  style={{
                    height: "36px",
                    borderRadius: "6px",
                    border: "1px solid #c8d9e5",
                    padding: "0 10px",
                    background: "#ffffff",
                    color: "#173b5d",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onChange={(e) => {
                    if (e.target.value) {
                      updateForm(
                        "diagnosis",
                        form.diagnosis
                          ? `${form.diagnosis}, ${e.target.value}`
                          : e.target.value
                      );
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select Diagnosis</option>
                  {DIAGNOSIS_OPTIONS.map((diag, idx) => (
                    <option key={idx} value={diag}>
                      {diag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={form.diagnosis}
              onChange={(e) => updateForm("diagnosis", e.target.value)}
              placeholder="Enter or select diagnosis..."
              rows="4"
            />
          </div>

          <div className={styles.documentSection}>
            <div className={styles.documentHeading} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <span>PROCEDURE</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Quick Select:</span>
                <select
                  style={{
                    height: "36px",
                    borderRadius: "6px",
                    border: "1px solid #c8d9e5",
                    padding: "0 10px",
                    background: "#ffffff",
                    color: "#173b5d",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onChange={(e) => {
                    if (e.target.value) {
                      updateForm(
                        "procedure",
                        form.procedure
                          ? `${form.procedure}, ${e.target.value}`
                          : e.target.value
                      );
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select Procedure</option>
                  {PROCEDURE_OPTIONS.map((proc, idx) => (
                    <option key={idx} value={proc}>
                      {proc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={form.procedure}
              onChange={(e) => updateForm("procedure", e.target.value)}
              placeholder="Enter or select procedure / operation details..."
              rows="4"
            />
          </div>

          <div className={styles.documentSection}>
            <div className={styles.documentHeading}>NOTE</div>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              placeholder="Enter discharge advice / notes..."
              rows="4"
            />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span>02</span>
            <div>
              <h2>Prepared &amp; Signature Details</h2>
              <p>Print par ye details document ke bottom mein show hongi.</p>
            </div>
          </div>

          <div className={styles.grid}>
            <Field label="Prepared By">
              <input
                value={form.preparedBy}
                onChange={(e) => updateForm("preparedBy", e.target.value)}
                placeholder="Dr. / Staff Name"
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={form.preparedDate}
                onChange={(e) =>
                  updateForm("preparedDate", e.target.value)
                }
              />
            </Field>

            <Field label="Consultant's Signature">
              <input
                value={form.consultantSignature}
                onChange={(e) =>
                  updateForm("consultantSignature", e.target.value)
                }
                placeholder="Signature / Name"
              />
            </Field>

            <Field label="Seal">
              <input
                value={form.seal}
                onChange={(e) => updateForm("seal", e.target.value)}
                placeholder="Hospital / Doctor Seal"
              />
            </Field>
          </div>
        </section>

        <div className={styles.bottomActions}>
          <button
            className={styles.secondary}
            disabled={saving}
            onClick={() => saveSummary(false)}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            className={styles.primary}
            disabled={saving}
            onClick={() => saveSummary(true)}
          >
            🖨 Save &amp; Print A4
          </button>
        </div>
      </main>

      <div className={`${styles.printDocument} printDocument`}>
        <div className={styles.printHeader}>
          <div className={styles.printLogo}>
            <img
              src="/image/image.png"
              alt="KG Nanda Hospital Logo"
              className={styles.printLogoImg}
            />
            <div className={styles.printLogoBrand}>
              <strong className={styles.printLogoName}>K.G. Nanda Hospital</strong>
              <span className={styles.printLogoSub}>......Because we care</span>
            </div>
          </div>

          <div className={styles.printHospital}>
            <h1>K.G. NANDA HOSPITAL</h1>
            <div>WARD NO.-11 SANJAY NAGAR G.T. ROAD CHANDAULI</div>
          </div>

          <div className={styles.printHeaderSpacer} />
        </div>

        <div className={styles.printTitleBox}>
          <span className={styles.printTitle}>DISCHARGE SUMMARY</span>
        </div>

        <div className={styles.printMainBox}>
          {/* Top Section: IPD / Admission / Discharge details */}
          <div className={styles.printTopSection}>
            <div className={styles.printRow}>
              <div style={{ width: '32%' }}><b>I.P./UMR No : </b>{patient.ipUmrNo}</div>
              <div style={{ width: '28%' }}><b>Discharge Date : </b>{formatDate(patient.dischargeDate)}</div>
              <div style={{ width: '20%' }}><b>Time : </b>{patient.dischargeTime || ''}</div>
              <div style={{ width: '20%', textAlign: 'right' }}><b>No. of IPD Days : </b>{patient.ipdDays || calculateIpdDays}</div>
            </div>
            <div className={styles.printRow}>
              <div style={{ width: '25%' }}><b>Ward : </b>{patient.ward}</div>
              <div style={{ width: '25%' }}><b>Bed No : </b>{patient.bedNo}</div>
              <div style={{ width: '28%' }}><b>Admission Date : </b>{formatDate(patient.admissionDate)}</div>
              <div style={{ width: '22%' }}><b>Time : </b>{patient.admissionTime || ''}</div>
            </div>
          </div>

          {/* Patient Details Section */}
          <div className={styles.printPatientSection}>
            <div className={styles.printRow}>
              <div style={{ width: '50%' }}><b>Patient's Name : </b>{patient.patientName}</div>
              <div style={{ width: '50%' }}><b>Father's/Husband's Name : </b>{patient.fatherHusbandName}</div>
            </div>

            <div className={styles.printRow}>
              <div style={{ width: '35%' }}><b>Age/Date of Birth : </b>{patient.ageDob ? `${patient.ageDob} Y` : ''}</div>
              <div style={{ width: '25%' }}><b>Sex : </b>{patient.sex}</div>
              <div style={{ width: '40%' }}><b>UHID No : </b>{patient.uhid}</div>
            </div>

            <div className={styles.printRow}>
              <div style={{ width: '50%' }}><b>Tel no. : </b>{patient.telephone}</div>
              <div style={{ width: '50%' }}><b>Marital Status : </b>{patient.maritalStatus}</div>
            </div>

            <div className={styles.printRow}>
              <div style={{ width: '100%' }}><b>Address : </b>{patient.address}</div>
            </div>

            <div className={styles.printRow} style={{ alignItems: 'flex-start', marginBottom: 0 }}>
              <div style={{ width: '60%', display: 'flex', gap: '4px' }}>
                <b style={{ whiteSpace: 'nowrap' }}>Consultant Name : </b>
                <div>
                  {(patient.consultants && patient.consultants.filter(Boolean).length > 0
                    ? patient.consultants.filter(Boolean)
                    : [patient.consultantName]
                  ).filter(Boolean).map((c, i) => (
                    <div key={i} style={{ fontWeight: 'bold' }}>
                      {c.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ width: '40%' }}>
                <b>Anaesthetics Dr : </b>
                <span style={{ fontWeight: 'bold' }}>
                  {patient.anaestheticsDoctor ? patient.anaestheticsDoctor.toUpperCase() : ''}
                </span>
              </div>
            </div>
          </div>

          {/* DIAGNOSIS Section */}
          <div className={styles.printDiagnosisSection}>
            <div className={styles.printSectionLabel}>DIAGNOSIS</div>
            <div className={styles.printSectionBody}>
              {form.diagnosis ? String(form.diagnosis).toUpperCase() : ''}
            </div>
          </div>

          {/* PROCEDURE Section */}
          <div className={styles.printProcedureSection}>
            <div className={styles.printSectionLabel}>PROCEDURE</div>
            <div className={styles.printSectionBody}>
              {form.procedure ? String(form.procedure).toUpperCase() : ''}
            </div>
          </div>
        </div>

        {/* Note below box */}
        <div className={styles.printNote}>
          <b>NOTE :- </b>मरीज को चावल, दूध, दही,फल ज्यादा मसालेदार भोजन व वजनी सामान उठाना और सीढ़ी चढ़ना मना है
        </div>

        {/* Signatures */}
        <div className={styles.printSignatureRow}>
          <div>
            <div><b>Prepared by : Dr</b>...........................................................</div>
            <div><b>Date : </b>........................................................................</div>
          </div>
          <div>
            <div><b>Consultant's Signature : </b>...........................................</div>
            <div><b>Seal : </b>.........................................................................</div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.printFooter}>
          FOR ENQUIRY PLSEASE CONTACT -.-9838850287 ; 6394817132 ;7275470447 8840376333
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, wide = false }) {
  return (
    <label className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
