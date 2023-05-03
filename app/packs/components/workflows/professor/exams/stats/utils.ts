import { RubricPresetHistograms } from './__generated__/RubricPresetHistograms.graphql';

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

export type GradingCommentConnection = RubricPresetHistograms['registrations'][number]['gradingComments'];
export type GradingComment = GradingCommentConnection['edges'][number]['node'];

export const colors = [
  'steelblue', 'maroon', 'gold', 'seagreen', 'orange', 'indigo',
  'dodgerblue', 'firebrick', 'goldenrod', 'mediumseagreen', 'sandybrown', 'darkmagenta',
];
