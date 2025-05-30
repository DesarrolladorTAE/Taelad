import { Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Signin = () => {
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    const signin = document.getElementById("signin");
    if (signin) {
      signin?.addEventListener("click", () => setShowSignIn(true));
    }
  }, []);

  return (
    <Modal show={showSignIn} onHide={() => setShowSignIn(false)} centered>
      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <h4 className="">Sign up</h4>
          <p className="text-muted text-uppercase fs-14">Start For Free</p>
        </div>
        <div className="mb-3">
          <Form.Label htmlFor="firstName">First Name</Form.Label>
          <Form.Control
            type="text"
            id="firstName"
            placeholder="Your first name..."
          />
        </div>
        <div className="mb-3">
          <Form.Label htmlFor="lasttName">Last Name</Form.Label>
          <Form.Control
            type="text"
            id="lasttName"
            placeholder="Your last name..."
          />
        </div>
        <div className="mb-3">
          <Form.Label htmlFor="emailAddress1">Email Address</Form.Label>
          <Form.Control
            type="email"
            id="emailAddress1"
            placeholder="Your email..."
          />
        </div>
        <div className="mb-2">
          <Form.Label htmlFor="inputPasseord2">Password</Form.Label>
          <Form.Control type="password" id="inputPasseord2" />
        </div>
        <Form.Check className="mb-4 pb-2">
          <Form.Check.Input type="checkbox" value="" id="flexCheckDefault1" />
          <Form.Check.Label htmlFor="flexCheckDefault1">
            {" "}
            I agree to the <Link to="#">Terms of Service</Link> and{" "}
            <Link to="#">Privacy Policy</Link>{" "}
          </Form.Check.Label>
        </Form.Check>

        <Link to="#" className="btn btn-gradient-primary w-100">
          Create account
        </Link>
      </Modal.Body>
    </Modal>
  );
};

export default Signin;
