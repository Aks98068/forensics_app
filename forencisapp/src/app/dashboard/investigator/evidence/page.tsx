"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileArchive,
  FileImage,
  FileText,
  FolderOpen,
  HardDrive,
  Info,
  LoaderCircle,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type UploadMode = "disk" | "files";
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

type ApiError = {
  message?: string;
  error?: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://edutechpro.noline"
).replace(/\/+$/, "");

const UPLOAD_ENDPOINT = `${API_BASE_URL}/api/v1/evidence/upload`;

const MAX_DISK_SIZE = 500_000_000_000;
const MAX_BATCH_SIZE = 700_000_000;
const MAX_FILES = 100;

const INITIAL_METADATA: EvidenceMetadata = {
  caseNumber: "",
  title: "",
  description: "",
  source: "",
  collectedAt: "",
  expectedSha256: "",
  tags: "",
};

const DISK_EXTENSIONS: Record<DiskFormat, string[]> = {
  E01: [".e01"],
  EX01: [".ex01"],
  RAW: [".raw", ".dd", ".img"],
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

function isValidSha256(value: string): boolean {
  return value === "" || /^[a-fA-F0-9]{64}$/.test(value.trim());
}

function getErrorMessage(
  body: ApiError | null,
  fallback: string,
): string {
  return body?.message || body?.error || fallback;
}

export default function UploadEvidencePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const diskInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<UploadMode>("files");
  const [diskFormat, setDiskFormat] = useState<DiskFormat>("E01");
  const [metadata, setMetadata] =
    useState<EvidenceMetadata>(INITIAL_METADATA);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSize = useMemo(
    () => selectedFiles.reduce((total, file) => total + file.size, 0),
    [selectedFiles],
  );

  const diskLimitExceeded = totalSize > MAX_DISK_SIZE;
  const batchLimitExceeded = totalSize > MAX_BATCH_SIZE;

  function updateMetadata(
    field: keyof EvidenceMetadata,
    value: string,
  ) {
    setMetadata((current) => ({ ...current, [field]: value }));
    setErrors([]);
    setApiError("");
    setSuccessMessage("");
  }

  function addFiles(incoming: FileList | File[] | null) {
    if (!incoming) return;

    const incomingFiles = Array.from(incoming);

    setSelectedFiles((current) => {
      const combined = [...current];

      for (const file of incomingFiles) {
        const alreadyAdded = combined.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified &&
            existing.webkitRelativePath === file.webkitRelativePath,
        );

        if (!alreadyAdded) combined.push(file);
      }

      return combined;
    });

    setErrors([]);
    setApiError("");
    setSuccessMessage("");
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
    setErrors([]);
    setApiError("");
    setSuccessMessage("");
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

    if (!selectedFiles.length) {
      validationErrors.push("Select at least one evidence file.");
    }

    if (!isValidSha256(metadata.expectedSha256)) {
      validationErrors.push(
        "The expected SHA-256 must contain exactly 64 hexadecimal characters.",
      );
    }

    if (mode === "disk") {
      if (selectedFiles.length !== 1) {
        validationErrors.push(
          "Select exactly one disk image per upload session.",
        );
      }

      if (totalSize > MAX_DISK_SIZE) {
        validationErrors.push("The disk image exceeds the 500 GB limit.");
      }

      const file = selectedFiles[0];

      if (file && !DISK_EXTENSIONS[diskFormat].includes(getExtension(file.name))) {
        validationErrors.push(
          `The selected file does not match the ${diskFormat} format.`,
        );
      }
    } else {
      if (selectedFiles.length > MAX_FILES) {
        validationErrors.push("Select no more than 100 files.");
      }

      if (totalSize > MAX_BATCH_SIZE) {
        validationErrors.push("The selected files exceed the 700 MB total limit.");
      }
    }

    return validationErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setApiError("");
    setSuccessMessage("");

    const validationErrors = validateForm();

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    const formData = new FormData();

    formData.append("mode", mode);

    if (mode === "disk") {
      formData.append("diskFormat", diskFormat);
    }

    const metadataPayload = {
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

    formData.append("metadata", JSON.stringify(metadataPayload));

    for (const file of selectedFiles) {
      formData.append("files", file, file.name);
    }

    try {
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";
      let responseBody: ApiError | null = null;

      if (contentType.includes("application/json")) {
        responseBody = (await response.json()) as ApiError;
      } else {
        const responseText = await response.text();
        responseBody = responseText
          ? { message: responseText }
          : null;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            responseBody,
            `Upload request failed with HTTP ${response.status}.`,
          ),
        );
      }

      setSuccessMessage(
        getErrorMessage(
          responseBody,
          "The server accepted the upload request.",
        ),
      );

      // Clear the selected files only after a successful HTTP response.
      setSelectedFiles([]);
      setMetadata(INITIAL_METADATA);
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

  const acceptedDiskExtensions = DISK_EXTENSIONS[diskFormat].join(",");

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
              Upload evidence
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Register digital evidence against a case. Review the files and
              metadata before sending the request to the evidence server.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <LockKeyhole size={17} className="text-[#0F766E]" />
            Authenticated access required
          </div>
        </header>

        {successMessage && (
          <div
            role="status"
            className="mb-6 flex gap-3 rounded-xl border border-[#0F766E]/30 bg-white p-4 text-sm"
          >
            <CheckCircle2
              className="mt-0.5 shrink-0 text-[#0F766E]"
              size={20}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#0F766E]">
                Server response received
              </p>
              <p className="mt-1 break-words text-gray-700">
                {successMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss success message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {apiError && (
          <div
            role="alert"
            className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Upload request failed</p>
              <p className="mt-1 break-words">{apiError}</p>
              <p className="mt-2 text-xs">
                Your selected files remain available on this page. Check the
                server and try again.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setApiError("")}
              aria-label="Dismiss error message"
            >
              <X size={18} />
            </button>
          </div>
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
                title="Evidence type"
                description="Choose the type of evidence you want to register."
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ModeCard
                  selected={mode === "files"}
                  icon={<FileArchive size={23} />}
                  title="Files and folders"
                  description="Documents, images, archives, and other digital evidence."
                  onClick={() => {
                    setMode("files");
                    setSelectedFiles([]);
                    setErrors([]);
                    setApiError("");
                    setSuccessMessage("");
                  }}
                />

                <ModeCard
                  selected={mode === "disk"}
                  icon={<HardDrive size={23} />}
                  title="Disk image"
                  description="A single forensic image, with a maximum size of 500 GB."
                  onClick={() => {
                    setMode("disk");
                    setSelectedFiles([]);
                    setErrors([]);
                    setApiError("");
                    setSuccessMessage("");
                  }}
                />
              </div>

              {mode === "disk" && (
                <div className="mt-5">
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
                        setSelectedFiles([]);
                        setErrors([]);
                        setApiError("");
                        setSuccessMessage("");
                      }}
                      className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
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

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    This selection checks the filename extension in the
                    browser. The backend must verify the actual file format.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                number="02"
                title="Evidence metadata"
                description="Provide enough information to identify the evidence and its origin."
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
                  placeholder="e.g. Workstation disk image"
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
                    className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
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
                  <p className="mt-2 text-xs text-gray-500">
                    This is a hash supplied by you, not a verified hash. The
                    server must independently calculate and compare it.
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

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <SectionHeading
                number="03"
                title="Select evidence"
                description={
                  mode === "disk"
                    ? "Choose one disk image. Maximum size: 500 GB."
                    : "Choose files, folder contents, or ZIP archives. Maximum 100 files and 700 MB combined."
                }
              />

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={mode === "disk" ? acceptedDiskExtensions : undefined}
                onChange={handleFileSelection}
                className="hidden"
              />

              <input
                ref={diskInputRef}
                type="file"
                accept={acceptedDiskExtensions}
                onChange={handleFileSelection}
                className="hidden"
              />

              <input
                ref={folderInputRef}
                type="file"
                multiple
                onChange={handleFileSelection}
                className="hidden"
              />

              <div className="mt-5 rounded-2xl border-2 border-dashed border-gray-300 bg-[#F7F4EE]/60 px-5 py-9 text-center transition hover:border-[#F97316]/60">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F97316]/10 text-[#F97316]">
                  <UploadCloud size={28} />
                </div>

                <h3 className="mt-4 font-semibold">
                  {mode === "disk"
                    ? "Select a disk image"
                    : "Select your evidence files"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {mode === "disk"
                    ? "Select one E01, Ex01, RAW, DD, or IMG image matching the selected format."
                    : "Add individual files or select multiple items. You can also select the contents of a folder."}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      mode === "disk"
                        ? diskInputRef.current?.click()
                        : fileInputRef.current?.click()
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#171A1F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#30343B]"
                  >
                    <Plus size={17} />
                    Browse files
                  </button>

                  {mode === "files" && (
                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold transition hover:border-[#F97316] hover:text-[#F97316]"
                    >
                      <FolderOpen size={17} />
                      Select folder
                    </button>
                  )}
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  {mode === "disk"
                    ? "One image per session"
                    : "ZIP files are treated as evidence files; their contents are not extracted in the browser."}
                </p>
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
                      onClick={() => setSelectedFiles([])}
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
                          {getExtension(file.name) === ".zip" ? (
                            <FileArchive size={19} />
                          ) : /\.(jpg|jpeg|png|gif|img)$/i.test(file.name) ? (
                            <FileImage size={19} />
                          ) : /\.(txt|pdf|doc|docx|csv)$/i.test(file.name) ? (
                            <FileText size={19} />
                          ) : (
                            <HardDrive size={19} />
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
                        {formatBytes(totalSize)} /{" "}
                        {mode === "disk"
                          ? "500 GB"
                          : "700 MB"}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (mode === "disk" && diskLimitExceeded) ||
                          (mode === "files" && batchLimitExceeded)
                            ? "bg-red-500"
                            : "bg-[#0F766E]"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (totalSize /
                              (mode === "disk"
                                ? MAX_DISK_SIZE
                                : MAX_BATCH_SIZE)) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      This indicates the size of your selection, not upload
                      progress.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedFiles([]);
                  setMetadata(INITIAL_METADATA);
                  setErrors([]);
                  setApiError("");
                  setSuccessMessage("");
                }}
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
                ) : (
                  <>
                    <UploadCloud size={18} />
                    Submit evidence
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#0F766E]" />
                <h2 className="font-bold">Upload policy</h2>
              </div>

              <div className="mt-5 space-y-4">
                <PolicyRow
                  title="Disk image"
                  value="1 image · max 500 GB"
                />
                <PolicyRow
                  title="Files and folders"
                  value="100 files · max 700 MB total"
                />
                <PolicyRow
                  title="Integrity"
                  value="Server-side verification required"
                />
                <PolicyRow
                  title="Evidence handling"
                  value="Uploaded content must never be executed"
                />
              </div>

              <div className="mt-5 flex gap-3 rounded-xl bg-[#0F766E]/10 p-4 text-sm text-[#115E59]">
                <LockKeyhole size={19} className="mt-0.5 shrink-0" />
                <p className="leading-6">
                  Only upload evidence you are authorized to handle. Access
                  controls, storage permissions, and audit records must be
                  enforced by the backend.
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
                  Confirm the case number and evidence source.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-[#0F766E]"
                  />
                  Keep an independent record of any known original hash.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-[#0F766E]"
                  />
                  Do not assume a successful HTTP response means integrity
                  verification is complete.
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
                Evidence receipt, cryptographic verification, secure storage,
                and chain-of-custody records must be confirmed by the server.
              </p>
            </div>
          </aside>
        </form>

        <footer className="mt-10 border-t border-gray-200 pt-5 text-xs leading-5 text-gray-500">
          API endpoint:{" "}
          <code className="break-all text-gray-700">
            {UPLOAD_ENDPOINT}
          </code>
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
  onClick,
}: {
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
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