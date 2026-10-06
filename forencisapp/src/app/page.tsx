
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Database,
  FileArchive,
  FileCheck2,
  FileSearch,
  Fingerprint,
  FolderOpen,
  HardDrive,
  History,
  Laptop,
  LockKeyhole,
  MemoryStick,
  Network,
  ScanSearch,
  Server,
  Shield,
  ShieldCheck,
  Smartphone,
  Terminal,
  Timer,
  UserCheck,
  Users,
  Workflow,
} from "lucide-react";

const capabilities = [
  {
    title: "Case Management",
    description:
      "Create investigations, manage case status, assign examiners and keep investigation information organised.",
    icon: FolderOpen,
    tone: "dark",
  },
  {
    title: "Evidence Registry",
    description:
      "Maintain evidence identifiers, source information, acquisition details, metadata and verification values.",
    icon: Database,
    tone: "orange",
  },
  {
    title: "Chain of Custody",
    description:
      "Record evidence transfers, custodians, timestamps and actions throughout the investigation.",
    icon: Workflow,
    tone: "teal",
  },
  {
    title: "Artifact Analysis",
    description:
      "Investigate file-system artifacts, browser traces, system information, metadata and other digital traces.",
    icon: BarChart3,
    tone: "dark",
  },
  {
    title: "Timeline Investigation",
    description:
      "Connect timestamps and digital events to reconstruct activity across the evidence under examination.",
    icon: Clock3,
    tone: "orange",
  },
  {
    title: "Findings & Reports",
    description:
      "Document observations, associate findings with evidence and prepare structured forensic investigation reports.",
    icon: FileSearch,
    tone: "teal",
  },
];

const lifecycle = [
  {
    number: "01",
    title: "Intake",
    description: "Register evidence",
    tone: "dark",
  },
  {
    number: "02",
    title: "Acquisition",
    description: "Record source",
    tone: "light",
  },
  {
    number: "03",
    title: "Verification",
    description: "Verify hashes",
    tone: "orange",
  },
  {
    number: "04",
    title: "Analysis",
    description: "Examine artifacts",
    tone: "light",
  },
  {
    number: "05",
    title: "Findings",
    description: "Document observations",
    tone: "teal",
  },
  {
    number: "06",
    title: "Reporting",
    description: "Produce report",
    tone: "dark",
  },
];

const evidenceTypes = [
  {
    number: "01",
    title: "Disk Images",
    description: "E01 • RAW • AFF",
    icon: HardDrive,
    tone: "dark",
  },
  {
    number: "02",
    title: "Memory",
    description: "RAM captures",
    icon: MemoryStick,
    tone: "orange",
  },
  {
    number: "03",
    title: "Mobile",
    description: "Device extractions",
    icon: Smartphone,
    tone: "teal",
  },
  {
    number: "04",
    title: "Network",
    description: "PCAP • Traffic",
    icon: Network,
    tone: "dark",
  },
  {
    number: "05",
    title: "Browser",
    description: "History • Cache",
    icon: Laptop,
    tone: "orange",
  },
  {
    number: "06",
    title: "File System",
    description: "Files • Metadata",
    icon: Server,
    tone: "teal",
  },
];

const evidenceItems = [
  {
    name: "workstation-image.E01",
    id: "EV-0147-001",
    icon: HardDrive,
    tone: "orange",
  },
  {
    name: "mobile-extraction.zip",
    id: "EV-0147-008",
    icon: Smartphone,
    tone: "teal",
  },
  {
    name: "memory-capture.raw",
    id: "EV-0147-013",
    icon: MemoryStick,
    tone: "dark",
  },
];

function SectionLabel({
  children,
  tone = "orange",
}: {
  children: React.ReactNode;
  tone?: "orange" | "teal";
}) {
  return (
    <div
      className={`text-xs font-black uppercase tracking-[0.2em] ${
        tone === "orange" ? "text-[#F97316]" : "text-[#0F766E]"
      }`}
    >
      {children}
    </div>
  );
}

