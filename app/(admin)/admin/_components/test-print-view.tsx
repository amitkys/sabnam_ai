"use client";

import React from "react";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import { NormalizedQuestion } from "@/lib/question-parser";

interface TestPrintViewProps {
  testTitle: string;
  testDuration: number;
  totalMarks: number;
  totalQuestions: number;
  languages: string[];
  questions: NormalizedQuestion[];
  categoryPath?: string;
  testDescription?: string | null;
}

/**
 * Print-optimized test paper view.
 * Uses table thead/tfoot trick for consistent per-page margins
 * while @page margin:0 suppresses browser headers/footers.
 * Hidden on screen, rendered only for printing via react-to-print.
 */
export const TestPrintView = React.forwardRef<HTMLDivElement, TestPrintViewProps>(
  function TestPrintView(
    {
      testTitle,
      testDuration,
      totalMarks,
      totalQuestions,
      languages,
      questions,
      categoryPath,
      testDescription,
    },
    ref
  ) {
    const isBilingual =
      languages.includes("en") && languages.includes("hi");

    // Helper to normalize content and check equivalence between languages
    const normalizeForComparison = (str?: string | null): string => {
      if (!str) return "";
      return str
        .replace(/^#+\s*/gm, "") // remove markdown heading hashes like #####
        .replace(/\s+/g, " ")    // normalize whitespace
        .trim();
    };

    const areTextsEquivalent = (a?: string | null, b?: string | null): boolean => {
      const normA = normalizeForComparison(a);
      const normB = normalizeForComparison(b);
      if (!normA || !normB) return false;
      return normA === normB || normA.toLowerCase() === normB.toLowerCase();
    };

    const sanitizeOptionText = (text?: string | null): string => {
      if (!text) return "";
      // Escape leading '#' so react-markdown doesn't swallow it as an empty ATX heading
      return text.replace(/(^|\n)(\s*)(#+)/g, (_m, p1, p2, p3) => `${p1}${p2}\\${p3}`);
    };



    // Build section boundaries for headings and end dividers
    interface SectionBoundary {
      sectionName: string;
      letter: string;
      start: number; // 1-based
      end: number;   // 1-based
      title: string;
    }

    const buildSectionDisplayTitle = (
      rawName: string,
      secIdx: number,
      start: number,
      end: number
    ): { letter: string; title: string } => {
      const letter = String.fromCharCode(65 + (secIdx % 26));
      const match = rawName.match(/^section\s+([a-z0-9]+)\s*[-:]?\s*(.*)$/i);
      const effectiveLetter = match?.[1] ? match[1].toUpperCase() : letter;
      const subject = match ? (match[2] ? match[2].trim() : "") : rawName;
      const title = subject
        ? `Section ${effectiveLetter} - ${subject} (${start}-${end})`
        : `Section ${effectiveLetter} (${start}-${end})`;
      return { letter: effectiveLetter, title };
    };

    const sectionBoundaries: SectionBoundary[] = [];
    let currentSec = "";
    let currentStart = 1;

    for (let i = 0; i < questions.length; i++) {
      const sec = questions[i].section?.trim() || "";
      if (i === 0) {
        currentSec = sec;
        currentStart = 1;
      } else if (sec !== currentSec) {
        if (currentSec) {
          const { letter, title } = buildSectionDisplayTitle(
            currentSec,
            sectionBoundaries.length,
            currentStart,
            i
          );
          sectionBoundaries.push({
            sectionName: currentSec,
            letter,
            start: currentStart,
            end: i,
            title,
          });
        }
        currentSec = sec;
        currentStart = i + 1;
      }
    }

    if (currentSec) {
      const { letter, title } = buildSectionDisplayTitle(
        currentSec,
        sectionBoundaries.length,
        currentStart,
        questions.length
      );
      sectionBoundaries.push({
        sectionName: currentSec,
        letter,
        start: currentStart,
        end: questions.length,
        title,
      });
    }

    return (
      <div ref={ref} className="test-print-root">
        {/* Inline print styles */}
        <style>{`
          .test-print-root {
            display: none;
          }

          @media print {
            .test-print-root {
              display: block !important;
              background: white;
              color: black;
            }

            /*
             * BROWSER HEADER/FOOTER SUPPRESSION TECHNIQUE
             * ============================================
             * Problem: Browsers auto-insert header (page title, URL) and footer
             * (page number, date) in the @page margin area when printing.
             * Setting @page { margin: 15mm } gives nice per-page margins but
             * also brings back these browser-generated texts.
             *
             * Solution: @page { margin: 0 } removes the margin area entirely,
             * which kills the browser header/footer since there's no space for it.
             *
             * But then we lose per-page margins... so we use the TABLE TRICK:
             * - Wrap content in a <table> with an empty <thead> and <tfoot>
             * - thead has display:table-header-group → repeats on TOP of every page
             * - tfoot has display:table-footer-group → repeats on BOTTOM of every page
             * - These contain empty divs with fixed height (15mm) acting as margins
             * - The <td> padding provides left/right margins
             *
             * Result: No browser text, consistent margins on every printed page.
             */
            @page {
              margin: 0;
            }

            /* Table layout for repeating per-page margins (see technique above) */
            .print-table {
              width: 100%;
              border-collapse: collapse;
              font-family: 'Times New Roman', 'Noto Serif Devanagari', serif;
              color: #000;
              background: #fff;
              font-size: 11pt;
              line-height: 1.5;
            }

            .print-table td {
              padding: 0 15mm;
            }

            /* Repeating spacer on every page top (acts as top margin) */
            .print-margin-top {
              height: 15mm;
            }

            /* Repeating spacer on every page bottom (acts as bottom margin) */
            .print-margin-bottom {
              height: 15mm;
            }

            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }

            /* Question block */
            .print-question {
              margin-bottom: 14pt;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            /* Q.number + question text on same line */
            .print-question-row {
              display: flex;
              align-items: flex-start;
              gap: 4pt;
              margin-bottom: 2pt;
            }

            .print-question-row .q-num {
              font-weight: 800;
              font-size: 11pt;
              white-space: nowrap;
              flex-shrink: 0;
              min-width: 30pt;
            }

            .print-question-row .print-question-text {
              flex: 1;
              font-size: 11pt;
              line-height: 1.5;
            }

            .print-question-marks {
              font-size: 8pt;
              font-weight: 600;
              color: #555;
              white-space: nowrap;
              flex-shrink: 0;
              margin-left: auto;
              padding-left: 6pt;
            }

            /* Language section inside a question */
            .print-lang-section {
              margin-bottom: 6pt;
            }

            .print-lang-label {
              font-size: 8pt;
              font-weight: 700;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5pt;
              margin-bottom: 2pt;
              margin-left: 30pt;
              border-bottom: 0.5pt dashed #ccc;
              padding-bottom: 1pt;
            }

            .print-question-text h5 {
              font-size: 11pt;
              font-weight: 600;
              margin: 0;
            }

            .print-question-text p {
              margin: 2pt 0;
            }

            /* English translation line below Hindi question */
            .print-english-line {
              margin-left: 34pt;
              margin-top: 1pt;
              margin-bottom: 4pt;
              font-size: 11pt;
              line-height: 1.5;
            }

            .print-english-line h5 {
              font-size: 11pt;
              font-weight: 600;
              margin: 0;
            }

            .print-english-line p {
              margin: 2pt 0;
            }

            /* Options list (vertical) */
            .print-options-list {
              margin-top: 4pt;
              margin-left: 34pt;
            }

            .print-option {
              display: flex;
              align-items: flex-start;
              gap: 4pt;
              font-size: 10.5pt;
              line-height: 1.4;
              margin-bottom: 2pt;
            }

            .print-option-label {
              font-weight: 700;
              min-width: 16pt;
              flex-shrink: 0;
            }

            .print-option-text {
              flex: 1;
              display: flex;
              align-items: baseline;
              flex-wrap: wrap;
            }

            .print-option-text p,
            .print-option-text h1,
            .print-option-text h2,
            .print-option-text h3,
            .print-option-text h4,
            .print-option-text h5,
            .print-option-text h6,
            .print-option-text div {
              margin: 0;
              display: inline;
            }

            .print-option-separator {
              margin: 0 3pt;
              color: #444;
            }

            /* KaTeX overrides for print */
            .katex {
              font-size: 1em !important;
            }

            .katex-display {
              margin: 4pt 0 !important;
            }


            /* Section title (no top or bottom horizontal lines) */
            .print-section-title {
              text-align: center;
              font-size: 12pt;
              font-weight: 700;
              margin: 14pt 0 10pt 0;
              page-break-after: avoid;
              break-after: avoid;
            }

            /* Horizontal line after section questions finish */
            .print-section-divider {
              border-bottom: 1pt solid #000;
              margin: 14pt 0 16pt 0;
              width: 100%;
            }
          }
        `}</style>

        {/* Table layout: thead/tfoot repeat on every page as margins */}
        <table className="print-table">
          <thead>
            <tr><td><div className="print-margin-top" /></td></tr>
          </thead>
          <tfoot>
            <tr><td><div className="print-margin-bottom" /></td></tr>
          </tfoot>
          <tbody>
            <tr>
              <td>


                {/* Questions */}
                {questions.map((q, idx) => {
                  const qNum = idx + 1;
                  const boundaryStart = sectionBoundaries.find((b) => b.start === qNum);
                  const boundaryEnd = sectionBoundaries.find((b) => b.end === qNum);

                  return (
                    <React.Fragment key={idx}>
                      {boundaryStart && (
                        <div
                          className="print-section-title"
                          style={{ marginTop: idx > 0 ? "16pt" : "10pt" }}
                        >
                          {boundaryStart.title}
                        </div>
                      )}
                      <div className="print-question">
                        {isBilingual ? (
                          <>
                            {(() => {
                              const hiContent = q.content.hi?.trim();
                              const enContent = q.content.en?.trim();
                              const hasBoth = Boolean(hiContent && enContent);
                              const areSame = hasBoth && areTextsEquivalent(hiContent, enContent);
                              const primaryContent = hiContent || enContent || "";
                              const showEnglishLine = hasBoth && !areSame;

                              return (
                                <>
                                  {/* Primary question text (Hindi if available, else English) */}
                                  <div className="print-question-row">
                                    <span className="q-num">Q.{idx + 1}</span>
                                    <div className="print-question-text">
                                      <MarkdownRenderer
                                        content={primaryContent}
                                        variant="question"
                                      />
                                    </div>
                                  </div>

                                  {/* English question below, indented — ONLY IF DIFFERENT from Hindi */}
                                  {showEnglishLine && (
                                    <div className="print-english-line">
                                      <MarkdownRenderer
                                        content={enContent!}
                                        variant="question"
                                      />
                                    </div>
                                  )}
                                </>
                              );
                            })()}

                            {/* Options: (A) hindi / english — vertical list */}
                            {q.options.length > 0 && (
                              <div className="print-options-list">
                                {q.options.map((opt) => {
                                  const hiOpt = opt.text.hi?.trim();
                                  const enOpt = opt.text.en?.trim();
                                  const hasBothOpts = Boolean(hiOpt && enOpt);
                                  const areOptsSame = hasBothOpts && areTextsEquivalent(hiOpt, enOpt);
                                  const primaryOpt = hiOpt || enOpt || "";
                                  const showEnglishOpt = hasBothOpts && !areOptsSame;

                                  return (
                                    <div key={opt.id} className="print-option">
                                      <span className="print-option-label">
                                        ({opt.id})
                                      </span>
                                      <span className="print-option-text">
                                        <MarkdownRenderer
                                          content={sanitizeOptionText(primaryOpt)}
                                          variant="option"
                                        />
                                        {/* Show english only if different from hindi */}
                                        {showEnglishOpt && (
                                          <>
                                            <span className="print-option-separator">/</span>
                                            <MarkdownRenderer
                                              content={sanitizeOptionText(enOpt)}
                                              variant="option"
                                            />
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          /* Single language */
                          <div className="print-lang-section">
                            <div className="print-question-row">
                              <span className="q-num">Q.{idx + 1}</span>
                              <div className="print-question-text">
                                <MarkdownRenderer
                                  content={
                                    q.content[
                                      languages.includes("hi") ? "hi" : "en"
                                    ] || q.content.en || ""
                                  }
                                  variant="question"
                                />
                              </div>
                              <span className="print-question-marks">
                                [+{q.positiveMarks}
                                {q.negativeMarks > 0 ? ` / -${q.negativeMarks}` : ""}
                                {" "}mark{q.positiveMarks !== 1 ? "s" : ""}]
                              </span>
                            </div>
                            {q.options.length > 0 && (
                              <div className="print-options-list">
                                {q.options.map((opt) => (
                                  <div key={opt.id} className="print-option">
                                    <span className="print-option-label">
                                      ({opt.id})
                                    </span>
                                    <span className="print-option-text">
                                      <MarkdownRenderer
                                        content={sanitizeOptionText(
                                          opt.text[
                                            languages.includes("hi") ? "hi" : "en"
                                          ] || opt.text.en || ""
                                        )}
                                        variant="option"
                                      />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Numerical/Integer answer placeholder */}
                      {q.options.length === 0 && (
                        <div
                          style={{
                            marginLeft: "24pt",
                            marginTop: "4pt",
                            fontSize: "10pt",
                            fontStyle: "italic",
                            color: "#555",
                          }}
                        >
                          Answer: _______________
                        </div>
                      )}
                    </div>

                    {boundaryEnd && (
                      <div className="print-section-divider" />
                    )}
                  </React.Fragment>
                );
              })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);
