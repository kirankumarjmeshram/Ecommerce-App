import { Spinner } from "react-bootstrap";
const Loader = () => {
  return (
    <div className="loading-state">
      <Spinner
        animation="border"
        role="status"
        style={{
          width: "28px",
          height: "28px",
          margin: "auto",
          display: "block",
        }}
      ><span className="visually-hidden">Loading, please wait</span></Spinner>
      <span aria-hidden="true">Loading…</span>
    </div>
  );
};

export default Loader;