function ToneIcon({
  icon: Icon,
  tone,
}: {
  icon: React.ElementType;
  tone: string;
}) {
  const styles: Record<string, string> = {
    dark: "bg-[#171A1F] text-white",
    orange: "bg-[#F97316]/10 text-[#F97316]",
    teal: "bg-[#0F766E]/10 text-[#0F766E]",
  };

  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
        styles[tone] ?? styles.dark
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-full bg-[#0F766E]/5 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-[#CCC8BF] bg-white shadow-[0_35px_100px_rgba(23,26,31,0.15)]">
        {/* Window header */}
        <div className="flex h-11 items-center justify-between border-b border-[#E5E1D9] bg-[#FAF9F6] px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D6D1C8]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D6D1C8]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#D6D1C8]" />
          </div>

          <div className="font-mono text-[9px] text-[#8B8983]">
            forensic.workspace / case / 0147
          </div>

          <div className="w-10" />
        </div>

        <div className="flex min-h-[510px]">
          {/* Sidebar */}
          <aside className="hidden w-44 border-r border-[#E5E1D9] bg-[#F8F7F4] p-4 sm:block">
            <div className="mb-4 text-[9px] font-black uppercase tracking-[0.15em] text-[#99958D]">
              Investigation
            </div>

            <div className="space-y-1">
              {[
                "Case Overview",
                "Evidence",
                "Artifacts",
                "Timeline",
                "Findings",
                "Reports",
              ].map((item, index) => (
                <div
                  key={item}
                  className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${
                    index === 0
                      ? "bg-[#171A1F] font-bold text-white"
                      : "text-[#777773]"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-[#E1DDD5] pt-5">
              <div className="mb-3 text-[9px] font-black uppercase tracking-[0.15em] text-[#99958D]">
                Governance
              </div>

              <div className="space-y-1">
                <div className="px-3 py-2 text-[10px] font-semibold text-[#777773]">
                  Chain of Custody
                </div>
                <div className="px-3 py-2 text-[10px] font-semibold text-[#777773]">
                  Audit Log
                </div>
              </div>
            </div>
          </aside>

          {/* Main dashboard */}
          <div className="min-w-0 flex-1 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#99958D]">
                  Investigation
                </div>

                <h3 className="mt-1 text-base font-black sm:text-lg">
                  CASE-2026-0147
                </h3>

                <p className="mt-1 text-[10px] text-[#777773]">
                  Unauthorized Access Investigation
                </p>
              </div>

              <div className="rounded-full bg-[#0F766E]/10 px-2.5 py-1 text-[8px] font-black text-[#0F766E]">
                ACTIVE CASE
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                ["Evidence", "24"],
                ["Artifacts", "386"],
                ["Findings", "12"],
                ["Integrity", "100%"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className="rounded-xl border border-[#E5E1D9] bg-[#FDFCF9] p-3"
                >
                  <div className="text-[8px] uppercase tracking-wide text-[#99958D]">
                    {label}
                  </div>

                  <div
                    className={`mt-1 text-xl font-black ${
                      index === 3 ? "text-[#0F766E]" : "text-[#171A1F]"
                    }`}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Evidence */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-[11px] font-black">Evidence</h4>

                <span className="text-[8px] font-semibold text-[#99958D]">
                  Latest activity
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#E5E1D9]">
                {evidenceItems.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 px-3 py-3 ${
                        index !== evidenceItems.length - 1
                          ? "border-b border-[#EEEAE3]"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            item.tone === "orange"
                              ? "bg-[#F97316]/10 text-[#F97316]"
                              : item.tone === "teal"
                                ? "bg-[#0F766E]/10 text-[#0F766E]"
                                : "bg-[#171A1F]/5 text-[#171A1F]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-[9px] font-bold">
                            {item.name}
                          </div>

                          <div className="font-mono text-[8px] text-[#99958D]">
                            {item.id}
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 rounded bg-[#0F766E]/10 px-2 py-1 text-[7px] font-black text-[#0F766E]">
                        VERIFIED
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Integrity */}
            <div className="mt-5 rounded-xl bg-[#171A1F] p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[7px] uppercase tracking-[0.16em] text-[#858984]">
                    Latest Integrity Check
                  </div>

                  <div className="mt-1 font-mono text-[9px]">SHA-256</div>
                </div>

                <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#5EE0D0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5EE0D0]" />
                  PASSED
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="mt-5 flex items-center justify-between text-[8px] text-[#99958D]">
              <span>Last verification</span>
              <span className="font-mono">2m 14s ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F3EE] text-[#171A1F]">
      {/* ============================================================
          HERO
      ============================================================ */}

      <section className="relative pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(#171A1F_1px,transparent_1px),linear-gradient(90deg,#171A1F_1px,transparent_1px)] [background-size:44px_44px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -right-[10%] -top-40 h-[600px] w-[600px] rounded-full bg-[#F97316]/5 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-28 sm:pt-20 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Hero content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D4CB] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#0F766E] shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-[#0F766E]/50" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                </span>
                Digital Evidence Investigation
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-[72px]">
                Evidence tells
                <span className="block text-[#F97316]">the story.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-[#62635F]">
                FORENSIQ is a professional digital forensics workspace designed
                to help investigators manage cases, preserve evidence
                integrity, document custody and transform digital artifacts
                into defensible findings.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/cases"
                  className="group inline-flex items-center gap-3 rounded-xl bg-[#171A1F] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#292D32] hover:shadow-2xl"
                >
                  Start Investigation

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="#capabilities"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#D5D1C8] bg-white px-6 py-3.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F97316] hover:shadow-md"
                >
                  Explore Platform
                  <ArrowDownIcon />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
                {[
                  "Evidence Integrity",
                  "Chain of Custody",
                  "Investigation Audit",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-semibold"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F766E]/10 text-[#0F766E]">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ============================================================
          CAPABILITIES
      ============================================================ */}

      <section
        id="capabilities"
        className="border-y border-[#DEDAD1] bg-white py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <SectionLabel>Forensic Capabilities</SectionLabel>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
              Built for the{" "}
              <span className="text-[#0F766E]">investigation process.</span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#686965]">
              FORENSIQ brings the operational side of digital forensics into a
              structured workspace where evidence, analysis, custody and
              findings remain connected.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-[#DDD9D0] bg-[#F9F8F5] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#CFC9BD] hover:bg-white hover:shadow-xl hover:shadow-black/[0.04]"
                >
                  <ToneIcon icon={Icon} tone={item.tone} />

                  <h3 className="mt-6 text-xl font-black">{item.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-[#686965]">
                    {item.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1 text-xs font-bold text-[#171A1F] opacity-0 transition-opacity group-hover:opacity-100">
                    Explore capability
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          LIFECYCLE
      ============================================================ */}

      <section id="workflow" className="bg-[#F5F3EE] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel tone="teal">Evidence Lifecycle</SectionLabel>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
              From evidence intake{" "}
              <span className="text-[#F97316]">to documented findings.</span>
            </h2>
          </div>

          <div className="relative mt-16">
            <div className="absolute left-[8%] right-[8%] top-8 hidden h-px bg-[#D2CEC5] lg:block" />

            <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
              {lifecycle.map((item) => (
                <div key={item.number} className="text-center">
                  <div
                    className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl font-black shadow-sm ${
                      item.tone === "dark"
                        ? "bg-[#171A1F] text-white"
                        : item.tone === "orange"
                          ? "bg-[#F97316] text-white"
                          : item.tone === "teal"
                            ? "bg-[#0F766E] text-white"
                            : "border border-[#D5D1C8] bg-white text-[#171A1F]"
                    }`}
                  >
                    {item.number}
                  </div>

                  <h3 className="mt-5 text-sm font-black">{item.title}</h3>

                  <p className="mt-2 text-xs leading-5 text-[#777773]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          INTEGRITY
      ============================================================ */}

      <section className="relative overflow-hidden bg-[#171A1F] py-24 text-white">
        <div
          aria-hidden
          className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#F97316]/5 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <SectionLabel>Evidence Integrity</SectionLabel>

              <h2 className="mt-5 text-4xl font-black leading-tight tracking-[-0.045em] sm:text-5xl">
                Every evidence item{" "}
                <span className="text-[#F97316]">leaves a trace.</span>
              </h2>

              <p className="mt-6 text-lg leading-8 text-[#A9ABA8]">
                FORENSIQ keeps evidence metadata, cryptographic verification,
                custody events and investigator activity connected to the
                investigation record.
              </p>

              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#F97316]/30">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#F97316]" />
                    <div className="text-xl font-black text-[#F97316]">
                      SHA-256
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#8F928F]">
                    Cryptographic integrity verification
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#0F766E]/40">
                  <div className="flex items-center gap-3">
                    <History className="h-5 w-5 text-[#4FD4C6]" />
                    <div className="text-xl font-black text-[#4FD4C6]">
                      AUDIT
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#8F928F]">
                    Investigation activity history
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence manifest */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#20242A] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#777C78]">
                    Evidence Manifest
                  </div>

                  <div className="mt-1 text-sm font-black">
                    EV-0147-003
                  </div>
                </div>

                <div className="rounded-full bg-[#0F766E]/20 px-3 py-1 text-[8px] font-black text-[#54D7CA]">
                  VERIFIED
                </div>
              </div>

              <div className="p-6 font-mono text-xs">
                {[
                  ["EVIDENCE TYPE", "DISK IMAGE"],
                  ["FORMAT", "E01"],
                  ["SIZE", "512.8 GB"],
                  ["STATUS", "PRESERVED"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-5 border-b border-white/5 py-3 last:border-0"
                  >
                    <span className="text-[#707570]">{label}</span>

                    <span
                      className={
                        label === "STATUS" ? "text-[#54D7CA]" : "text-white"
                      }
                    >
                      {value}
                    </span>
                  </div>
                ))}

                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="mb-3 text-[#707570]">SHA-256 HASH</div>

                  <div className="break-all leading-6 text-[#F97316]">
                    7d4f2c1e9a3f8c2b1d6e8f7a21c4b5e903d91a6c4e8f72b1d09c6a4f9ac
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 font-bold text-[#54D7CA]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#54D7CA]" />
                  INTEGRITY VERIFICATION PASSED
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          EVIDENCE TYPES
      ============================================================ */}

      <section id="evidence" className="border-b border-[#DEDAD1] bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionLabel>Digital Evidence</SectionLabel>

              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
                One investigation.{" "}
                <span className="text-[#0F766E]">
                  Multiple evidence sources.
                </span>
              </h2>

              <p className="mt-6 text-lg leading-8 text-[#686965]">
                Build a connected investigation record around the different
                sources of digital evidence examined during a case.
              </p>

              <Link
                href="/evidence"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-black"
              >
                Explore evidence management
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {evidenceTypes.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-[#DDD9D0] bg-[#F9F8F5] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
                  >
                    <div
                      className={`text-2xl font-black ${
                        item.tone === "orange"
                          ? "text-[#F97316]"
                          : item.tone === "teal"
                            ? "text-[#0F766E]"
                            : "text-[#171A1F]"
                      }`}
                    >
                      {item.number}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <h3 className="text-sm font-black">{item.title}</h3>

                      <Icon className="h-4 w-4 text-[#99958D] transition-colors group-hover:text-[#F97316]" />
                    </div>

                    <div className="mt-2 text-xs text-[#777773]">
                      {item.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECURITY / GOVERNANCE
      ============================================================ */}

      <section className="bg-[#F5F3EE] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#DDD9D0] bg-white p-7">
              <LockKeyhole className="h-6 w-6 text-[#F97316]" />

              <h3 className="mt-5 text-lg font-black">
                Controlled Access
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#686965]">
                Structure access around authenticated investigators and
                controlled investigation workflows.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDD9D0] bg-white p-7">
              <Fingerprint className="h-6 w-6 text-[#0F766E]" />

              <h3 className="mt-5 text-lg font-black">
                Evidence Identity
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#686965]">
                Maintain unique evidence identifiers and verification context
                throughout the investigation.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDD9D0] bg-white p-7">
              <UserCheck className="h-6 w-6 text-[#171A1F]" />

              <h3 className="mt-5 text-lg font-black">
                Accountability
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#686965]">
                Keep investigator actions, custody events and investigation
                history connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA
      ============================================================ */}

      <section className="relative overflow-hidden bg-[#F5F3EE] py-28">
        <div
          aria-hidden
          className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#F97316]/5 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D4CB] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#0F766E] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
            Forensic Investigation Workspace
          </div>

          <h2 className="mt-7 text-4xl font-black leading-tight tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            Turn digital evidence
            <span className="block text-[#F97316]">
              into documented findings.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#686965]">
            Manage the investigation, preserve evidence context, verify
            integrity and document your forensic findings from one
            professional workspace.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/cases"
              className="group inline-flex items-center gap-3 rounded-xl bg-[#171A1F] px-7 py-4 text-sm font-black text-white shadow-xl shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#292D32]"
            >
              Create Investigation

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center rounded-xl border border-[#D5D1C8] bg-white px-7 py-4 text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-[#F97316] hover:shadow-md"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-x-7 gap-y-3 text-xs font-semibold text-[#777773]">
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#0F766E]" />
              Evidence-focused
            </span>

            <span className="inline-flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#F97316]" />
              Audit-ready workflows
            </span>

            <span className="inline-flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#171A1F]" />
              Investigator workspace
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

function ArrowDownIcon() {
  return (
    <ChevronRight className="h-4 w-4 rotate-90 text-[#777773]" />
  );
}

