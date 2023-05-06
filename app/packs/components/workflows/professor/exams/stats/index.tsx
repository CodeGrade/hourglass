import ErrorBoundary from '@hourglass/common/boundary';
import DocumentTitle from '@hourglass/common/documentTitle';
import React, {
  Suspense,
  useMemo,
  useState,
} from 'react';
import * as d3 from 'd3-array';
import {
  Collapse,
  Container, Table, ToggleButton, ToggleButtonGroup,
} from 'react-bootstrap';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useParams } from 'react-router-dom';
import {
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import { PartName } from '@student/exams/show/components/Part';
import Icon from '@student/exams/show/components/Icon';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { statsExamQuery } from './__generated__/statsExamQuery.graphql';
import RubricPresetHistograms from './RubricPresetHistograms';
import { colors } from './utils';

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
  examId: string,
  title?: string;
  examVersions: readonly ExamVersion[],
  registrations: readonly Registration[],
}> = (props) => {
  const {
    examId,
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
          examId={examId}
          key={version.id}
          version={version}
          stats={statsByVersion[version.id]}
          regs={regsByVersion.get(version.id)}
        />
      ))}
    </>
  );
};

function round(n: number, numDigits: number) {
  return Math.round(n * 10 ** numDigits) / 10 ** numDigits;
}

const RenderStats: React.FC<React.PropsWithChildren & {
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
  examId: string,
  version: ExamVersion,
  regs: Registration[],
  stats: number[][],
}> = (props) => {
  const {
    examId,
    version,
    stats,
    regs,
  } = props;
  const { qpPairs, dbQuestions } = version;
  const [showDetails, setShowDetails] = useState(false);
  const [showRubrics, setShowRubrics] = useState(false);
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
          </div>
        </Collapse>
        <h4 className="flex-grow-1">
          <span
            role="button"
            onClick={() => setShowRubrics((s) => !s)}
            onKeyPress={() => setShowRubrics((s) => !s)}
            tabIndex={0}
          >
            Per-question rubric presets usage
            {showRubrics ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
          </span>
        </h4>
        <Collapse in={showRubrics}>
          <div>
            <RubricPresetHistograms
              examVersionKey={version}
              examId={examId}
            />
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
              ...RubricPresetHistograms
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
        examId={examId}
        title={data.exam.name}
        examVersions={examVersions}
        registrations={data.exam.registrations}
      />
    </DocumentTitle>
  );
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
