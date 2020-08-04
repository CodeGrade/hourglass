import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { admin_version$data } from './__generated__/admin_version.graphql';
import {
  ExamRubric,
  Rubric,
  RubricPresets,
  Preset,
  RubricAll,
  RubricOne,
  RubricAny,
} from './types';

const nullNumComp = (n1, n2) => {
  if (n1 === n2) return 0;
  if (n1 === null) return -1;
  if (n2 === null) return 1;
  return n1 - n2;
};
const nullStrComp = (s1, s2) => {
  if (s1 === s2) return 0;
  if (s1 === null) return -1;
  if (s2 === null) return 1;
  return (s1 < s2 ? -1 : 1);
};

type RawRubric = admin_version$data['rubrics'][number];
type RawRubricMap = Record<RawRubric['id'], RawRubric>;
type RawPreset = RawRubric['rubricPreset'];

function expandPreset(rawPreset: RawPreset): RubricPresets {
  if (rawPreset === null) { return null; }
  const {
    direction,
    label,
    mercy,
    presetComments,
  } = rawPreset;
  const ans : RubricPresets = {
    direction,
    presets: presetComments.map((c) => {
      const {
        // eslint-disable-next-line no-shadow
        label,
        graderHint,
        studentFeedback,
        points,
      } = c;
      // eslint-disable-next-line no-shadow
      const ans: Preset = {
        graderHint,
        points,
      };
      if (label !== null) { ans.label = label; }
      if (studentFeedback !== null) { ans.studentFeedback = studentFeedback; }
      return ans;
    }),
  };
  if (label !== null) { ans.label = label; }
  if (mercy !== null) { ans.mercy = mercy; }
  return ans;
}

function expandRubric(rawRubric : RawRubric, rubricsByID: RawRubricMap): Rubric {
  const {
    type,
    description,
    subsections,
    rubricPreset,
    points,
  } = rawRubric;
  switch (type) {
    case 'none': return { type };
    case 'all': {
      const ans : RubricAll = {
        type,
        choices: (
          expandPreset(rubricPreset)
           ?? subsections.map((s) => expandRubric(rubricsByID[s.id], rubricsByID))
        ),
      };
      if (description !== null) { ans.description = description; }
      return ans;
    }
    case 'any':
    case 'one': {
      const ans : RubricAny | RubricOne = {
        type,
        points,
        choices: (
          expandPreset(rubricPreset)
           ?? subsections.map((s) => expandRubric(rubricsByID[s.id], rubricsByID))
        ),
      };
      if (description !== null) { ans.description = description; }
      return ans;
    }
    default:
      throw new ExhaustiveSwitchError(
        type,
        `showing rubric for q${rawRubric.qnum}-p${rawRubric.pnum}-b${rawRubric.bnum}`,
      );
  }
}

function convertRubric(rawRubrics : readonly RawRubric[]): ExamRubric {
  const rubric : ExamRubric = {
    questions: [],
  };
  const rubricCopy = [...rawRubrics];
  const rubricsByID : RawRubricMap = { };
  rawRubrics.forEach((r) => { rubricsByID[r.id] = r; });
  rubricCopy.sort((r1 : RawRubric, r2 : RawRubric) => {
    const compParent = nullStrComp(r1.parentSectionId, r2.parentSectionId);
    if (compParent !== 0) return compParent; // Roots first
    const compQ = nullNumComp(r1.qnum, r2.qnum);
    if (compQ !== 0) return compQ; // Then by question,
    const compP = nullNumComp(r1.pnum, r2.pnum);
    if (compP !== 0) return compP; // by part,
    const compB = nullNumComp(r1.bnum, r2.bnum);
    if (compB !== 0) return compB; // by body,
    return nullNumComp(r1.order, r2.order); // and finally ordered within body
  });
  rawRubrics.forEach((r) => {
    if (r.parentSectionId !== null) return; // only process roots
    if (r.qnum === null) {
      rubric.examRubric = expandRubric(r, rubricsByID);
    } else {
      if (rubric.questions[r.qnum] === undefined) {
        rubric.questions[r.qnum] = {
          parts: [],
        };
      }
      const byQ = rubric.questions[r.qnum];
      if (r.pnum === null) {
        byQ.questionRubric = expandRubric(r, rubricsByID);
      } else {
        if (byQ.parts[r.pnum] === undefined) {
          byQ.parts[r.pnum] = {
            body: [],
          };
        }
        const byP = byQ.parts[r.pnum];
        if (r.bnum === null) {
          byP.partRubric = expandRubric(r, rubricsByID);
        } else if (r.parentSectionId === null) {
          byP.body[r.bnum] = expandRubric(r, rubricsByID);
        }
      }
    }
  });
  return rubric;
}

export default convertRubric;

export function deepDiff(v1 : unknown, v2 : unknown): unknown {
  if (v1 === v2) return undefined;
  if (v1 instanceof Array && v2 instanceof Array) {
    // if (v1.length !== v2.length) {
    //   return `Lengths differ: v1.length = ${v1.length}, v2.length = ${v2.length}`;
    // }
    const diffs = [];
    for (let i = 0; i < v1.length; i += 1) {
      const diff = deepDiff(v1[i], v2[i]);
      if (diff !== undefined) {
        diffs[i] = diff;
      }
      if (diffs.length === 0) return undefined;
      return diffs;
    }
  }
  if (v1 instanceof Object && v2 instanceof Object) {
    const keys1: string[] = Object.keys(v1);
    const keys2: string[] = Object.keys(v2);
    if (keys1.length !== keys2.length || keys1.some((k1) => !keys2.includes(k1))) {
      return `Keysets differ: v1.keys = ${keys1} v2.keys = ${keys2}`;
    }
    const diffs = {};
    keys1.forEach((k) => {
      const diff = deepDiff(v1[k], v2[k]);
      if (diff !== undefined) {
        diffs[k] = diff;
      }
    });
    if (Object.keys(diffs).length === 0) return undefined;
    return diffs;
  }
  return `Not equal: v1 is ${v1} and v2 is ${v2}`;
}
