import React, { CSSProperties, useMemo, useState } from 'react';
import { AnswersState, ExamFile } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import {
  ExamContext,
  ExamViewerContext,
  ExamFilesContext,
} from '@hourglass/common/context';
import Scrubber from '@hourglass/common/Scrubber';
import { makeReadableDate } from '@hourglass/common/ReadableDate';
import { createMap } from '@student/exams/show/files';
import DisplayQuestions from '@student/registrations/show/DisplayQuestions';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import Scratch from '@student/exams/show/components/navbar/Scratch';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { DateTime } from 'luxon';
import { diff, flattenChangeset } from 'json-diff-ts';
import * as d3 from 'd3-color';

import { TimelineExamViewer$key } from './__generated__/TimelineExamViewer.graphql';

export type SnapshotsState = Array<{
  createdAt: string,
  answers: AnswersState,
}>
interface ExamTimelineViewerProps {
  version: TimelineExamViewer$key;
  snapshots?: SnapshotsState;
  startTime: DateTime,
  endTime: DateTime,
  refreshCodeMirrorsDeps?: React.DependencyList;
  registrationId?: string;
}

/// Constructs a 2d palette of colors.  Each core color (n, 0)
/// differs from its neighbors by a hue angle of the golden angle,
/// so as to maximize the differences among consecutive colors.
/// Each family of related colors (n, v) varies around the core color
/// in both hue and brightness.
class Palette {
  #lastHue: number;

  #palette: Map<number, d3.ColorCommonInstance>;

  #paletteVariants: Map<number, Map<number, d3.ColorCommonInstance>>;

  #lastShift: Map<number, number>;

  #variation: number;

  static goldenAngle = 2.399963229728653;

  constructor(seed: number, variation: number) {
    this.#lastHue = seed % (Math.PI * 2.0);
    this.#variation = variation;
    this.#palette = new Map();
    this.#paletteVariants = new Map();
    this.#lastShift = new Map();
  }

