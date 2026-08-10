import { useMemo } from 'react';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaRedo, FaServer, FaTimesCircle } from 'react-icons/fa';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { useGetObservabilitySummaryQuery } from '../../slices/observabilityApiSlice';

const POLLING_INTERVAL_MS = 15000;

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);
const formatUptime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const statusVariant = (status) => {
  if (status === 'healthy' || status === 'up') return 'success';
  if (status === 'degraded') return 'warning';
  return 'danger';
};

const StatusBadge = ({ status }) => (
  <Badge bg={statusVariant(status)} className="text-uppercase">
    {status === 'up' ? 'Connected' : status}
  </Badge>
);

const MetricCard = ({ label, value, hint, variant = 'primary' }) => (
  <Card className="h-100 shadow-sm">
    <Card.Body>
      <Card.Text className="text-muted mb-1">{label}</Card.Text>
      <Card.Title className={`mb-1 text-${variant}`}>{value}</Card.Title>
      {hint && <small className="text-muted">{hint}</small>}
    </Card.Body>
  </Card>
);

const ChartCard = ({ title, children }) => (
  <Card className="h-100 shadow-sm">
    <Card.Body>
      <Card.Title as="h2" className="h5">{title}</Card.Title>
      <div style={{ height: 260 }}>{children}</div>
    </Card.Body>
  </Card>
);

const ObservabilityScreen = () => {
  const {
    data: summary,
    isLoading,
    isFetching,
    error,
    refetch,
    fulfilledTimeStamp,
  } = useGetObservabilitySummaryQuery(undefined, {
    pollingInterval: POLLING_INTERVAL_MS,
    refetchOnFocus: true,
  });

  const chartData = useMemo(() => (summary?.history || []).map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })), [summary]);

  if (isLoading) return <Loader />;
  if (error) {
    return <Message variant="danger">Unable to load observability data.</Message>;
  }

  const overallIcon = summary.status === 'healthy'
    ? <FaCheckCircle aria-hidden="true" />
    : summary.status === 'degraded'
      ? <FaExclamationTriangle aria-hidden="true" />
      : <FaTimesCircle aria-hidden="true" />;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="mb-1">System Observability</h1>
          <p className="text-muted mb-0">Live, current-process operational telemetry.</p>
        </div>
        <div className="text-md-end">
          <Button variant="outline-primary" onClick={refetch} disabled={isFetching}>
            <FaRedo className="me-2" aria-hidden="true" />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
          <small className="d-block text-muted mt-2">
            Last updated: {fulfilledTimeStamp ? new Date(fulfilledTimeStamp).toLocaleTimeString() : '—'}
          </small>
        </div>
      </div>

      <Card className="mb-4 border-0 bg-light">
        <Card.Body className="d-flex align-items-center gap-3">
          <FaServer className={`fs-3 text-${statusVariant(summary.status)}`} aria-hidden="true" />
          <div>
            <Card.Text className="text-muted mb-1">Overall system status</Card.Text>
            <div className="d-flex align-items-center gap-2">
              {overallIcon} <StatusBadge status={summary.status} />
            </div>
          </div>
        </Card.Body>
      </Card>

      <h2 className="h4 mb-3">System Status</h2>
      <Row className="g-3 mb-4">
        <Col md={3}><MetricCard label="API" value={<StatusBadge status={summary.services.api} />} /></Col>
        <Col md={3}><MetricCard label="MongoDB" value={<StatusBadge status={summary.services.mongodb} />} /></Col>
        <Col md={3}><MetricCard label="Redis" value={<StatusBadge status={summary.services.redis === 'up' ? 'up' : 'degraded'} />} hint="Optional cache service" /></Col>
        <Col md={3}><MetricCard label="Uptime" value={formatUptime(summary.uptimeSeconds)} /></Col>
      </Row>

      <h2 className="h4 mb-3">Traffic</h2>
      <Row className="g-3 mb-4">
        <Col md={3}><MetricCard label="Requests" value={formatNumber(summary.http.requests)} /></Col>
        <Col md={3}><MetricCard label="Server Errors" value={formatNumber(summary.http.errors)} variant={summary.http.errors ? 'danger' : 'success'} hint="HTTP 5xx only" /></Col>
        <Col md={3}><MetricCard label="Error Rate" value={`${summary.http.errorRate}%`} /></Col>
        <Col md={3}><MetricCard label="Average Latency" value={`${summary.http.averageLatencyMs} ms`} /></Col>
      </Row>

      <h2 className="h4 mb-3">Redis Cache</h2>
      <Row className="g-3 mb-4">
        <Col md={3}><MetricCard label="Hits" value={formatNumber(summary.cache.hits)} variant="success" /></Col>
        <Col md={3}><MetricCard label="Misses" value={formatNumber(summary.cache.misses)} /></Col>
        <Col md={3}><MetricCard label="Hit Ratio" value={`${summary.cache.hitRatio}%`} /></Col>
        <Col md={3}><MetricCard label="Cache Errors" value={formatNumber(summary.cache.errors)} variant={summary.cache.errors ? 'danger' : 'success'} /></Col>
      </Row>

      <h2 className="h4 mb-3">Runtime</h2>
      <Row className="g-3 mb-4">
        <Col md={6}><MetricCard label="Memory (RSS)" value={`${summary.runtime.memoryUsageMb} MB`} /></Col>
        <Col md={6}><MetricCard label="Node.js" value={summary.runtime.nodeVersion} /></Col>
      </Row>

      {chartData.length > 0 ? (
        <>
          <h2 className="h4 mb-3">Live Request History</h2>
          <Row className="g-3 mb-4">
            <Col lg={6}>
              <ChartCard title="Request Traffic">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="requests" stroke="#0d6efd" strokeWidth={2} dot={false} name="Requests" /></LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
            <Col lg={6}>
              <ChartCard title="Average Latency">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis unit=" ms" /><Tooltip /><Line type="monotone" dataKey="averageLatencyMs" stroke="#6f42c1" strokeWidth={2} dot={false} name="Latency" /></LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
            <Col lg={6}>
              <ChartCard title="Server Errors">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="errors" stroke="#dc3545" strokeWidth={2} dot={false} name="5xx Errors" /></LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
            <Col lg={6}>
              <ChartCard title="Redis Cache Activity">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="redisHits" stroke="#198754" strokeWidth={2} dot={false} name="Hits" /><Line type="monotone" dataKey="redisMisses" stroke="#fd7e14" strokeWidth={2} dot={false} name="Misses" /></LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
          </Row>
        </>
      ) : (
        <Message variant="info">Charts will appear after this process records operational activity.</Message>
      )}

      <small className="text-muted d-block mb-4">
        Live history is retained in memory for up to 60 minutes and resets when the backend restarts. Persistent history and P95 latency belong in Prometheus/Grafana later.
      </small>
    </>
  );
};

export default ObservabilityScreen;
