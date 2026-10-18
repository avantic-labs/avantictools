"use client";
import { useState } from "react";
import {
  calculatePercentage,
  type PercentageJob,
} from "@/lib/utilities/calculations";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
const jobs: Record<PercentageJob, string> = {
  of: "What is X% of Y?",
  ratio: "X is what percent of Y?",
  increase: "Increase a number by a percentage",
  decrease: "Decrease a number by a percentage",
  discount: "Find the discounted price",
};
const format = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 10 });
export function PercentageCalculator() {
  const [job, setJob] = useState<PercentageJob>("of");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [result, setResult] = useState<ReturnType<
    typeof calculatePercentage
  > | null>(null);
  const [error, setError] = useState("");
  function reset() {
    setResult(null);
    setError("");
  }
  function calculate(event: React.FormEvent) {
    event.preventDefault();
    trackUtilityEvent("percentage-discount-calculator", "tool_started");
    reset();
    try {
      if (!x.trim() || !y.trim()) throw new Error("Enter both numbers.");
      setResult(calculatePercentage(job, Number(x), Number(y)));
      trackUtilityEvent(
        "percentage-discount-calculator",
        "tool_completed",
        "calculate",
      );
    } catch (error) {
      trackUtilityEvent("percentage-discount-calculator", "tool_error", "invalid_input");
      setError(
        error instanceof RangeError ? error.message : "Enter both numbers.",
      );
    }
  }
  return (
    <div className="workspace-panel">
      <form onSubmit={calculate}>
        <label className="field">
          What do you want to calculate?
          <select
            aria-label="What do you want to calculate?"
            value={job}
            onChange={(event) => {
              setJob(event.target.value as PercentageJob);
              reset();
            }}
          >
            {Object.entries(jobs).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="paired-fields">
          <label className="field">
            {job === "ratio"
              ? "Part (X)"
              : job === "discount"
                ? "Discount (%)"
                : "Percentage (X%)"}
            <input
              type="number"
              step="any"
              value={x}
              onChange={(event) => {
                setX(event.target.value);
                reset();
              }}
            />
          </label>
          <label className="field">
            {job === "ratio"
              ? "Total (Y)"
              : job === "discount"
                ? "Original price"
                : "Number (Y)"}
            <input
              type="number"
              step="any"
              value={y}
              onChange={(event) => {
                setY(event.target.value);
                reset();
              }}
            />
          </label>
        </div>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button">
          Calculate
        </button>
      </form>
      {result && (
        <section
          className="result-panel"
          aria-label="Calculation result"
          role="status"
        >
          <h2>{job === "discount" ? "Final price" : "Result"}</h2>
          <p className="result-value">
            {format.format(result.result)}
            {job === "ratio" ? "%" : ""}
          </p>
          {result.saved !== undefined && (
            <p>Amount saved: {format.format(result.saved)}</p>
          )}
          <p className="hint">Displayed to a maximum of 10 decimal places.</p>
        </section>
      )}
    </div>
  );
}
