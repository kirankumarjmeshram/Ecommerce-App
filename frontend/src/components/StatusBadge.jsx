const StatusBadge = ({ positive, children }) => (
  <span className={`status-pill ${positive ? 'status-positive' : 'status-pending'}`}>{children}</span>
);
export default StatusBadge;
