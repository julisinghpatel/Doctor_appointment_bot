import React from "react";
import styles from "./DocumentFilters.module.css";

const DOCUMENT_TYPES = [
  {
    value: "",
    label: "All Documents",
  },
  {
    value: "PRESCRIPTION",
    label: "Prescription",
  },
  {
    value: "HOSPITAL_BILL",
    label: "Hospital Bill",
  },
  {
    value: "DISCHARGE_SUMMARY",
    label: "Discharge Summary",
  },
];

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All Status",
  },
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "FINAL",
    label: "Final",
  },
  {
    value: "PAID",
    label: "Paid",
  },
  {
    value: "PARTIAL",
    label: "Partially Paid",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

const SORT_OPTIONS = [
  {
    value: "createdAt-desc",
    label: "Newest First",
  },
  {
    value: "createdAt-asc",
    label: "Oldest First",
  },
  {
    value: "patientName-asc",
    label: "Patient A-Z",
  },
  {
    value: "patientName-desc",
    label: "Patient Z-A",
  },
];

const DocumentFilters = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleChange = (event) => {
    const { name, value } = event.target;

    onChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <section className={styles.container}>
      <div className={styles.searchWrapper}>
        <label htmlFor="document-search" className={styles.label}>
          Search
        </label>

        <div className={styles.searchBox}>
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            id="document-search"
            type="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search UHID, patient name or document no."
            autoComplete="off"
          />
        </div>
      </div>

      <div className={styles.filtersGrid}>
        <div className={styles.field}>
          <label htmlFor="document-type">Document Type</label>

          <select
            id="document-type"
            name="documentType"
            value={filters.documentType}
            onChange={handleChange}
          >
            {DOCUMENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="document-status">Status</label>

          <select
            id="document-status"
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="date-from">From Date</label>

          <input
            id="date-from"
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="date-to">To Date</label>

          <input
            id="date-to"
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="document-sort">Sort By</label>

          <select
            id="document-sort"
            name="sort"
            value={filters.sort}
            onChange={handleChange}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.actionField}>
          <button
            type="button"
            onClick={onReset}
            className={styles.resetButton}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </section>
  );
};

export default DocumentFilters;