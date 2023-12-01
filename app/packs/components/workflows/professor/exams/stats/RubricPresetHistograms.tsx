import React, {
  Ref,
  RefObject,
  useMemo,
  useRef,
  useState,
} from 'react';
import { graphql, useFragment } from 'react-relay';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import { PartName } from '@student/exams/show/components/Part';
import { expandRootRubric } from '@professor/exams/rubrics';
import { nonEmptyRubric } from '@grading/UseRubrics';
import { iconForPoints, variantForPoints } from '@hourglass/workflows/grading';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Preset, Rubric } from '@professor/exams/types';
import { RubricPresetHistogramsUseRubrics$data, RubricPresetHistogramsUseRubrics$key } from './__generated__/RubricPresetHistogramsUseRubrics.graphql';
import {
  GradingComment,
  GradingCommentList,
  PresetUsageData,
  RechartPayload,
  colors,
} from './utils';
import { ShowLinks, RenderPreset } from './ShowLinks';
import CustomTooltip from './CustomTooltip';
import { RubricPresetHistograms$data, RubricPresetHistograms$key } from './__generated__/RubricPresetHistograms.graphql';

const RenderCommentHistograms: React.FC<{
  examId: string,
  qnum: number,
  pnum: number,
  bnum: number,
  singlePart: boolean,
  eRubricKey: RubricPresetHistogramsUseRubrics$key,
  qRubricKey: RubricPresetHistogramsUseRubrics$key,
  pRubricKey: RubricPresetHistogramsUseRubrics$key,
  bRubricKey: RubricPresetHistogramsUseRubrics$key,
  comments: RubricPresetHistograms$data['registrations'][number]['allGradingComments'][],
  registrations: RubricPresetHistograms$data['registrations'],
}> = (props) => {
  const {
    examId,
    qnum,
    pnum,
    bnum,
    singlePart,
    eRubricKey,
    qRubricKey,
    pRubricKey,
    bRubricKey,
    comments,
    registrations,
  } = props;
  return (
    <div>
      <RenderCommentHistogram
        examId={examId}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        singlePart={singlePart}
        rubric={eRubricKey}
        comments={comments}
        registrations={registrations}
      />
      <RenderCommentHistogram
        examId={examId}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        singlePart={singlePart}
        rubric={qRubricKey}
        comments={comments}
        registrations={registrations}
      />
      <RenderCommentHistogram
        examId={examId}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        singlePart={singlePart}
        rubric={pRubricKey}
        comments={comments}
        registrations={registrations}
      />
      <RenderCommentHistogram
        examId={examId}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        singlePart={singlePart}
        rubric={bRubricKey}
        comments={comments}
        registrations={registrations}
      />
    </div>
  );
};

function sortRubric(rubric: Rubric, ans: Preset[]): Preset[] {
  switch (rubric.type) {
    case 'all':
    case 'any':
    case 'one':
      if (rubric.choices instanceof Array) {
        rubric.choices.forEach((r) => sortRubric(r, ans));
      } else {
        ans.push(...rubric.choices.presets);
      }
      break;
    case 'none':
      break;
    default: throw new ExhaustiveSwitchError(rubric);
  }
  return ans;
}

function computePresets(
  comments: GradingCommentList[],
  qnum: number,
  pnum: number,
  bnum: number,
): {
  presets: Record<string, GradingComment['presetComment']>,
  byPresets: Record<string, {
    newPoints: GradingComment[],
    newMessage: GradingComment[],
    custom: GradingComment[],
    preset: GradingComment[],
  }>
} {
  const relevantComments = comments.flat().filter((node) => (
    node.qnum === qnum && node.pnum === pnum && node.bnum === bnum
  ));
  const byPresets: Record<string, {
    newPoints: GradingComment[],
    newMessage: GradingComment[],
    custom: GradingComment[],
    preset: GradingComment[],
  }> = {};
  const presets: Record<string, GradingComment['presetComment']> = {};
  relevantComments.forEach((comment) => {
    if (comment.presetComment) {
      presets[comment.presetComment.id] = comment.presetComment;
      byPresets[comment.presetComment.id] ??= {
        newPoints: [],
        newMessage: [],
        custom: [],
        preset: [],
      };
      const pointsChanged = comment.points !== comment.presetComment.points;
      const messageChanged = (
        comment.message !== comment.presetComment.graderHint
        && comment.message !== comment.presetComment.studentFeedback
      );
      if (pointsChanged && messageChanged) {
        byPresets[comment.presetComment.id].custom.push(comment);
      } else if (pointsChanged) {
        byPresets[comment.presetComment.id].newPoints.push(comment);
      } else if (messageChanged) {
        byPresets[comment.presetComment.id].newMessage.push(comment);
      } else {
        byPresets[comment.presetComment.id].preset.push(comment);
      }
    } else {
      byPresets.none ??= {
        newPoints: [],
        newMessage: [],
        custom: [],
        preset: [],
      };
      byPresets.none.custom.push(comment);
    }
  });
  return { presets, byPresets };
}

