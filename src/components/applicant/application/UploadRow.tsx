import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
type DocumentFile = { file: File | null; name: string };

// Accepted file types: PDF, DOC, DOCX, and common image formats
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/tiff",
  "image/tif",
];
const ACCEPTED_DOC_TYPES = [
  "application/pdf",
];
const ALL_ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES];

// Also support file extensions for fallback
const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".tiff",
  ".tif",
];

function isValidFileType(file: File): boolean {
  // Check MIME type first
  if (ALL_ACCEPTED_TYPES.includes(file.type)) {
    return true;
  }

  // Fallback: check file extension for cases where MIME type is not recognized
  const fileName = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

export function UploadRow({
  title,
  description,
  required,
  file,
  externalError,
  onUpload,
}: {
  title: string;
  description: string;
  required: boolean;
  file?: DocumentFile;
  externalError?: string;       // ← new
  onUpload: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFile = !!file?.file || !!file?.name;
  const [internalError, setInternalError] = useState<string | null>(null);

  // Internal type-error takes priority; fall back to external (missing file) error
  const displayError = internalError ?? externalError ?? null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setInternalError(null);

    if (!isValidFileType(f)) {
      setInternalError(
        "Invalid file type. Please upload a PDF or image file (JPG, PNG, GIF, BMP, WEBP, TIFF).",
      );
      e.target.value = "";
      return;
    }

    onUpload(f);
  };

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 py-4",
        displayError && !hasFile && "rounded-lg bg-red-50/50",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
            {title}
          </span>
          {required ? (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-[#8B1A2B]/40 text-[#8B1A2B] font-semibold tracking-wide"
            >
              REQUIRED
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-neutral-300 text-neutral-500 font-semibold tracking-wide"
            >
              OPTIONAL
            </Badge>
          )}
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>

        {/* Error: internal type-check or external missing-file */}
        {displayError && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {displayError}
          </p>
        )}

        {/* Success state — only when no errors */}
        {hasFile && !displayError && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {file?.file?.name ?? file?.name}
          </p>
        )}
      </div>

      <div className="shrink-0">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.tif"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "text-xs font-semibold flex items-center gap-1.5 border rounded-md px-3 py-1.5 transition-colors",
            hasFile
              ? "border-green-400 text-green-600 hover:bg-green-50"
              : displayError
                ? "border-red-400 text-red-600 hover:bg-red-50"
                : "border-[#8B1A2B]/50 text-[#8B1A2B] hover:bg-[#8B1A2B]/5",
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          {hasFile ? "Replace" : "Upload"}
        </Button>
      </div>
    </div>
  );
}