  static #hueToColor(hue: number): d3.ColorCommonInstance {
    const a = 40 * Math.cos(hue);
    const b = 40 * Math.sin(hue);
    return d3.lab(74, a, b);
  }

  get(colorNum: number, variantNum = 0): d3.ColorCommonInstance {
    if (!this.#palette.has(colorNum)) {
      this.#lastHue = (this.#lastHue + Palette.goldenAngle) % (Math.PI * 2.0);
      const color = Palette.#hueToColor(this.#lastHue);
      const newMap = new Map<number, d3.ColorCommonInstance>();
      newMap.set(variantNum, color);
      this.#palette.set(colorNum, color);
      this.#paletteVariants.set(colorNum, newMap);
      this.#lastShift.set(colorNum, 0);
    }
    const colorMap = this.#paletteVariants.get(colorNum);
    if (!colorMap.has(variantNum)) {
      do {
        const lastShift = (this.#lastShift.get(colorNum) + Palette.goldenAngle) % (Math.PI * 2.0);
        this.#lastShift.set(colorNum, lastShift);
        const baseColor = this.#palette.get(colorNum);
        const color = d3.hsl(baseColor);
        color.h += this.#variation * Math.sin(lastShift);
        // Note: *2 - 0.75 is deliberately asymmetric, since darker colors are drastically darker
        // and lighter colors are only somewhat lighter.  But this still may saturate to white,
        // so loop until it avoids white
        const finalColor = color.brighter(this.#variation * (Math.cos(lastShift) * 2.0 - 0.75));
        colorMap.set(variantNum, finalColor);
      } while (colorMap.get(variantNum).hex() === '#ffffff');
    }
    return colorMap.get(variantNum);
  }
}

function makeStripes(palette: Palette, scratch: boolean, nums: Set<number>): CSSProperties {
  const colors: d3.ColorCommonInstance[] = [];
  if (scratch) {
    colors.push(d3.gray(50));
  }
  nums.forEach((c) => colors.push(palette.get(c)));
  const size = 10;
  const usedColors = colors.map((c, index) => `${c.hex()} ${index > 0 ? `${size * index}px` : ''}, ${c.hex()} ${size * (index + 1)}px`);
  const stripes = `repeating-linear-gradient(135deg, ${usedColors.join(', ')})`;
  return { backgroundImage: stripes };
}

const ExamTimelineViewer: React.FC<ExamTimelineViewerProps> = (props) => {
  const {
    version,
    snapshots,
    startTime,
    endTime,
    refreshCodeMirrorsDeps,
    registrationId,
  } = props;
  const res = useFragment(
    graphql`
    fragment TimelineExamViewer on ExamVersion {
      id
      ...DisplayQuestions
      defaultAnswers
      dbReferences {
        type
        path
      }
      instructions {
        type
        value
      }
      files
    }
    `,
    version,
  );
  const {
    instructions,
    defaultAnswers,
    dbReferences: references,
    files,
  } = res;
  const examContextVal = useMemo(() => ({
    files: files as ExamFile[],
    fmap: createMap(files as ExamFile[]),
  }), [files]);
  const palette = useMemo(() => new Palette(Math.random() * 50, 0.75), [startTime]);
  const timestamps = snapshots.map((s) => DateTime.fromISO(s.createdAt));
  const [curTimestamp, setCurTimestamp] = useState(timestamps[timestamps.length - 1]);
  const answersByTimestamp = Object.fromEntries(snapshots.map(({ createdAt, answers }) => (
    // NOTE: the .fromISO().toISO() isn't an identity function: it normalizes
    // timezones so that the frontend here doesn't depend on how Ruby supplied
    // the times
    [DateTime.fromISO(createdAt).toISO(), answers ?? defaultAnswers as AnswersState]
  )));
  const diffs = useMemo(() => snapshots.map(({ answers }, index) => flattenChangeset(diff(
    (index === 0 ? defaultAnswers : snapshots[index - 1].answers),
    answers,
  ))), [snapshots]);
  const changes = useMemo(() => diffs.map((d) => {
    const paths = d.map((change) => change.path);
    const scratch = paths.find((p) => p === 'scratch') !== undefined;
    const questions = new Set(paths.map((p) => Number(p.match(/answers\[(\d)\]/)[1])));
    const questionParts = [...questions].map((qnum) => {
      const qpaths = paths.filter((p) => p.match(`answers\\[${qnum}\\]`));
      const parts = qpaths.map((p) => Number(p.match(/answers\[\d\]\[(\d)\]/)[1]));
      return new Set(parts);
    });
    return { scratch, questions, parts: questionParts };
  }), [snapshots]);
  console.log(timestamps);
  console.log(changes);
  console.log(diffs);
  const answers = (curTimestamp
    ? answersByTimestamp[curTimestamp.toISO()]
    : defaultAnswers as AnswersState);
  const examViewerContextVal = useMemo(() => ({
    answers,
  }), [answers]);
  const examFilesContextVal = useMemo(() => ({
    references,
  }), [references]);
  return (
    <ExamContext.Provider value={examContextVal}>
      <ExamViewerContext.Provider value={examViewerContextVal}>
        <ExamFilesContext.Provider value={examFilesContextVal}>
          <table>
            {Array.from(Array(10).keys()).map((_, i) => (
              <tr>
                {Array.from(Array(10).keys()).map((_, v) => (
                  <td style={{ backgroundColor: palette.get(i, v).hex() }}>
                    {`colorNum ${i}, variant ${v} ${palette.get(i, v).hex()}`}
                  </td>
                ))}
              </tr>
            ))}
          </table>
          <div className="d-block w-100" style={{ height: '50px', overflow: 'visible' }}>
            <Scrubber
              min={startTime < timestamps[0] ? startTime : timestamps[0]}
              max={endTime > timestamps[timestamps.length - 1]
                ? endTime
                : timestamps[timestamps.length - 1]}
              val={curTimestamp ?? startTime}
              locater={(timestamp) => (timestamp?.toMillis() ?? 0)}
              pointsOfInterest={timestamps.map((ts, index) => ({
                val: ts,
                label: makeReadableDate(ts, true, true),
                style: makeStripes(palette, changes[index].scratch, changes[index].questions),
              }))}
              onChange={(_, time) => setCurTimestamp(time)}
            />
          </div>
          <div>
            <div>
              <span>Scratch space:</span>
              <Scratch
                value={answers.scratch}
                disabled
              />
            </div>
            {instructions && <HTML value={instructions} />}
            {references.length !== 0 && (
              <FileViewer
                refreshProps={refreshCodeMirrorsDeps}
                references={references}
              />
            )}
            <div>
              <DisplayQuestions
                refreshCodeMirrorsDeps={refreshCodeMirrorsDeps}
                version={res}
                registrationId={registrationId}
                fullyExpandCode
                overviewMode={false}
              />
            </div>
          </div>
        </ExamFilesContext.Provider>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

export default ExamTimelineViewer;