function computeBuckets(
  rawRubric: RubricPresetHistogramsUseRubrics$data,
  rubric: Rubric,
  byPresets: Record<string, {
    newPoints: GradingComment[],
    newMessage: GradingComment[],
    custom: GradingComment[],
    preset: GradingComment[],
  }>,
  presets: Record<string, GradingComment['presetComment']>,
) {
  const rubricPresetToRubricMap = new Map(
    rawRubric.allSubsections.map((s) => [s.rubricPreset?.id, s]),
  );
  const orderedRubricPresets = sortRubric(rubric, []);
  orderedRubricPresets.push({ id: 'none', graderHint: undefined, points: 0 });
  const buckets: PresetUsageData[] = Object.keys(byPresets).map((key) => {
    if (key === 'none') {
      return {
        key: 'none',
        'Preset default': 0,
        'Edited points': 0,
        'Edited message': 0,
        Customized: byPresets[key].custom.length,
        Total: byPresets[key].custom.length,
      };
    }
    return {
      key,
      'Preset default': byPresets[key].preset.length,
      'Edited points': byPresets[key].newPoints.length,
      'Edited message': byPresets[key].newMessage.length,
      Customized: byPresets[key].custom.length,
      Total: byPresets[key].preset.length
        + byPresets[key].newPoints.length
        + byPresets[key].newMessage.length
        + byPresets[key].custom.length,
    };
  });
  buckets.sort((p1, p2) => (
    orderedRubricPresets.findIndex((p) => p.id === p1.key)
    - orderedRubricPresets.findIndex((p) => p.id === p2.key)));
  for (let i = buckets.length - 1; i >= 1; i -= 1) {
    if (rubricPresetToRubricMap.get(presets[buckets[i].key]?.rubricPreset?.id)
      !== rubricPresetToRubricMap.get(presets[buckets[i - 1].key]?.rubricPreset?.id)) {
      buckets.splice(i, 0, { key: 'placeholder' });
    }
  }
  return buckets;
}

