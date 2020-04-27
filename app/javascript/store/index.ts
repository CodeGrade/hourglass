import { createStore } from 'redux';
import { mainReducer } from '../reducers';
import { AnswerState, StatePath, Exam, Files, FileMap, ExamState } from '../types';
import { devToolsEnhancer } from 'redux-devtools-extension';

function createMap(files: Files): FileMap {
  const ret = {};
  for (const file of files) {
    switch (file.filedir) {
      case 'dir':
        ret[file.rel_path] = file;
        const children = createMap(file.nodes);
        Object.assign(ret, children);
        break;
      case 'file':
        ret[file.rel_path] = file;
        break;
      default:
        throw new Error("invalid file");
    }
  }
  return ret;
}

export const getAtPath = (state: ExamState, ...path: StatePath): AnswerState => {
  let ret = state;
  for (const elem of path) {
    ret = ret?.[elem];
  }
  return ret;
};

function initState(info: Exam, fmap: FileMap): ExamState {
  const ret = {};
  info.questions.forEach((q, qi) => {
    ret[qi] = {};
    q.parts.forEach((p, pi) => {
      ret[qi][pi] = {};
      p.body.forEach((b, bi) => {
        if (b.type == 'Code') {
          const f = fmap[b.initial];
          if (f?.filedir == 'file') {
            ret[qi][pi][bi] = f.contents;
          }
        }
      });
    })
  });
  return ret;
}

export function examStore(files: Files, info: Exam) {
  const fmap = createMap(files);
  const initialState = initState(info, fmap);
  return createStore(mainReducer, initialState, devToolsEnhancer({}));
}
