"use client";

export function PrintButton() {
  return (
    <button type="button" className="link-button" onClick={() => window.print()}>
      Print
    </button>
  );
}