const RenderCommentHistogram: React.FC<{
  examId: string,
  qnum: number,
  pnum: number,
  bnum: number,
  singlePart: boolean,
  rubric: RubricPresetHistogramsUseRubrics$key,
  comments: GradingCommentList[],
  registrations: RubricPresetHistograms$data['registrations'],
}> = (props) => {
  const {
    examId,
    qnum,
    pnum,
    bnum,
    singlePart,
    rubric: rubricKey,
    comments,
    registrations,
  } = props;
  const rawRubric = useFragment<RubricPresetHistogramsUseRubrics$key>(
    graphql`
    fragment RubricPresetHistogramsUseRubrics on Rubric {
      id
      type
      order
      points
      description {
        type
        value
      }
      rubricPreset {
        id
        direction
        label
        mercy
        presetComments {
          id
          label
          order
          points
          graderHint
          studentFeedback
        }
      }
      subsections { id }
      allSubsections {
        id
        type
        order
        points
        description {
          type
          value
        }
        rubricPreset {
          id
          direction
          label
          mercy
          presetComments {
            id
            label
            order
            points
            graderHint
            studentFeedback
          }
        }
        subsections { id }
      }
    }
    `,
    rubricKey,
  );
  const gradingCommentToRegistrationMap = useMemo(() => new Map(
    registrations.flatMap((r) => r.allGradingComments.map((c) => [c.id, r.id])),
  ), [registrations]);
  const registrationsMap = useMemo(
    () => new Map(registrations.map((r) => [r.id, r])),
    [registrations],
  );
  const [frozenPos, setFrozenPos] = useState<{ x: number, y: number }>(undefined);
  const [tooltipPosFrozen, setTooltipPozFrozen] = useState(false);
  const [
    tooltipFrozenPayload,
    setTooltipFrozenPayload,
  ] = useState<RechartPayload<PresetUsageData>[]>(undefined);
  const [tooltipFrozenLabel, setTooltipFrozenLabel] = useState<string>(undefined);
  const tooltipRef = useRef<HTMLDivElement>(undefined);
  const chartRef = useRef<RefObject<HTMLDivElement>>(undefined);
  const rubric = expandRootRubric(rawRubric);
  const { presets, byPresets } = computePresets(comments, qnum, pnum, bnum);
  const buckets: PresetUsageData[] = computeBuckets(
    rawRubric,
    rubric,
    byPresets,
    presets,
  );
  const [linksComments, setLinksComments] = useState<{
    comment: GradingComment,
    registration: RubricPresetHistograms$data['registrations'][number],
  }[]>(undefined);
  const [showLinks, setShowLinks] = useState(false);
  const [linksTitle, setLinksTitle] = useState<string>('');
  const [linksPreset, setLinksPreset] = useState<PresetUsageData>(undefined);
  const onClickRow = (value: RechartPayload<PresetUsageData>) => {
    if ('Total' in value.payload) {
      let relevantComments: GradingComment[];
      switch (value.name as keyof (typeof value.payload)) {
        case 'Preset default':
          relevantComments = byPresets[value.payload.key].preset;
          break;
        case 'Edited points':
          relevantComments = byPresets[value.payload.key].newPoints;
          break;
        case 'Edited message':
          relevantComments = byPresets[value.payload.key].newMessage;
          break;
        case 'Customized':
          relevantComments = byPresets[value.payload.key].custom;
          break;
        default:
          return;
      }
      setLinksTitle(`${value.name} for`);
      setLinksComments(
        relevantComments.map((c) => ({
          comment: c,
          registration: registrationsMap.get(gradingCommentToRegistrationMap.get(c.id)),
        })),
      );
      setLinksPreset(value.payload);
      setShowLinks(true);
    }
  };
  if (nonEmptyRubric(rubric)) {
    return (
      <div className="w-100">
        {linksPreset && (
          <ShowLinks
            examId={examId}
            presetUsage={linksPreset}
            preset={presets[linksPreset.key]}
            comments={linksComments}
            title={linksTitle}
            show={showLinks}
            qnum={qnum}
            pnum={pnum}
            singlePart={singlePart}
            onClose={() => setShowLinks(false)}
          />
        )}
        <div
          className="w-50 d-inline-block align-top"
          style={{ marginTop: 2 }}
        >
          {buckets.map((value, index) => {
            const { graderHint, studentFeedback, points } = presets[value.key] ?? {
              points: 0,
            };
            const variant = variantForPoints(points);
            const VariantIcon = iconForPoints(points);
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`${value.key}-${index}`}
                className="px-0 mx-0"
                style={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  paddingTop: 2,
                  height: 40,
                }}
              >
                <RenderPreset
                  value={value}
                  points={points}
                  variant={variant}
                  VariantIcon={VariantIcon}
                  graderHint={graderHint}
                  studentFeedback={studentFeedback}
                />
              </div>
            );
          })}
        </div>
        <ResponsiveContainer
          // NOTE: See https://github.com/recharts/recharts/issues/3718#issuecomment-1836866079
          // for why this cast is currently needed
          ref={chartRef as unknown as Ref<HTMLDivElement>}
          className="d-inline-block p-0 m-0"
          width="50%"
          height={30 + (buckets.length * 40)} // 30 is axis default height
        >
          <BarChart
            data={buckets}
            layout="vertical"
            margin={{
              top: 0, bottom: 0, left: 5, right: 5,
            }}
            onMouseDown={(state, event: MouseEvent) => {
              if (event.target instanceof HTMLElement
                && tooltipRef.current.contains(event.target)) {
                return;
              }
              const rect = tooltipRef.current?.getBoundingClientRect();
              const parentRect = chartRef.current?.current?.getBoundingClientRect();
              if (!tooltipPosFrozen && rect && parentRect) {
                setFrozenPos({ x: rect.x - parentRect.x, y: rect.y - parentRect.y });
                setTooltipPozFrozen(true);
                setTooltipFrozenPayload(state.activePayload);
                setTooltipFrozenLabel(state.activeLabel);
              } else {
                setFrozenPos(undefined);
                setTooltipPozFrozen(false);
                setTooltipFrozenPayload(undefined);
                setTooltipFrozenLabel(undefined);
              }
            }}
          >
            <YAxis
              dataKey="key"
              type="category"
              width={2}
              interval={0}
              tick={false}
            />
            <XAxis type="number" />
            <Tooltip
              filterNull={!tooltipPosFrozen}
              cursor={false}
              animationDuration={0}
              position={frozenPos}
              content={(
                <CustomTooltip
                  frozenPos={tooltipPosFrozen}
                  frozenPayload={tooltipFrozenPayload}
                  frozenLabel={tooltipFrozenLabel}
                  innerRef={tooltipRef}
                  presets={presets}
                  onClickRow={onClickRow}
                />
              )}
              wrapperStyle={{ pointerEvents: 'auto' }}
            />
            <Bar dataKey="Preset default" stackId="a" fill={colors[0]} isAnimationActive={false} />
            <Bar dataKey="Edited points" stackId="a" fill={colors[1]} isAnimationActive={false} />
            <Bar dataKey="Edited message" stackId="a" fill={colors[8]} isAnimationActive={false} />
            <Bar dataKey="Customized" stackId="a" fill={colors[3]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return null;
};

