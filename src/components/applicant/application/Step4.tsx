import { Separator } from "@/components/ui/separator";
import { UploadRow } from "./UploadRow";
import { documentSections } from "./document-sections";
import type { DocumentType } from "@/schemas/document";

type DocumentFile = { file: File | null; name: string };
type Step4Data = Record<DocumentType, DocumentFile>;

export function Step4({
  data,
  onUpload,
  errors = {},
}: {
  data: Step4Data;
  onUpload: (key: keyof Step4Data, file: File) => void;
  errors?: Record<string, string>;
}) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Document Checklist
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Please prepare and upload clear digital copies of the following
          required documents to finalize your SRRV application. Accepted
          formats: PDF, DOC, DOCX, JPG, PNG, GIF, BMP, WEBP, TIFF.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {documentSections.map((section) => (
          <div key={section.number}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-neutral-500">
                {section.number}.
              </span>
              <span className="text-sm font-semibold text-neutral-800">
                {section.title}
              </span>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              {section.documents.map((doc, idx) => (
                <div key={doc.key}>
                  {idx > 0 && <Separator />}
                  <div className="px-4">
                    <UploadRow
                      title={doc.title}
                      description={doc.description}
                      required={doc.required}
                      file={data[doc.key]}
                      externalError={errors[doc.key]}
                      onUpload={(f) => onUpload(doc.key, f)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}