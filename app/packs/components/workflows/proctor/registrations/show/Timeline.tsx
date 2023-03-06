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

/**
 * Constructs a palette of evenly-spaced colors around the color wheel,
 * with a predetermined number of colors and numbers of shades per color.
 * To ensure that consecutive hues are as widely spaced as possible, instead of
 * choosing colors `[0,1,2,3,4]*72deg` around the circle, we go in steps of two,
 * producing `[0,2,4,1,3]*72deg`.  When we are requested to produce an even number
 * of colors, we'll round up to the nearest odd number to select the hue separation.
 * So, a four-color palette would be `[0,2,4,1]*72deg` as well.  Lastly, to avoid
 * choosing pure red/green/blue hues, we assume at least 5 colors.
 *
 * To produce the shades of individual colors, we likewise vary the brightness
 * and hue of each base color around a circle centered at the base color.  So, to
 * produce e.g. 5 shades of a color, we'd conceptually produce `sin([0,1,2,3,4]*72deg)
 * variations in brightness and hue.  To ensure that no two brightnesses or hue shifts
 * are identical, we break the symmetry.  Since sin(2*72deg)=sin(3*72deg), we need to
 * offset by a bit.  We can't use 0.5, since that would make sin(0.5*72deg)=sin(4.5*72deg).
 * Instead we offset by 0.25, which creates `sin([0.25,1.25,2.25,3.25,4.25]*72deg)`, which
 * are all unique.
 */
class Palette {
  #numShades: number[];

  #saturation: number;

  #luminanceVariance: number;

  #hueVariance: number;

  #hueOffset: number;

  static saturation = 0.65;

  static fullColorLuminance = 0.5;

  static luminanceVariance = 0.5;

  static hueVariance = 10;

  constructor(
    numShadesPerColor: number[],
    colorParams?: {
      hueOffset?: number,
      saturation?: number,
      luminanceVariance?: number,
      hueVariance?: number,
    },
  ) {
    const {
      hueOffset = 0,
      saturation = Palette.saturation,
      luminanceVariance = Palette.luminanceVariance,
      hueVariance = Palette.hueVariance,
    } = colorParams ?? {};
    this.#numShades = [...numShadesPerColor];
    this.#hueOffset = hueOffset;
    this.#saturation = saturation;
    this.#luminanceVariance = luminanceVariance;
    this.#hueVariance = hueVariance;
  }

  static #oddAbove(n: number): number {
    return n + (1 - (n % 2));
  }

  get(colorNum?: number, variantNum?: number): d3.ColorCommonInstance {
    if (colorNum === undefined) { return d3.gray(50); }
    // Note: we need an odd number so that when we divide the color wheel into sections,
    // consecutive color numbers can be spaced 2 sections apart (for greater contrast)
    // without any repetition. (E.g. for 4 colors or 5 colors, we want to
    // use angles mod 360 degrees of [0, 72*2, 72*4, 72, 72*3].)
    const hueAngle = (360 / Palette.#oddAbove(Math.max(5, this.#numShades.length)));
    const hue = d3.hsl(
      (this.#hueOffset + (colorNum % this.#numShades.length) * 2 * hueAngle) % 360,
      this.#saturation,
      Palette.fullColorLuminance,
    );
    if (variantNum === undefined) {
      return hue;
    }
    const numShadesForColor = this.#numShades[colorNum % this.#numShades.length];
    const varianceAngle = (360 / Palette.#oddAbove(numShadesForColor));
    // Since we're evenly spaced around the unit circle, and are therefore symmetric,
    // to break the symmetry we can't add 0.5 to the variant num, since that just trades
    // the parity of which values are equal.  Instead we add 0.25, which prevents
    // pairs of variantNums from aligning around the circle, thereby ensuring all variants
    // are distinct
    const varAngle = (((variantNum + 0.25) % numShadesForColor) * varianceAngle) % 360;
    hue.h += this.#hueVariance * Math.sin(varAngle * (Math.PI / 180));
    return hue.brighter(this.#luminanceVariance * Math.cos(varAngle * (Math.PI / 180)));
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
  const palette = useMemo(() => new Palette([3, 2, 5], { hueOffset: 30 }), [startTime]);
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
