import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CircleAlertIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
// Autofocus only where there's a mouse; on touch it pops the keyboard and shifts the layout.
const prefersAutofocus = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

export default function LoginPage() {
  usePageTitle("Log in");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const clearFieldError = (name) => setFieldErrors((errs) => (errs[name] ? { ...errs, [name]: undefined } : errs));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    const errs = {};
    if (!email) errs.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email)) errs.email = "Enter an email address like name@example.com.";
    if (!password) errs.password = "Enter your password.";
    setFieldErrors(errs);
    setError(null);
    const firstInvalid = Object.keys(errs)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.status === 401 ? "That email and password don't match. Check them and try again." : err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      description="Welcome back. Log in to manage your scales, surveys and analyses."
      footer={<p className="m-0">No account yet? <Link to="/register" className="font-medium text-primary">Register</Link></p>}
    >
      <form onSubmit={handleSubmit} noValidate className="max-w-none">
        <FieldGroup>
          <Field data-invalid={!!fieldErrors.email || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="name@example.com"
              autoFocus={prefersAutofocus}
              aria-invalid={!!fieldErrors.email || undefined}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              onChange={() => clearFieldError("email")}
            />
            <FieldError id="email-error">{fieldErrors.email}</FieldError>
          </Field>
          <Field data-invalid={!!fieldErrors.password || undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              aria-invalid={!!fieldErrors.password || undefined}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              onChange={() => clearFieldError("password")}
            />
            <FieldError id="password-error">{fieldErrors.password}</FieldError>
          </Field>

          {error && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Spinner data-icon="inline-start" />}
            Log in
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
