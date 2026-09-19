import { useState } from "react";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

// The survey's public link, with copy and open actions. Participants don't need an account.
export default function ShareLink({ url }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn’t copy automatically. Select the link and copy it.");
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor="public-link">Public link</FieldLabel>
      <div className="flex flex-col gap-2 sm:flex-row">
        <InputGroup className="flex-1">
          <InputGroupInput id="public-link" readOnly value={url} onFocus={(e) => e.target.select()} translate="no" aria-describedby="public-link-hint" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label={copied ? "Copied" : "Copy link"} onClick={copy}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Button asChild variant="outline">
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLinkIcon data-icon="inline-start" />
            Open
          </a>
        </Button>
      </div>
      <FieldDescription id="public-link-hint">Anyone with this link can respond without an account. Each response is scored automatically.</FieldDescription>
    </Field>
  );
}
