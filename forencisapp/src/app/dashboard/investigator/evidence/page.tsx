
"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  HardDrive,
  Info,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type EvidenceMode = "files" | "disk";
type DiskFormat = "E01" | "EX01" | "RAW";

type EvidenceMetadata = {
  caseNumber: string;
  title: string;
  description: string;
  source: string;
  collectedAt: string;
  expectedSha256: string;
  tags: string;
};

type ApiResponse = {
  message?: string;
  error?: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://edutechpro.online"
).replace(/\/+$/, "");

// Endpoint 1: upload regular evidence files to the application server.
const SMALL_EVIDENCE_ENDPOINT =
  `${API_BASE_URL}/api/v1/evidence/upload`;

// Endpoint 2: register evidence already stored on the bulk-storage server.
const LARGE_EVIDENCE_ENDPOINT =
  `${API_BASE_URL}/api/v1/evidence/register-link`;

const MAX_BATCH_SIZE = 700_000_000;
const MAX_FILES = 100;

const DISK_EXTENSIONS: Record<DiskFormat, string[]> = {
  E01: [".e01"],
  EX01: [".ex01"],
  RAW: [".raw", ".dd", ".img"],
};

const INITIAL_METADATA: EvidenceMetadata = {
  caseNumber: "",
  title: "",
  description: "",
  source: "",
  collectedAt: "",
  expectedSha256: "",
  tags: "",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1000)),
    units.length - 1,
  );

  return `${(bytes / 1000 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function getExtension(filename: string): string {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

function getErrorMessage(
  body: ApiResponse | null,
  fallback: string,
): string {
  return body?.message || body?.error || fallback;
}

function isValidSha256(value: string): boolean {
  return value.trim() === "" || /^[a-fA-F0-9]{64}$/.test(value.trim());
}

function getMetadataPayload(metadata: EvidenceMetadata) {
  return {
    caseNumber: metadata.caseNumber.trim(),
    title: metadata.title.trim(),
    description: metadata.description.trim(),
    source: metadata.source.trim(),
    collectedAt: metadata.collectedAt || null,
    expectedSha256: metadata.expectedSha256.trim() || null,
    tags: metadata.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

async function readApiResponse(response: Response): Promise<ApiResponse | null> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as ApiResponse;
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

export default function UploadEvidencePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<EvidenceMode>("files");
  const [diskFormat, setDiskFormat] = useState<DiskFormat>("E01");
  const [metadata, setMetadata] =
    useState<EvidenceMetadata>(INITIAL_METADATA);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [storageUrl, setStorageUrl] = useState("");
  const [storageObjectId, setStorageObjectId] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSize = useMemo(
    () => selectedFiles.reduce((sum, file) => sum + file.size, 0),
    [selectedFiles],
  );

  const batchLimitExceeded = totalSize > MAX_BATCH_SIZE;

  const activeEndpoint =
    mode === "files"
      ? SMALL_EVIDENCE_ENDPOINT
      : LARGE_EVIDENCE_ENDPOINT;

  function clearMessages() {
    setErrors([]);
    setApiError("");
    setSuccessMessage("");
  }

  function updateMetadata(
    field: keyof EvidenceMetadata,
    value: string,
  ) {
    setMetadata((current) => ({ ...current, [field]: value }));
    clearMessages();
  }

  function changeMode(nextMode: EvidenceMode) {
    setMode(nextMode);
    setSelectedFiles([]);
    setStorageUrl("");
    setStorageObjectId("");
    clearMessages();
  }

  function addFiles(incoming: FileList | File[] | null) {
    if (!incoming) return;

    const files = Array.from(incoming);

    setSelectedFiles((current) => {
      const combined = [...current];

      for (const file of files) {
        const duplicate = combined.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified &&
            existing.webkitRelativePath === file.webkitRelativePath,
        );

        if (!duplicate) combined.push(file);
      }

      return combined;
    });

    clearMessages();
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((current) =>
      current.filter((_, i) => i !== index),
    );
    clearMessages();
  }

  function validateForm(): string[] {
    const validationErrors: string[] = [];

    if (!metadata.caseNumber.trim()) {
      validationErrors.push("Enter a case number.");
    }

    if (!metadata.title.trim()) {
      validationErrors.push("Enter an evidence title.");
    }

    if (!metadata.source.trim()) {
      validationErrors.push("Enter the evidence source or originating device.");
    }

    if (!isValidSha256(metadata.expectedSha256)) {
      validationErrors.push(
        "The expected SHA-256 must contain exactly 64 hexadecimal characters.",
      );
    }

    if (mode === "files") {
      if (selectedFiles.length === 0) {
        validationErrors.push("Select at least one evidence file.");
      }

      if (selectedFiles.length > MAX_FILES) {
        validationErrors.push("Select no more than 100 files.");
      }

      if (totalSize > MAX_BATCH_SIZE) {
        validationErrors.push(
          "The selected files exceed the 700 MB combined limit.",
        );
      }
    }

    if (mode === "disk") {
      if (!storageUrl.trim()) {
        validationErrors.push(
          "Enter the location of the large evidence on your bulk-storage server.",
        );
      } else {
        try {
          const parsed = new URL(storageUrl.trim());

          if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            validationErrors.push(
              "The storage reference must use HTTP or HTTPS.",
            );
          }

          if (parsed.username || parsed.password) {
            validationErrors.push(
              "Do not put storage credentials in the URL.",
            );
          }

          if (
            parsed.protocol === "http:" &&
            process.env.NODE_ENV === "production"
          ) {
            validationErrors.push(
              "Use HTTPS for storage references in production.",
            );
          }

          const extension = getExtension(
            decodeURIComponent(parsed.pathname),
          );

          if (!DISK_EXTENSIONS[diskFormat].includes(extension)) {
            validationErrors.push(
              `The storage location must point to a ${diskFormat} evidence image.`,
            );
          }
        } catch {
          validationErrors.push("Enter a valid storage URL.");
        }
      }

      if (!storageObjectId.trim()) {
        validationErrors.push(
          "Enter the storage object ID or storage reference assigned by your bulk-storage system.",
        );
      }
    }

    return validationErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    const validationErrors = validateForm();

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let response: Response;

      if (mode === "files") {
        // Small evidence: send actual files to the application server.
        const formData = new FormData();

        formData.append("mode", "files");
        formData.append(
          "metadata",
          JSON.stringify(getMetadataPayload(metadata)),
        );

        for (const file of selectedFiles) {
          formData.append("files", file, file.name);
        }

        response = await fetch(SMALL_EVIDENCE_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });
      } else {
        // Large evidence: register a reference only.
        // No disk-image bytes are sent from this browser request.
        const payload = {
          mode: "disk-link",
          diskFormat,
          storageUrl: storageUrl.trim(),
          storageObjectId: storageObjectId.trim(),
          metadata: getMetadataPayload(metadata),
        };

        response = await fetch(LARGE_EVIDENCE_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const body = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            body,
            `The request failed with HTTP ${response.status}.`,
          ),
        );
      }

      setSuccessMessage(
        getErrorMessage(
          body,
          mode === "files"
            ? "The small-evidence upload request was accepted."
            : "The large-evidence registration request was accepted.",
        ),
      );

      setSelectedFiles([]);
      setMetadata(INITIAL_METADATA);
      setStorageUrl("");
      setStorageObjectId("");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to contact the evidence server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setSelectedFiles([]);
    setMetadata(INITIAL_METADATA);
    setStorageUrl("");
    setStorageObjectId("");
    clearMessages();
  }

  return (
    <main className="min-h-screen bg-[#F7F4EE] text-[#171A1F]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/evidence"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#F97316]"
        >
          <ArrowLeft size={16} />
          Back to evidence
        </Link>

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0F766E]/20 bg-[#0F766E]/10 px-3 py-1 text-xs font-semibold text-[#0F766E]">
              <ShieldCheck size={14} />
              Evidence intake
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Register evidence
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Upload smaller evidence files to the application server or
              register large forensic images already stored on your bulk
              storage server.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <LockKeyhole size={17} className="text-[#0F766E]" />
            Authenticated access required
          </div>
        </header>

        {successMessage && (
          <Notice
            type="success"
            title="Server response received"
            message={successMessage}
            onDismiss={() => setSuccessMessage("")}
          />
        )}

        {apiError && (
          <Notice
            type="error"
            title="Request failed"
            message={apiError}
            onDismiss={() => setApiError("")}
          />
        )}

        {errors.length > 0 && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <AlertCircle size={18} />
              Please correct the following
            </div>
            <ul className="list-inside list-disc space-y-1">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                number="01"
                title="Evidence storage method"
                description="Choose how the evidence will be stored."
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ModeCard
                  selected={mode === "files"}
                  icon={<FileArchive size={23} />}
                  title="Small evidence"
                  description="Upload documents, images, audio, video and other files to the application server."
                  detail="Maximum 100 files · 700 MB combined"
                  onClick={() => changeMode("files")}
                />

                <ModeCard
                  selected={mode === "disk"}
                  icon={<HardDrive size={23} />}
                  title="Large evidence"
                  description="Register a forensic disk image that already exists on your bulk-storage server."
                  detail="Storage reference only · no browser upload"
                  onClick={() => changeMode("disk")}
                />
              </div>

              {mode === "disk" && (
                <div className="mt-6 space-y-5 border-t border-gray-100 pt-5">
                  <div>
                    <label
                      htmlFor="diskFormat"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Disk image format
                    </label>

                    <div className="relative">
                      <select
                        id="diskFormat"
                        value={diskFormat}
                        onChange={(event) => {
                          setDiskFormat(event.target.value as DiskFormat);
                          clearMessages();
                        }}
                        className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
                      >
                        <option value="E01">E01 — EnCase evidence image</option>
                        <option value="EX01">Ex01 — Extended evidence image</option>
                        <option value="RAW">RAW / DD / IMG — Raw disk image</option>
                      </select>
                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="storageUrl"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Bulk-storage location *
                    </label>
                    <input
                      id="storageUrl"
                      type="url"
                      value={storageUrl}
                      onChange={(event) => {
                        setStorageUrl(event.target.value);
                        clearMessages();
                      }}
                      placeholder="https://storage.example.com/evidence/image.E01"
                      autoCapitalize="none"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
                    />
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Use the location supplied by your authorized storage
                      system. Prefer a private object reference or an
                      application-controlled storage ID rather than a
                      publicly accessible URL.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="storageObjectId"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Storage object ID / reference *
                    </label>
                    <input
                      id="storageObjectId"
                      value={storageObjectId}
                      onChange={(event) => {
                        setStorageObjectId(event.target.value);
                        clearMessages();
                      }}
                      placeholder="e.g. bulk-evidence-000123"
                      autoComplete="off"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
                    />
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      This identifier should refer to an object that your
                      backend can verify in the approved storage system.
                    </p>
                  </div>

                  <div className="flex gap-3 rounded-xl bg-[#F7F4EE] p-4 text-sm text-gray-700">
                    <Link2
                      size={19}
                      className="mt-0.5 shrink-0 text-[#0F766E]"
                    />
                    <div>
                      <p className="font-semibold">Reference registration</p>
                      <p className="mt-1 leading-6">
                        Only the storage reference and metadata are submitted
                        through this form. The backend must verify the object,
                        record its size and integrity information, and save
                        the database record. The disk-image contents are not
                        sent through this request.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                number="02"
                title="Evidence metadata"
                description="Associate the evidence with the correct case and record its origin."
              />

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  id="caseNumber"
                  label="Case number"
                  required
                  value={metadata.caseNumber}
                  onChange={(value) => updateMetadata("caseNumber", value)}
                  placeholder="e.g. CASE-2026-001"
                />

                <Field
                  id="title"
                  label="Evidence title"
                  required
                  value={metadata.title}
                  onChange={(value) => updateMetadata("title", value)}
                  placeholder="e.g. Workstation evidence"
                />

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={metadata.description}
                    onChange={(event) =>
                      updateMetadata("description", event.target.value)
                    }
                    rows={3}
                    placeholder="Describe the evidence and why it was collected."
                    className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
                  />
                </div>

                <Field
                  id="source"
                  label="Source / originating device"
                  required
                  value={metadata.source}
                  onChange={(value) => updateMetadata("source", value)}
                  placeholder="e.g. Laptop, USB drive, mobile device"
                />

                <Field
                  id="collectedAt"
                  label="Collection date and time"
                  type="datetime-local"
                  value={metadata.collectedAt}
                  onChange={(value) => updateMetadata("collectedAt", value)}
                />

                <div className="sm:col-span-2">
                  <Field
                    id="expectedSha256"
                    label="Expected SHA-256 (optional)"
                    value={metadata.expectedSha256}
                    onChange={(value) =>
                      updateMetadata("expectedSha256", value)
                    }
                    placeholder="64-character hexadecimal hash"
                    autoCapitalize="none"
                  />
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    This is the expected hash supplied by the investigator.
                    The backend must independently verify the stored evidence
                    before marking its integrity as verified.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <Field
                    id="tags"
                    label="Tags (comma-separated)"
                    value={metadata.tags}
                    onChange={(value) => updateMetadata("tags", value)}
                    placeholder="e.g. workstation, incident-42, priority-high"
                  />
                </div>
              </div>
            </section>

            {mode === "files" && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  number="03"
                  title="Select small evidence"
                  description="Choose regular evidence files to upload to the application server."
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelection}
                  className="hidden"
                />

                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  // @ts-expect-error webkitdirectory is supported by browsers
                  webkitdirectory=""
                  onChange={handleFileSelection}
                  className="hidden"
                />

                <div className="mt-5 rounded-2xl border-2 border-dashed border-gray-300 bg-[#F7F4EE]/60 px-5 py-9 text-center transition hover:border-[#F97316]/60">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F97316]/10 text-[#F97316]">
                    <UploadCloud size={28} />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    Select your evidence files
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Add documents, images, audio, video, archives, and other
                    regular evidence files. Maximum 100 files and 700 MB
                    combined.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#171A1F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#30343B]"
                    >
                      <Plus size={17} />
                      Browse files
                    </button>

                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold transition hover:border-[#F97316] hover:text-[#F97316]"
                    >
                      <FolderOpen size={17} />
                      Select folder
                    </button>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">Selected evidence</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedFiles.length}{" "}
                          {selectedFiles.length === 1 ? "file" : "files"} ·{" "}
                          {formatBytes(totalSize)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFiles([]);
                          clearMessages();
                        }}
                        className="text-sm font-medium text-gray-500 transition hover:text-red-600"
                      >
                        Remove all
                      </button>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            {/\.(jpg|jpeg|png|gif|webp|bmp|tiff?)$/i.test(file.name) ? (
                              <FileImage size={19} />
                            ) : /\.(txt|pdf|doc|docx|csv|rtf|odt)$/i.test(file.name) ? (
                              <FileText size={19} />
                            ) : (
                              <FileArchive size={19} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-all text-sm font-medium">
                              {file.webkitRelativePath || file.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {formatBytes(file.size)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            aria-label={`Remove ${file.name}`}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-100 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium">Total selected size</span>
                        <span className="font-semibold tabular-nums">
                          {formatBytes(totalSize)} / 700 MB
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            batchLimitExceeded
                              ? "bg-red-500"
                              : "bg-[#0F766E]"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (totalSize / MAX_BATCH_SIZE) * 100,
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        This is the selected size, not upload progress.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {mode === "disk" && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  number="03"
                  title="Storage registration summary"
                  description="Review the reference before registering the large evidence."
                />

                <div className="mt-5 space-y-3">
                  <SummaryRow
                    label="Registration method"
                    value="Storage reference only"
                  />
                  <SummaryRow label="Disk format" value={diskFormat} />
                  <SummaryRow
                    label="Evidence bytes sent by browser"
                    value="None"
                  />
                  <SummaryRow
                    label="Storage reference"
                    value={storageObjectId.trim() || "Not entered"}
                  />
                </div>

                {storageUrl.trim() && (
                  <a
                    href={storageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-[#0F766E] hover:underline"
                  >
                    <ExternalLink size={16} className="shrink-0" />
                    Inspect storage location
                  </a>
                )}

                <p className="mt-4 text-xs leading-5 text-gray-500">
                  Opening a storage URL is optional and may fail for private
                  storage. Registration must be validated by the backend;
                  this form does not prove that the object exists.
                </p>
              </section>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset form
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Sending request…
                  </>
                ) : mode === "files" ? (
                  <>
                    <UploadCloud size={18} />
                    Upload small evidence
                  </>
                ) : (
                  <>
                    <Link2 size={18} />
                    Register large evidence
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#0F766E]" />
                <h2 className="font-bold">Storage policy</h2>
              </div>

              <div className="mt-5 space-y-4">
                <PolicyRow
                  title="Small evidence"
                  value="Up to 700 MB combined"
                />
                <PolicyRow
                  title="Large evidence"
                  value="Bulk storage + database reference"
                />
                <PolicyRow
                  title="Integrity"
                  value="Backend verification required"
                />
                <PolicyRow
                  title="Access control"
                  value="Authenticated, case-authorized access"
                />
                <PolicyRow
                  title="Audit trail"
                  value="Record every evidence operation"
                />
              </div>

              <div className="mt-5 flex gap-3 rounded-xl bg-[#0F766E]/10 p-4 text-sm text-[#115E59]">
                <LockKeyhole size={19} className="mt-0.5 shrink-0" />
                <p className="leading-6">
                  The backend must enforce authorization, validate storage
                  references, prevent path traversal and SSRF, and maintain
                  chain-of-custody records.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <Info size={19} className="text-[#F97316]" />
                <h2 className="font-bold">Before submitting</h2>
              </div>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-[#0F766E]"
                  />
                  Verify the case number and evidence source.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-[#0F766E]"
                  />
                  Confirm that large evidence already exists in bulk storage.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-[#0F766E]"
                  />
                  Keep original and calculated hashes with the evidence record.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-[#0F766E]"
                  />
                  Confirm backend integrity verification and audit logging.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#171A1F] p-5 text-white sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F97316]">
                FORENSIQ
              </p>
              <h2 className="mt-3 text-xl font-bold">
                Preserve the evidence. Protect its integrity.
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Separate file uploads from storage registration while
                maintaining secure evidence records and chain of custody.
              </p>
            </div>
          </aside>
        </form>

        <footer className="mt-10 border-t border-gray-200 pt-5 text-xs leading-5 text-gray-500">
          <p>
            Active endpoint:{" "}
            <code className="break-all text-gray-700">
              {activeEndpoint}
            </code>
          </p>
          <p className="mt-1">
            Small evidence uses multipart/form-data. Large evidence uses
            application/json.
          </p>
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#171A1F] text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function ModeCard({
  selected,
  icon,
  title,
  description,
  detail,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-[#F97316] bg-[#F97316]/5 ring-2 ring-[#F97316]/10"
          : "border-gray-200 hover:border-gray-400"
      }`}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
          selected
            ? "bg-[#F97316]/10 text-[#F97316]"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {icon}
      </div>
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      <p className="mt-3 text-xs font-medium text-gray-600">{detail}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
        <span
          className={`h-2 w-2 rounded-full ${
            selected ? "bg-[#F97316]" : "bg-gray-300"
          }`}
        />
        {selected ? "Selected" : "Select this type"}
      </div>
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  autoCapitalize,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoCapitalize?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
        {required && <span className="ml-1 text-[#F97316]">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
      />
    </div>
  );
}

function PolicyRow({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-[55%] text-right text-xs leading-5 text-gray-500">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="break-all text-right text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

function Notice({
  type,
  title,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  title: string;
  message: string;
  onDismiss: () => void;
}) {
  const success = type === "success";

  return (
    <div
      role={success ? "status" : "alert"}
      className={`mb-6 flex gap-3 rounded-xl border p-4 text-sm ${
        success
          ? "border-[#0F766E]/30 bg-white"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {success ? (
        <CheckCircle2
          className="mt-0.5 shrink-0 text-[#0F766E]"
          size={20}
        />
      ) : (
        <AlertCircle className="mt-0.5 shrink-0" size={20} />
      )}

      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold ${
            success ? "text-[#0F766E]" : ""
          }`}
        >
          {title}
        </p>
        <p className="mt-1 break-words">{message}</p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
}
