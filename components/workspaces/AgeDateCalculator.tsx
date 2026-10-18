"use client";
import { useState } from "react";
import {
  calendarDifference,
  daysBetween,
  localToday,
  readableDate,
} from "@/lib/utilities/calculations";
import { trackUtilityEvent } from "@/lib/analytics/utilities";
type Mode = "age" | "difference" | "until" | "since";
function dateHint(value: string) {
  try {
    return readableDate(value);
  } catch {
    return "Choose a complete date from year 0100 to 9999.";
  }
}
export function AgeDateCalculator() {
  const [mode, setMode] = useState<Mode>("age");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState(localToday);
  const [result, setResult] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");
  function clearResult() {
    setResult("");
    setDetail("");
    setError("");
  }
  function calculate(event: React.FormEvent) {
    event.preventDefault();
    trackUtilityEvent("age-date-calculator", "tool_started");
    clearResult();
    try {
      if (mode === "age" || mode === "difference") {
        const value = calendarDifference(first, second);
        setResult(
          `${value.years} years, ${value.months} months, ${value.days} days`,
        );
        setDetail(
          `${value.totalDays.toLocaleString("en-NG")} days from ${readableDate(first)} to ${readableDate(second)}.`,
        );
      } else {
        const days =
          mode === "until"
            ? daysBetween(second, first)
            : daysBetween(first, second);
        setResult(
          `${Math.abs(days).toLocaleString("en-NG")} ${Math.abs(days) === 1 ? "day" : "days"}`,
        );
        setDetail(
          days === 0
            ? "Both dates are the same day."
            : mode === "until"
              ? days > 0
                ? `Until ${readableDate(first)}.`
                : `${readableDate(first)} was ${Math.abs(days).toLocaleString("en-NG")} days before the reference date.`
              : days > 0
                ? `Since ${readableDate(first)}.`
                : `${readableDate(first)} is ${Math.abs(days).toLocaleString("en-NG")} days after the reference date.`,
        );
      }
      trackUtilityEvent("age-date-calculator", "tool_completed", "calculate");
    } catch {
      trackUtilityEvent("age-date-calculator", "tool_error", "invalid_input");
      setError(
        "Choose valid dates. For age and date difference, the end date must be on or after the start date.",
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
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as Mode);
              clearResult();
            }}
          >
            <option value="age">Age from date of birth</option>
            <option value="difference">Difference between two dates</option>
            <option value="until">Days until a date</option>
            <option value="since">Days since a date</option>
          </select>
        </label>
        <label className="field">
          {mode === "age"
            ? "Date of birth"
            : mode === "difference"
              ? "Start date"
              : "Selected date"}
          <input
            aria-label={
              mode === "age"
                ? "Date of birth"
                : mode === "difference"
                  ? "Start date"
                  : "Selected date"
            }
            type="date"
            min="0100-01-01"
            max="9999-12-31"
            value={first}
            onChange={(event) => {
              setFirst(event.target.value);
              clearResult();
            }}
          />
          {first && <span className="hint">{dateHint(first)}</span>}
        </label>
        <label className="field">
          {mode === "age"
            ? "Age on"
            : mode === "difference"
              ? "End date"
              : "Reference date"}
          <input
            aria-label={
              mode === "age"
                ? "Age on"
                : mode === "difference"
                  ? "End date"
                  : "Reference date"
            }
            type="date"
            min="0100-01-01"
            max="9999-12-31"
            value={second}
            onChange={(event) => {
              setSecond(event.target.value);
              clearResult();
            }}
          />
          {second && <span className="hint">{dateHint(second)}</span>}
        </label>
        <p className="hint">
          Calendar days, independent of daylight-saving changes. Month
          anniversaries use the last valid day; 29 February becomes 28 February
          in non-leap years.
        </p>
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
          aria-label="Date result"
          role="status"
        >
          <h2>{mode === "age" ? "Age" : "Time between dates"}</h2>
          <p className="result-value">{result}</p>
          <p>{detail}</p>
        </section>
      )}
    </div>
  );
}
