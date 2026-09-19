import { CircleCheckIcon, PencilLineIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Icon + text so status never relies on color alone. A scale with no status yet is a draft.
export default function ScaleStatusBadge({ status }) {
  return status === "published" ? (
    <Badge variant="secondary">
      <CircleCheckIcon data-icon="inline-start" aria-hidden="true" />
      Published
    </Badge>
  ) : (
    <Badge variant="outline">
      <PencilLineIcon data-icon="inline-start" aria-hidden="true" />
      Draft
    </Badge>
  );
}
