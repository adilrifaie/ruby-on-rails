import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 6;
const prefersAutofocus = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

export default function RegisterPage() {
  usePageTitle("Register");
  const { register } = useAuth();
  const navigate = useNavigate();
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
    if (password.length < MIN_PASSWORD_LENGTH) errs.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    setFieldErrors(errs);
    setError(null);
    const firstInvalid = Object.keys(errs)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(email, password);
      toast.success(`Account created. You have ${user.credits} credits to start.`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.fields?.email) {
        setFieldErrors({
          email: String(err.fields.email).includes("taken")
            ? "An account with this email already exists. Log in instead."
            : `Email ${[].concat(err.fields.email).join(", ")}.`,
        });
        document.getElementById("email")?.focus();
      } else {
        setError(err.message);
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Build assessment scales, share them with a link, and analyze the results. New accounts start with 20 credits."
      footer={<p className="m-0">Already have an account? <Link to="/login" className="font-medium text-primary">Log in</Link></p>}
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
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password || undefined}
              aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
              onChange={() => clearFieldError("password")}
            />
            {fieldErrors.password ? (
              <FieldError id="password-error">{fieldErrors.password}</FieldError>
            ) : (
              <FieldDescription id="password-hint">At least {MIN_PASSWORD_LENGTH} characters.</FieldDescription>
            )}
          </Field>

          {error && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Spinner data-icon="inline-start" />}
            Create account
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
