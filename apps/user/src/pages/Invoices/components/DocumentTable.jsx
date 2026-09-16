import React from "react";
import styles from "./DocumentTable.module.css";

const formatDocumentType = (type) => {
  const labels = {
    PRESCRIPTION: "Prescription",
    HOSPITAL_BILL: "Hospital Bill",
    DISCHARGE_SUMMARY: "Discharge Summary",
  };

  return labels[type] || type || "—";
};

const getStatusClass = (status) => {
  switch (status) {
    case "PAID":
      return styles.paid;

    case "PARTIAL":
      return styles.partial;

    case "FINAL":
      return styles.final;

    case "DRAFT":
      return styles.draft;

    case "CANCELLED":
      return styles.cancelled;

    default:
      return styles.defaultStatus;
  }
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) {
    return "—";
  }

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return "—";
  }

  return `₹${numericAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const DocumentTable = ({
  documents,
  loading,
  onView,
  onPrint,
}) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading hospital documents...</p>
      </div>
    );
  }

  if (!documents.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>⌕</div>

        <h3>No documents found</h3>

        <p>
          No prescriptions, hospital bills or discharge summaries
          match your current search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Document No.</th>
            <th>UHID</th>
            <th>Patient</th>
            <th>Document Type</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th className={styles.actionHeader}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>
                <span className={styles.documentNumber}>
                  {document.documentNumber || "—"}
                </span>
              </td>

              <td>
                <span className={styles.uhid}>
                  {document.uhid || "—"}
                </span>
              </td>

              <td>
                <div className={styles.patient}>
                  <span className={styles.patientName}>
                    {document.patientName || "Unknown Patient"}
                  </span>

                  {document.patientId && (
                    <span className={styles.patientId}>
                      Patient ID: {document.patientId}
                    </span>
                  )}
                </div>
              </td>

              <td>
                <span className={styles.documentType}>
                  {formatDocumentType(document.documentType)}
                </span>
              </td>

              <td>{formatDate(document.date)}</td>

              <td className={styles.amount}>
                {formatAmount(document.amount)}
              </td>

              <td>
                {document.status ? (
                  <span
                    className={`${styles.status} ${getStatusClass(
                      document.status
                    )}`}
                  >
                    {document.status}
                  </span>
                ) : (
                  "—"
                )}
              </td>

              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.viewButton}
                    onClick={() => onView(document)}
                  >
                    View
                  </button>

                  <button
                    type="button"
                    className={styles.printButton}
                    onClick={() => onPrint(document)}
                  >
                    Print
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentTable;