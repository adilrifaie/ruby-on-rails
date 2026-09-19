import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Centered card on the dot grid, shared by the login and register pages.
export default function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="relative isolate flex min-h-[calc(100svh-14rem)] items-center justify-center py-4">
      <div aria-hidden="true" className="bg-dot-grid absolute inset-x-0 -top-8 -bottom-16 -z-10" />
      <Card className="w-full max-w-sm shadow-lg shadow-foreground/5 [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle>
            <h1 className="mb-0 text-2xl">{title}</h1>
          </CardTitle>
          <CardDescription className="text-pretty">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="justify-center border-t bg-muted/50 py-4 text-sm text-muted-foreground">{footer}</CardFooter>
      </Card>
    </div>
  );
}
