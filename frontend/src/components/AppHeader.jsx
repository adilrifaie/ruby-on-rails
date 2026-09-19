import { Link, NavLink } from "react-router-dom";
import { ClipboardPlusIcon, CoinsIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

function Brand({ asLink = true, to = "/" }) {
  const content = (
    <>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-hidden="true">
        <ClipboardPlusIcon className="size-5" />
      </span>
      <span className="hidden font-heading text-base font-semibold tracking-tight sm:inline">Healthcare Scale Platform</span>
      <span className="sr-only sm:hidden">Healthcare Scale Platform</span>
    </>
  );

  return asLink ? (
    <Link to={to} className="flex items-center gap-2.5 rounded-lg text-foreground no-underline">{content}</Link>
  ) : (
    <span className="flex items-center gap-2.5">{content}</span>
  );
}

// `minimal` is the participant variant: brand and theme only, no account navigation.
export default function AppHeader({ minimal = false }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-[max(1rem,env(safe-area-inset-left))]">
        <Brand asLink={!minimal} to={user ? "/dashboard" : "/"} />

        {!minimal && user && (
          <nav aria-label="Main" className="hidden md:block">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium no-underline transition-colors hover:bg-muted ${isActive ? "bg-muted text-foreground" : "text-muted-foreground"}`
              }
            >
              Dashboard
            </NavLink>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {!minimal && user && (
            <Badge variant="secondary" className="h-8 px-3 text-sm">
              <CoinsIcon data-icon="inline-start" aria-hidden="true" />
              <span className="tabular-nums">{user.credits}</span>
              <span className="hidden sm:inline">credits</span>
              <span className="sr-only sm:hidden">credits</span>
            </Badge>
          )}
          <ThemeToggle />
          {!minimal && (user ? (
            <UserMenu />
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          ))}
        </div>
      </div>
    </header>
  );
}
