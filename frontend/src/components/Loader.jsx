import { Spinner } from "react-bootstrap";
const Loader = () => {
  return (
    <div className="d-flex justify-content-center">
      <Spinner
        animation="border"
        role="status"
        style={{
          width: "100px",
          height: "100px",
          margin: "auto",
          display: "block",
        }}
      ></Spinner>
    </div>
  );
};

export default Loader;
