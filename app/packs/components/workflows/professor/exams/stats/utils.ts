import { RubricPresetHistograms$data } from './__generated__/RubricPresetHistograms.graphql';

export type RechartPayload<T> = {
  payload: T,
  fill: string,
  color: string,
  name: string,
  value: number,
}

export type PresetUsageData = {
  key: 'placeholder',
} | {
  key: 'none',
} | {
  key: Exclude<string, 'placeholder'>,
  'Preset default': number,
  'Edited points': number,
  'Edited message': number,
  Customized: number,
  Total: number,
};

export type GradingCommentList = RubricPresetHistograms$data['registrations'][number]['allGradingComments'];
export type GradingComment = GradingCommentList[number];

export const colors = [
  'steelblue', 'maroon', 'gold', 'seagreen', 'orange', 'indigo',
  'dodgerblue', 'firebrick', 'goldenrod', 'mediumseagreen', 'sandybrown', 'darkmagenta',
];
