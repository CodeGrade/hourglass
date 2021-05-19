import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  ExamRubric,
  Rubric,
  RubricPresets,
  Preset,
  RubricAll,
  RubricOne,
  RubricAny,
} from '@professor/exams/types';
import { showExamViewer$data } from '@proctor/registrations/show/__generated__/showExamViewer.graphql';

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

type RawRubric = showExamViewer$data['rubrics'][number];
type RawRubricMap = Record<RawRubric['id'], RawRubric & { qnum?: number; pnum?: number; bnum?: number; }>;
type RawPreset = RawRubric['rubricPreset'];

function expandPreset(rawPreset: RawPreset): RubricPresets {
  if (rawPreset === null) { return null; }
  const {
    direction,
    label,
    mercy,
    presetComments,
    id,
  } = rawPreset;
  const ans : RubricPresets = {
    id,
    direction,
    presets: presetComments.map((c) => {
      const {
        // eslint-disable-next-line no-shadow
        id,
        // eslint-disable-next-line no-shadow
        label,
        graderHint,
        studentFeedback,
        points,
      } = c;
      // eslint-disable-next-line no-shadow
      const ans: Preset = {
        id,
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
    id,
    description,
    subsections,
    rubricPreset,
    points,
  } = rawRubric;
  switch (type) {
    case 'none': return { type, id };
    case 'all': {
      const ans : RubricAll = {
        type,
        id,
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
        id,
        choices: (
          expandPreset(rubricPreset)
           ?? subsections.map((s) => expandRubric(rubricsByID[s.id], rubricsByID))
        ),
      };
      if (description !== null) { ans.description = description; }
      return ans;
    }
    default:
      const qnum = rubricsByID[rawRubric.id].qnum;
      const pnum = rubricsByID[rawRubric.id].pnum;
      const bnum = rubricsByID[rawRubric.id].bnum;
      throw new ExhaustiveSwitchError(
        type,
        `showing rubric for q${qnum}-p${pnum}-b${bnum}`,
      );
  }
}

type ExamRubricTree = showExamViewer$data['dbQuestions'];

function convertRubric(rawRubrics : readonly RawRubric[], qTree: ExamRubricTree): ExamRubric {
  const rubric: ExamRubric = {
    questions: [],
    examRubric: {
      type: 'none',
      id: 'not-set',
    },
  };
  const rubricsByID: RawRubricMap = { };
  rawRubrics.forEach((r) => { rubricsByID[r.id] = {...r, qnum: null, pnum: null, bnum: null}; });
  // const qpbById = {};
  qTree.forEach((q, qnum) => {
    q.rubrics.forEach(({ id }) => {
      rubricsByID[id].qnum = qnum;
    });
    // qpbById[q.id] = qnum;
    q.parts.forEach((p, pnum) => {
      // qpbById[p.id] = pnum;
      p.rubrics.forEach(({ id }) => {
        rubricsByID[id].pnum = pnum;
      });
      p.bodyItems.forEach((b, bnum) => {
        // qpbById[b.id] = bnum;
        b.rubrics.forEach(({ id }) => {
          rubricsByID[id].bnum = bnum;
        });
      });
    });
  });
  const rubricCopy = [...rawRubrics];
  rubricCopy.sort((r1, r2) => {
    const compParent = nullStrComp(r1.parentSectionId, r2.parentSectionId);
    if (compParent !== 0) return compParent;
    return nullNumComp(r1.order, r2.order);
  });
  rawRubrics.forEach((r) => {
    if (r.parentSectionId !== null) return; // only process roots
    const qnum = rubricsByID[r.id].qnum;
    const pnum = rubricsByID[r.id].pnum;
    const bnum = rubricsByID[r.id].bnum;
    if (qnum === null) {
      rubric.examRubric = expandRubric(r, rubricsByID);
    } else {
      if (rubric.questions[qnum] === undefined) {
        rubric.questions[qnum] = {
          id: qTree[qnum].id,
          parts: [],
          questionRubric: {
            type: 'none',
            id: 'not-set',
          },
        };
      }
      const byQ = rubric.questions[qnum];
      if (pnum === null) {
        byQ.questionRubric = expandRubric(r, rubricsByID);
      } else {
        if (byQ.parts[pnum] === undefined) {
          byQ.parts[pnum] = {
            id: qTree[qnum].parts[pnum].id,
            body: [],
            partRubric: {
              type: 'none',
              id: 'not-set',
            },
          };
        }
        const byP = byQ.parts[pnum];
        if (bnum === null) {
          byP.partRubric = expandRubric(r, rubricsByID);
        } else if (r.parentSectionId === null) {
          byP.body[bnum] = {
            id: qTree[qnum].parts[pnum].bodyItems[bnum].id,
            rubric: expandRubric(r, rubricsByID),
          };
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