const RenderRubricPresetHistograms: React.FC<{
  examId: string,
  examVersionKey: RubricPresetHistograms$key;
}> = (props) => {
  const { examId, examVersionKey } = props;
  const res = useFragment(
    graphql`
    fragment RubricPresetHistograms on ExamVersion {
      id
      rootRubric { ...RubricPresetHistogramsUseRubrics }
      dbQuestions {
        id
        name { type value }
        index
        rootRubric { ...RubricPresetHistogramsUseRubrics }
        parts {
          id
          name { type value }
          index
          rootRubric { ...RubricPresetHistogramsUseRubrics }
          bodyItems {
            id
            index
            rootRubric { ...RubricPresetHistogramsUseRubrics }
          }
        }
      }
      registrations {
        id
        user { 
          id
          displayName
        }
        allGradingComments {
          id
          points
          message
          qnum
          pnum
          bnum
          presetComment { 
            id
            order
            points
            graderHint
            studentFeedback
            rubricPreset {
              id
            }
          }
        }
      }
    }
    `,
    examVersionKey,
  );
  return (
    <>
      {res.dbQuestions.map((q) => {
        const singlePart = q.parts.length === 1 && !q.parts[0].name?.value?.trim();
        return (
          <div key={`q${q.index}`}>
            <b><QuestionName qnum={q.index} name={q.name} /></b>
            {q.parts.map((p) => (
              <div key={`q${q.index}-p${p.index}`}>
                <b><PartName anonymous={singlePart} pnum={p.index} name={p.name} /></b>
                {p.bodyItems.map((b) => (
                  <div key={`q${q.index}-p${p.index}-b${b.index}`}>
                    <RenderCommentHistograms
                      examId={examId}
                      qnum={q.index}
                      pnum={p.index}
                      bnum={b.index}
                      singlePart={singlePart}
                      eRubricKey={res.rootRubric}
                      qRubricKey={q.rootRubric}
                      pRubricKey={p.rootRubric}
                      bRubricKey={b.rootRubric}
                      comments={res.registrations.map((r) => r.allGradingComments)}
                      registrations={res.registrations}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};

export default RenderRubricPresetHistograms;
