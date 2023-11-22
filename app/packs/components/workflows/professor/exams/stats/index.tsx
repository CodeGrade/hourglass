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
import { Link, useParams } from 'react-router-dom';
import {
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { submissionLink } from '@hourglass/workflows/grading';
import { pluralize } from '@hourglass/common/helpers';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import { PartName } from '@student/exams/show/components/Part';
import Icon from '@student/exams/show/components/Icon';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { statsExamQuery } from './__generated__/statsExamQuery.graphql';
import RubricPresetHistograms from './RubricPresetHistograms';
import { colors } from './utils';

type ExamVersion = statsExamQuery['response']['exam']['examVersions']['edges'][number]['node'];
type RegistrationScore = ExamVersion['currentScores'][number];
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
}> = (props) => {
  const {
    examId,
    title,
    examVersions,
  } = props;
  const examVersionsMap = new Map(
    examVersions.map((v) => [v.id, v]),
  );
  const scoresByRegId: Map<ExamVersion['id'], Map<RegistrationScore['registration']['id'], RegistrationScore['scores']>> = new Map(
    examVersions.map(
      (v) => [
        v.id,
        new Map(v.currentScores.filter((reg) => reg.registration.started)
          .map((reg) => [reg.registration.id, reg.scores]))],
    ),
  );
  const statsByVersion: Record<ExamVersion['id'], number[][]> = {};
  examVersionsMap.forEach((version, id) => {
    const stats = [];
    version.qpPairs.forEach(({ qnum, pnum }, index) => {
      stats[index] = Array.from(scoresByRegId.get(id).values())
        .map((scores) => scores[qnum][pnum]);
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
  stats: number[][],
}> = (props) => {
  const {
    examId,
    version,
    stats,
  } = props;
  const { qpPairs, dbQuestions } = version;
  const [showAsPct, setShowAsPct] = useState(true);
  const numPoints = d3.sum(
    dbQuestions.filter((q) => !q.extraCredit)
      .map((q) => q.parts.filter((p) => !p.extraCredit).map((p) => p.points))
      .flat(),
  );
  const rawScores = version.currentScores
    .filter((reg) => reg.registration.started)
    .map((reg) => d3.sum(reg.scores.flat()));
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
        <GradingAnomalies
          examId={examId}
          version={version}
        />
        <PerQuestionStats
          qpPairs={qpPairs}
          dbQuestions={dbQuestions}
          stats={stats}
          showAsPct={showAsPct}
        />
        <RubricUsageHistograms
          version={version}
          examId={examId}
        />
      </div>
    </>
  );
};

const GradingAnomalies: React.FC<{
  examId: string,
  version: ExamVersion,
}> = (props) => {
  const {
    examId,
    version,
  } = props;
  const [showDetails, setShowDetails] = useState(false);
  const {
    currentScores,
    qpPairs,
    dbQuestions,
  } = version;
  const anomalousStudents = dbQuestions.map((q, qnum) => (
    q.parts.map((p, pnum) => (
      currentScores.filter((s) => (
        s.scores[qnum][pnum] < 0 || s.scores[qnum][pnum] > p.points
      )).sort((r1, r2) => (
        r1.registration.user.displayName.localeCompare(r2.registration.user.displayName)
      ))
    ))
  ));
  const anyone = anomalousStudents.some((q) => q.some((p) => p.length > 0));
  if (!anyone) return null;
  return (
    <>
      <h4 className="flex-grow-1">
        <span
          role="button"
          onClick={() => setShowDetails((s) => !s)}
          onKeyPress={() => setShowDetails((s) => !s)}
          tabIndex={0}
        >
          Grading anomalies
          {showDetails ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
        </span>
      </h4>
      <Collapse in={showDetails}>
        <div>
          {qpPairs.map(({ qnum, pnum }) => {
            const singlePart = dbQuestions[qnum].parts.length === 1
              && !dbQuestions[qnum].parts[0].name?.value?.trim();
            const anomalies = anomalousStudents[qnum][pnum];
            return (
              <div key={`q${qnum}-p${pnum}`}>
                <b>
                  <QuestionName qnum={qnum} name={dbQuestions[qnum].name} />
                  {!singlePart && <span className="mx-2">&mdash;</span>}
                  <PartName
                    anonymous={singlePart}
                    pnum={pnum}
                    name={dbQuestions[qnum].parts[pnum].name}
                  />
                </b>
                <table>
                  {anomalies.map((a) => (
                    <tr>
                      <Link
                        key={a.registration.id}
                        target="blank"
                        to={submissionLink(examId, a.registration.id, singlePart, qnum, pnum)}
                      >
                        {a.registration.user.displayName}
                      </Link>
                      {` (${a.scores[qnum][pnum]} / ${pluralize(dbQuestions[qnum].parts[pnum].points, 'point', 'points')})`}
                    </tr>
                  ))}
                </table>
              </div>
            );
          })}
        </div>
      </Collapse>
    </>
  );
};

const PerQuestionStats: React.FC<{
  qpPairs: ExamVersion['qpPairs'],
  dbQuestions: ExamVersion['dbQuestions'],
  stats: number[][],
  showAsPct: boolean,
}> = (props) => {
  const {
    qpPairs,
    dbQuestions,
    stats,
    showAsPct,
  } = props;
  const [showDetails, setShowDetails] = useState(false);
  return (
    <>
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
                    <QuestionName qnum={qnum} name={dbQuestions[qnum].name} />
                    {!singlePart && <br />}
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
    </>
  );
};

const RubricUsageHistograms: React.FC<{
  examId: string,
  version: ExamVersion,
}> = (props) => {
  const {
    version,
    examId,
  } = props;
  const [showRubrics, setShowRubrics] = useState(false);
  return (
    <>
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
              currentScores {
                registration { 
                  id
                  user { displayName }
                  started
                }
                scores
              }
            }
          }
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
    <DocumentTitle title={`${data.exam.name} -- Grading statistics`}>
      <ExamStats
        examId={examId}
        title={data.exam.name}
        examVersions={examVersions}
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
