import { Link } from "react-router-dom";
import { useState, useEffect } from "react";


//images
import google from "../../assets/images/auth-icon/google.png";
import twitter from "../../assets/images/auth-icon/twitter.png";
import facebook from "../../assets/images/auth-icon/facebook.png";
import { Form, Modal } from "react-bootstrap";

const Login = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const login = document.getElementById("login");
    if (login) {
      login?.addEventListener("click", () => setShow(true));
    }
  }, []);

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <h4 className="mb-0">Welcome Back</h4>
          <p className="text-muted fs-15">
            Welcome back! Please enter your details.
          </p>
        </div>
        <div className="mb-3">
          <Form.Label htmlFor="emailAddress">Email Address</Form.Label>
          <Form.Control
            type="email"
            id="emailAddress"
            placeholder="Your email..."
          />
        </div>
        <div className="mb-2">
          <Form.Label htmlFor="inputPasseord">Password</Form.Label>
          <Form.Control type="password" id="inputPasseord" />
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
          <Form.Check>
            <Form.Check.Input type="checkbox" value="" id="flexCheckDefault" />
            <Form.Check.Label htmlFor="flexCheckDefault">
              Remember for 30 days
            </Form.Check.Label>
          </Form.Check>
          <Link to="#" className="text-secondary fs-13">
            Forgot Password..?
          </Link>
        </div>

        <Link
          to="#"
          className="btn btn-gradient-primary w-100"
          data-bs-dismiss="modal"
        >
          Sign up
        </Link>
        <div className="text-center">
          <div className="position-relative my-4">
            <span className="bg-soft-secondary w-100 d-inline-block"></span>
            <p className="text-muted fs-15 mb-0 mt-1 bg-white px-2 position-absolute top-50 start-50 translate-middle">
              Or continue with
            </p>
          </div>
          <ul className="list-inline mb-0">
            <li className="list-inline-item">
              <Link to="#" className="btn btn-danger">
                <img
                  src={google}
                  alt="google"
                  className="img-fluid"
                  width="24"
                />
              </Link>
            </li>
            <li className="list-inline-item">
              <Link to="#" className="btn btn-primary">
                <img src={facebook} alt="" className="img-fluid" width="24" />
              </Link>
            </li>
            <li className="list-inline-item">
              <Link to="#" className="btn btn-info">
                <img src={twitter} alt="" className="img-fluid" width="24" />
              </Link>
            </li>
          </ul>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Login;
