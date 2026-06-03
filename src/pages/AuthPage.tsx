import { LoginForm, SignupForm } from "wasp/client/auth";
import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Broadcast Timekeeper</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        <LoginForm />
        <p className="auth-switch">
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export function SignupPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Broadcast Timekeeper</h1>
        <p className="auth-subtitle">Create your crew account</p>
        <SignupForm
          additionalFields={[
            {
              name: "fullName",
              label: "Full Name",
              type: "input",
              validations: { required: "Full name is required" },
            },
            {
              name: "department",
              label: "Department (e.g. Camera, Audio, Lighting)",
              type: "input",
              validations: {},
            },
          ]}
        />
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
