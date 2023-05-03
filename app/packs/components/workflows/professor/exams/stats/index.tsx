import ErrorBoundary from '@hourglass/common/boundary';
import DocumentTitle from '@hourglass/common/documentTitle';
import React, {
  RefObject,
  Suspense,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as d3 from 'd3-array';
import {
  Alert,
  Button,
  Card,
  Collapse,
  Container, Table, ToggleButton, ToggleButtonGroup,
} from 'react-bootstrap';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import { PartName } from '@student/exams/show/components/Part';
import Icon from '@student/exams/show/components/Icon';
import { expandRootRubric } from '@professor/exams/rubrics';
import { nonEmptyRubric } from '@grading/UseRubrics';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { iconForPoints, variantForPoints } from '@hourglass/workflows/grading';
import { ExhaustiveSwitchError, pluralize } from '@hourglass/common/helpers';
import { Preset, Rubric } from '@professor/exams/types';
import { IconType } from 'react-icons';
import { RiMessage2Line } from 'react-icons/ri';
import { statsExamQuery } from './__generated__/statsExamQuery.graphql';
import { statsRubricHistograms, statsRubricHistograms$key } from './__generated__/statsRubricHistograms.graphql';
import { statsUseRubrics, statsUseRubrics$key } from './__generated__/statsUseRubrics.graphql';

type ExamVersion = statsExamQuery['response']['exam']['examVersions']['edges'][number]['node'];
type Registration = statsExamQuery['response']['exam']['registrations'][number];
function doBinning(binner, vals: number[]) {
  const ans = binner(vals);
  return ans.map((b) => ({
    count: b.length,
    values: b.map((v) => Math.round(v * 100) / 100),
    range: `${b.x0}-${b.x1}`,
    x0: b.x0,
    x1: b.x1,
  }));
}
const ExamStats: React.FC<{
  title?: string;
  examVersions: readonly ExamVersion[],
  registrations: readonly Registration[],
}> = (props) => {
  const {
    title,
    examVersions,
    registrations,
  } = props;
  const examVersionsMap = new Map(
    examVersions.map((v) => [v.id, v]),
  );
  const regsByVersion: Map<ExamVersion['id'], Registration[]> = new Map(
    Array.from(examVersionsMap.keys()).map(
      (id) => [id, registrations.filter((r) => r.examVersion.id === id && r.started)],
    ),
  );
  const statsByVersion: Record<ExamVersion['id'], number[][]> = {};
  examVersionsMap.forEach((version, id) => {
    const stats = [];
    version.qpPairs.forEach(({ qnum, pnum }, index) => {
      stats[index] = regsByVersion.get(id).map((r) => r.currentPartScores[qnum][pnum]);
    });
    statsByVersion[id] = stats;
  });
  return (
    <>
      <h1>{title ?? 'Nothing'}</h1>
      {examVersions.map((version) => (
        <RenderVersionStats
          key={version.id}
          version={version}
          stats={statsByVersion[version.id]}
          regs={regsByVersion.get(version.id)}
        />
      ))}
    </>
  );
};

const colors = [
  'steelblue', 'maroon', 'gold', 'seagreen', 'orange', 'indigo',
  'dodgerblue', 'firebrick', 'goldenrod', 'mediumseagreen', 'sandybrown', 'darkmagenta',
];

function round(n: number, numDigits: number) {
  return Math.round(n * 10 ** numDigits) / 10 ** numDigits;
}

const RenderStats: React.FC<{
  width?: string | number,
  height?: string | number,
  dataPoints: number[];
  minPoints: number,
  maxPoints: number,
  showAsPct: boolean,
  barColor?: string,
  showSummary?: boolean,
}> = (props) => {
  const {
    children,
    width,
    height,
    dataPoints,
    minPoints,
    maxPoints,
    showAsPct,
    barColor = colors[0],
    showSummary = false,
  } = props;
  const pct = dataPoints.map((v) => (100 * v) / Math.max(maxPoints, 1));
  const maxRaw = Math.max(minPoints + 1, maxPoints, ...dataPoints);
  const maxPct = maxPoints === 0 ? 0 : Math.max(100, ...pct);
  const maxVal = showAsPct ? maxPct : maxRaw;
  const minVal = showAsPct ? ((100 * minPoints) / Math.max(maxPoints, 1)) : minPoints;
  const numBars = showAsPct ? 20 : Math.min(20, maxPoints - minPoints);
  const binner = d3.bin().domain(d3.nice(minVal, maxVal, numBars)).thresholds(numBars);
  const data = showAsPct ? pct : dataPoints;
  const buckets = doBinning(binner, data);

  return (
    <>
      {showSummary && (
        <Table>
          <thead>
            <tr>
              <th>Min</th>
              <th>Mean</th>
              <th>Median</th>
              <th>Stdev</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{round(d3.min(data), 2)}</td>
              <td>{round(d3.mean(data), 2)}</td>
              <td>{round(d3.median(data), 2)}</td>
              <td>{round(d3.deviation(data), 2)}</td>
              <td>{round(d3.max(data), 2)}</td>
            </tr>
          </tbody>
        </Table>
      )}
      {children}
      <ResponsiveContainer
        className="clear-both"
        width={width}
        height={height}
      >
        <ComposedChart data={buckets}>
          <XAxis dataKey="range" hide />
          <XAxis dataKey="x0" scale="band" xAxisId="values" />
          <YAxis width={30} />
          <Tooltip
            filterNull
            cursor={false}
            animationDuration={0}
            itemStyle={{ color: 'black' }}
          />
          <Bar dataKey="count" fill={barColor} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
};

const RenderVersionStats: React.FC<{
  version: ExamVersion,
  regs: Registration[],
  stats: number[][],
}> = (props) => {
  const {
    version,
    stats,
    regs,
  } = props;
  const { qpPairs, dbQuestions } = version;
  const [showDetails, setShowDetails] = useState(false);
  const [showAsPct, setShowAsPct] = useState(true);
  const rawScores = [];
  const numPoints = d3.sum(
    dbQuestions.filter((q) => !q.extraCredit)
      .map((q) => q.parts.filter((p) => !p.extraCredit).map((p) => p.points))
      .flat(),
  );
  regs.forEach((r) => {
    const rawScore = d3.sum((r.currentPartScores as number[][]).flat());
    rawScores.push(rawScore);
  });
  rawScores.sort();
  return (
    <>
      <h2>{version.name}</h2>
      <h3>
        Scores for version
        <ToggleButtonGroup
          className="float-right bg-white rounded"
          name="pointsOrPercent"
          type="radio"
          value={showAsPct}
          onChange={() => setShowAsPct(!showAsPct)}
        >
          <ToggleButton
            variant={showAsPct ? 'primary' : 'outline-primary'}
            value="percent"
          >
            Percent
          </ToggleButton>
          <ToggleButton
            variant={(!showAsPct) ? 'primary' : 'outline-primary'}
            value="points"
          >
            Points
          </ToggleButton>
        </ToggleButtonGroup>
      </h3>
      <RenderStats
        width="100%"
        height={200}
        minPoints={0}
        maxPoints={numPoints}
        dataPoints={rawScores}
        showAsPct={showAsPct}
        barColor={colors[0]}
        showSummary
      >
        <h4><b>Grade distribution</b></h4>
      </RenderStats>
      <div>
        <h4 className="flex-grow-1">
          <span
            role="button"
            onClick={() => setShowDetails((s) => !s)}
            onKeyPress={() => setShowDetails((s) => !s)}
            tabIndex={0}
          >
            Per-question stats
            {showDetails ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
          </span>
        </h4>
        <Collapse in={showDetails}>
          <div>
            {qpPairs.map(({ qnum, pnum }, index) => {
              const singlePart = dbQuestions[qnum].parts.length === 1
              && !dbQuestions[qnum].parts[0].name?.value?.trim();
              stats[index].sort();
              return (
                <div key={`q${qnum}-p${pnum}`} className="d-inline-block px-3 w-25">
                  <RenderStats
                    width="100%"
                    height={200}
                    minPoints={0}
                    maxPoints={dbQuestions[qnum].parts[pnum].points}
                    dataPoints={stats[index]}
                    showAsPct={showAsPct}
                    barColor={colors[(index + 1) % colors.length]}
                  >
                    <b>
                      <QuestionName qnum={qnum} name={version.dbQuestions[qnum].name} />
                      <br />
                      <PartName
                        anonymous={singlePart}
                        pnum={pnum}
                        name={dbQuestions[qnum].parts[pnum].name}
                      />
                    </b>
                  </RenderStats>
                </div>
              );
            })}
            <RubricPresetHistograms examVersionKey={version} />
          </div>
        </Collapse>
      </div>
    </>
  );
};

const ExamStatsQuery: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const data = useLazyLoadQuery<statsExamQuery>(
    graphql`
    query statsExamQuery($examId: ID!) {
      exam(id: $examId) {
        id
        name
        examVersions(first: 100) @connection(key: "Exam_examVersions", filters: []) {
          edges {
            node {
              id
              name
              qpPairs { qnum pnum }
              dbQuestions {
                name { type value }
                extraCredit
                parts {
                  name { type value }
                  extraCredit
                  points
                }
              }
              ...statsRubricHistograms
            }
          }
        }
        registrations {
          id
          started
          currentPartScores
          examVersion { id }
        }
      }
    }
    `,
    { examId },
  );
  const examVersions = useMemo(
    () => data.exam.examVersions.edges.map((v) => v.node),
    [data.exam.examVersions],
  );
  return (
    <DocumentTitle title={data.exam.name}>
      <ExamStats
        title={data.exam.name}
        examVersions={examVersions}
        registrations={data.exam.registrations}
      />
    </DocumentTitle>
  );
};

const RubricPresetHistograms: React.FC<{
  examVersionKey: statsRubricHistograms$key;
}> = (props) => {
  const { examVersionKey } = props;
  const res = useFragment(
    graphql`
    fragment statsRubricHistograms on ExamVersion {
      id
      rootRubric { ...statsUseRubrics }
      dbQuestions {
        id
        name { type value }
        index
        rootRubric { ...statsUseRubrics }
        parts {
          id
          name { type value }
          index
          rootRubric { ...statsUseRubrics }
          bodyItems {
            id
            index
            rootRubric { ...statsUseRubrics }
          }
        }
      }
      registrations {
        gradingComments(first: 1000000) {
          edges {
            node {
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
      }
    }
    `,
    examVersionKey,
  );
  return (
    <>
      {res.dbQuestions.map((q) => (
        <div key={`q${q.index}`}>
          <QuestionName qnum={q.index} name={q.name} />
          {q.parts.map((p) => (
            <div key={`q${q.index}-p${p.index}`}>
              <PartName anonymous={false} pnum={p.index} name={p.name} />
              {p.bodyItems.map((b) => (
                <div key={`q${q.index}-p${p.index}-b${b.index}`}>
                  <RenderCommentHistograms
                    qnum={q.index}
                    pnum={p.index}
                    bnum={b.index}
                    eRubricKey={res.rootRubric}
                    qRubricKey={q.rootRubric}
                    pRubricKey={p.rootRubric}
                    bRubricKey={b.rootRubric}
                    comments={res.registrations.map((r) => r.gradingComments)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

const RenderCommentHistograms: React.FC<{
  qnum: number,
  pnum: number,
  bnum: number,
  eRubricKey: statsUseRubrics$key,
  qRubricKey: statsUseRubrics$key,
  pRubricKey: statsUseRubrics$key,
  bRubricKey: statsUseRubrics$key,
  comments: statsRubricHistograms['registrations'][number]['gradingComments'][],
}> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    eRubricKey,
    qRubricKey,
    pRubricKey,
    bRubricKey,
    comments,
  } = props;
  return (
    <div>
      <RenderCommentHistogram
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        rubric={eRubricKey}
        comments={comments}
      />
      <RenderCommentHistogram
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        rubric={qRubricKey}
        comments={comments}
      />
      <RenderCommentHistogram
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        rubric={pRubricKey}
        comments={comments}
      />
      <RenderCommentHistogram
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        rubric={bRubricKey}
        comments={comments}
      />
    </div>
  );
};

type PresetUsageData = {
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

type GradingCommentConnection = statsRubricHistograms['registrations'][number]['gradingComments'];
type GradingComment = GradingCommentConnection['edges'][number]['node'];

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
  comments: GradingCommentConnection[],
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
  const relevantComments = comments.flatMap(({ edges }) => (
    edges.filter(({ node }) => (
      node.qnum === qnum && node.pnum === pnum && node.bnum === bnum
    )).map(({ node }) => node)));
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
  rawRubric: statsUseRubrics,
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
  qnum: number,
  pnum: number,
  bnum: number,
  rubric: statsUseRubrics$key,
  comments: statsRubricHistograms['registrations'][number]['gradingComments'][],
}> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    rubric: rubricKey,
    comments,
  } = props;
  const rawRubric = useFragment<statsUseRubrics$key>(
    graphql`
    fragment statsUseRubrics on Rubric {
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
  if (nonEmptyRubric(rubric)) {
    return (
      <div className="w-100">
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
          ref={chartRef}
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

const RenderPreset: React.FC<{
  value: PresetUsageData,
  points: number,
  variant: string,
  VariantIcon: IconType,
  graderHint: string,
  studentFeedback: string,
}> = (props) => {
  const {
    value,
    points,
    variant,
    VariantIcon,
    graderHint,
    studentFeedback,
  } = props;
  switch (value.key) {
    case 'placeholder': return null;
    case 'none':
      return (
        <Alert
          variant="info"
          className="p-0 m-0 preset"
        >
          <Button disabled variant="info" size="sm" className="mr-2 align-self-center">
            <Icon I={RiMessage2Line} className="mr-2" />
            ?? points
          </Button>
          Custom (no preset)
        </Alert>
      );
    default:
      return (
        <Alert
          variant={variant}
          className="p-0 m-0 preset"
          style={{
            width: '100%',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          <Button
            disabled
            variant={variant}
            size="sm"
            className="mr-2 align-self-center"
          >
            <Icon I={VariantIcon} className="mr-2" />
            {pluralize(points, 'point', 'points')}
          </Button>
          {studentFeedback ?? graderHint}
        </Alert>
      );
  }
};

type RechartPayload<T> = {
  payload: T,
  fill: string,
  color: string,
  name: string,
  value: number,
}

const CustomTooltip: React.FC<{
  active?: boolean,
  frozenPayload?: RechartPayload<PresetUsageData>[],
  payload?: RechartPayload<PresetUsageData>[],
  frozenLabel?: string,
  label?: string,
  innerRef?: RefObject<HTMLDivElement>,
  presets: Record<string, {
    readonly points: number,
    readonly graderHint: string,
    readonly studentFeedback: string,
  }>,
  frozenPos?: boolean,
}> = (props) => {
  const {
    presets,
    active,
    frozenPayload,
    payload: defaultPayload,
    frozenLabel,
    label: defaultLabel,
    innerRef,
    frozenPos,
  } = props;
  const payload = frozenPayload ?? defaultPayload;
  const label = frozenLabel ?? defaultLabel;
  if (active && payload?.length) {
    const payload0 = payload[0].payload;
    return (
      <Card
        border={frozenPos ? 'warning' : 'info'}
        className="p-2 mb-0"
        ref={innerRef}
      >
        <p style={{ maxWidth: '25em' }}>
          {label === 'none' ? 'Custom (no preset)' : presets[label]?.studentFeedback ?? presets[label]?.graderHint}
        </p>
        <table className="table table-sm mb-0">
          <tbody>
            {payload.map((value, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={index} className="py-1 my-1">
                <td style={{ width: '2em', backgroundColor: value.fill }} />
                <td>{value.name}</td>
                <td>{value.value}</td>
              </tr>
            ))}
            <tr>
              <td />
              <td><b>Total</b></td>
              <td>{('Total' in payload0) && payload0.Total}</td>
            </tr>
          </tbody>
        </table>
      </Card>
    );
  }
  return null;
};

const ExamStatDisplay: React.FC = () => (
  <Container>
    <ErrorBoundary>
      <Suspense
        fallback={<p>Loading...</p>}
      >
        <ExamStatsQuery />
      </Suspense>
    </ErrorBoundary>
  </Container>
);

export default ExamStatDisplay;
