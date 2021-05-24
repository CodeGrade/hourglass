import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  Rubric,
  RubricPresets,
  Preset,
  RubricAll,
  RubricOne,
  RubricAny,
} from '@professor/exams/types';
import { showExamViewer$data } from '@proctor/registrations/show/__generated__/showExamViewer.graphql';
import { RubricSingle$data } from './new/editor/__generated__/RubricSingle.graphql';

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
    default: {
      const { qnum } = rubricsByID[rawRubric.id];
      const { pnum } = rubricsByID[rawRubric.id];
      const { bnum } = rubricsByID[rawRubric.id];
      throw new ExhaustiveSwitchError(
        type,
        `showing rubric for q${qnum}-p${pnum}-b${bnum}`,
      );
    }
  }
}

type RawRootRubric = Omit<RubricSingle$data, ' $refType'>;

export function expandRootRubric(rawRubric : RawRootRubric): Rubric {
  const rubricsById: RawRubricMap = {};
  rawRubric.allSubsections.forEach((r) => { rubricsById[r.id] = r; });
  return expandRubric(rawRubric, rubricsById);
}

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
