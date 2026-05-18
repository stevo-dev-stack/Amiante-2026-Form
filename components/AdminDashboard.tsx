"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  id: string;
  code: string;
  site: string;
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  documentName: string;
  documentPath: string | null;
  dropDate: string;
  dropTime: string;
  epiDate: string;
  epiTime: string;
  status: string;
  notes: string | null;
  validatedBy: string | null;
  createdAt: string;
};

function formatDateFR(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "En attente", color: "#7a6020", bg: "#fff8e8" },
  validated: { label: "Validé", color: "#0d6e4f", bg: "#e8f5ef" },
  rejected: { label: "Refusé", color: "#c04040", bg: "#fff0f0" },
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 8,
  border: "1.5px solid #dde3ec",
  fontSize: 12.5,
  fontFamily: "inherit",
  color: "#1a2e44",
  background: "#fff",
  boxSizing: "border-box",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  borderRadius: 8,
  border: "1.5px solid #dde3ec",
  fontSize: 12.5,
  fontFamily: "inherit",
  color: "#1a2e44",
  background: "#fff",
  boxSizing: "border-box",
};

export default function AdminDashboard({
  currentAdmin,
}: {
  currentAdmin: string;
}) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [filterSite, setFilterSite] = useState("all");
  const [filterBy, setFilterBy] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/submissions");
    if (res.ok) setSubmissions(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Derived option lists (computed from live data)
  const siteOptions = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.site))).sort(),
    [submissions],
  );
  const validatorOptions = useMemo(
    () =>
      Array.from(
        new Set(submissions.map((s) => s.validatedBy).filter(Boolean)),
      ) as string[],
    [submissions],
  );

  // Badge count for advanced filters only (not status/search)
  const activeExtrasCount = [
    filterSite !== "all",
    filterBy !== "all",
    !!filterDateFrom,
    !!filterDateTo,
    sortOrder !== "desc",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterSite("all");
    setFilterBy("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortOrder("desc");
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const openDetail = (s: Submission) => {
    setSelected(s);
    setNotes(s.notes ?? "");
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/submissions/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubmissions((ss) =>
        ss.map((s) => (s.id === updated.id ? updated : s)),
      );
      setSelected(updated);
    }
    setSaving(false);
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/submissions/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected.status, notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubmissions((ss) =>
        ss.map((s) => (s.id === updated.id ? updated : s)),
      );
      setSelected(updated);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    }
    setSaving(false);
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Supprimer ce dossier définitivement ?")) return;
    await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
    setSubmissions((ss) => ss.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  // ── Filtering + sorting ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = submissions.filter((s) => {
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (filterSite !== "all" && s.site !== filterSite) return false;
      if (filterBy === "__none__" && s.validatedBy !== null) return false;
      if (
        filterBy !== "all" &&
        filterBy !== "__none__" &&
        s.validatedBy !== filterBy
      )
        return false;
      if (filterDateFrom && s.dropDate < filterDateFrom) return false;
      if (filterDateTo && s.dropDate > filterDateTo) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.code.toLowerCase().includes(q) ||
          s.nom.toLowerCase().includes(q) ||
          s.prenom.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.site.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return result;
  }, [
    submissions,
    filterStatus,
    filterSite,
    filterBy,
    filterDateFrom,
    filterDateTo,
    search,
    sortOrder,
  ]);

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    validated: submissions.filter((s) => s.status === "validated").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#0d6e4f",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "-0.5px",
            }}
          >
            SITCOM
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Administration Collecte Amiante 2026
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            👤 {currentAdmin}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div
          style={{
            width: 420,
            borderRight: "1px solid #e0e7ef",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Status tabs */}
          <div style={{ padding: "14px 14px 0" }}>
            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
              {(["all", "pending", "validated", "rejected"] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      flex: 1,
                      padding: "5px 2px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      border:
                        filterStatus === s
                          ? "2px solid #0d6e4f"
                          : "1.5px solid #dde3ec",
                      background: filterStatus === s ? "#e8f5ef" : "#fff",
                      color: filterStatus === s ? "#0d6e4f" : "#4a6070",
                    }}
                  >
                    {s === "all" ? "Tous" : STATUS_LABELS[s].label} ({counts[s]}
                    )
                  </button>
                ),
              )}
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 8 }}>
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  color: "#8a9ab0",
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                type="search"
                placeholder="Nom, code, email, site…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 30 }}
              />
            </div>

            {/* Expand filters toggle */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              style={{
                width: "100%",
                marginBottom: 10,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1.5px solid #dde3ec",
                background: activeExtrasCount > 0 ? "#e8f5ef" : "#f8fafc",
                color: activeExtrasCount > 0 ? "#0d6e4f" : "#4a6070",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "inherit",
              }}
            >
              <span>
                Filtres avancés
                {activeExtrasCount > 0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      background: "#0d6e4f",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: 11,
                    }}
                  >
                    {activeExtrasCount}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>
                {filtersOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* Advanced filters panel */}
            {filtersOpen && (
              <div
                style={{
                  background: "#f4f7fb",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  border: "1.5px solid #e0e7ef",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {/* Site */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#4a6070",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    📍 Site
                  </label>
                  <select
                    value={filterSite}
                    onChange={(e) => setFilterSite(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="all">Tous les sites</option>
                    {siteOptions.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date de dépôt */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#4a6070",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    📅 Date de dépôt (du / au)
                  </label>
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <span
                      style={{ fontSize: 12, color: "#8a9ab0", flexShrink: 0 }}
                    >
                      →
                    </span>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                </div>

                {/* Traité par */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#4a6070",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    👤 Traité par
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="all">Tous</option>
                    <option value="__none__">Non traité</option>
                    {validatorOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#4a6070",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    ↕ Tri par date de soumission
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    style={selectStyle}
                  >
                    <option value="desc">Plus récents en premier</option>
                    <option value="asc">Plus anciens en premier</option>
                  </select>
                </div>

                {/* Reset */}
                <button
                  onClick={resetFilters}
                  style={{
                    padding: "7px",
                    borderRadius: 8,
                    border: "1.5px solid #f0a0a0",
                    background: "#fff0f0",
                    color: "#c04040",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ✕ Réinitialiser tous les filtres
                </button>
              </div>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#8a9ab0",
                  fontSize: 14,
                  marginTop: 40,
                }}
              >
                Chargement…
              </p>
            ) : filtered.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#8a9ab0",
                  fontSize: 14,
                  marginTop: 40,
                }}
              >
                Aucun dossier
              </p>
            ) : (
              filtered.map((s) => {
                const st = STATUS_LABELS[s.status] ?? STATUS_LABELS.pending;
                return (
                  <div
                    key={s.id}
                    onClick={() => openDetail(s)}
                    style={{
                      padding: "13px 14px",
                      borderBottom: "1px solid #f0f4f8",
                      cursor: "pointer",
                      background: selected?.id === s.id ? "#e8f5ef" : "#fff",
                      borderLeft:
                        selected?.id === s.id
                          ? "3px solid #0d6e4f"
                          : "3px solid transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 13.5,
                          color: "#1a2e44",
                        }}
                      >
                        {s.prenom} {s.nom}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: st.color,
                          background: st.bg,
                          padding: "2px 8px",
                          borderRadius: 10,
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        fontSize: 12,
                        color: "#6a7f90",
                      }}
                    >
                      <span>📍 {s.site}</span>
                      <span>·</span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "#0d6e4f",
                        }}
                      >
                        {s.code}
                      </span>
                    </div>
                    <div
                      style={{ fontSize: 11.5, color: "#8a9ab0", marginTop: 2 }}
                    >
                      Dépôt : {formatDateFR(s.dropDate)} {s.dropTime}
                      {s.validatedBy && (
                        <span
                          style={{
                            marginLeft: 6,
                            color: "#0d6e4f",
                            fontWeight: 700,
                          }}
                        >
                          · ✅ {s.validatedBy}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Results counter + quick reset */}
          <div
            style={{
              padding: "8px 14px",
              borderTop: "1px solid #e0e7ef",
              fontSize: 12,
              color: "#8a9ab0",
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <span>
              {filtered.length} dossier{filtered.length !== 1 ? "s" : ""}
              {filtered.length !== submissions.length &&
                ` sur ${submissions.length}`}
            </span>
            {(activeExtrasCount > 0 || search || filterStatus !== "all") && (
              <button
                onClick={resetFilters}
                style={{
                  fontSize: 11,
                  color: "#c04040",
                  fontWeight: 700,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕ Effacer
              </button>
            )}
          </div>
        </div>

        {/* ── Detail panel ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {!selected ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#8a9ab0",
              }}
            >
              <span style={{ fontSize: 48, marginBottom: 12 }}>📋</span>
              <p style={{ fontSize: 15 }}>
                Sélectionnez un dossier pour voir les détails
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: 600 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#1a2e44",
                    }}
                  >
                    {selected.prenom} {selected.nom}
                  </h2>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      color: "#6a7f90",
                    }}
                  >
                    Code :{" "}
                    <strong
                      style={{ fontFamily: "monospace", color: "#0d6e4f" }}
                    >
                      {selected.code}
                    </strong>
                    {" · "}
                    {new Date(selected.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {selected.validatedBy && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color: "#0d6e4f",
                        fontWeight: 700,
                      }}
                    >
                      ✅ Traité par : {selected.validatedBy}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteSubmission(selected.id)}
                  style={{
                    background: "#fff0f0",
                    border: "1px solid #f0a0a0",
                    color: "#c04040",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🗑 Supprimer
                </button>
              </div>

              {/* Info blocks */}
              {[
                {
                  title: "Informations personnelles",
                  rows: [
                    ["Site", `📍 ${selected.site}`],
                    ["Adresse", selected.adresse],
                    ["Email", selected.email],
                  ],
                },
                {
                  title: "RDV Dépôt déchets",
                  rows: [
                    ["Date", formatDateFR(selected.dropDate)],
                    ["Heure", selected.dropTime],
                  ],
                },
                {
                  title: "RDV Remise EPI",
                  rows: [
                    ["Date", formatDateFR(selected.epiDate)],
                    ["Heure", selected.epiTime],
                  ],
                },
              ].map((block) => (
                <div
                  key={block.title}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e0e7ef",
                    borderRadius: 10,
                    marginBottom: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#eef2f7",
                      padding: "8px 14px",
                      borderBottom: "1px solid #e0e7ef",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#4a6070",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {block.title}
                    </p>
                  </div>
                  <div style={{ padding: "10px 14px" }}>
                    {block.rows.map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: "1px solid #f0f4f8",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            color: "#8a9ab0",
                            fontWeight: 600,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "#1a2e44",
                            fontWeight: 700,
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Document */}
              {selected.documentPath && (
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e0e7ef",
                    borderRadius: 10,
                    marginBottom: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "#eef2f7",
                      padding: "8px 14px",
                      borderBottom: "1px solid #e0e7ef",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#4a6070",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Justificatif de domicile
                    </p>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <a
                      href={selected.documentPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#0d6e4f",
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: "none",
                      }}
                    >
                      📎 {selected.documentName}
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6a7f90",
                          fontWeight: 400,
                        }}
                      >
                        (ouvrir)
                      </span>
                    </a>
                  </div>
                </div>
              )}

              {/* Status actions */}
              <div
                style={{
                  background: "#fff",
                  border: "1.5px solid #e0e7ef",
                  borderRadius: 10,
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#eef2f7",
                    padding: "8px 14px",
                    borderBottom: "1px solid #e0e7ef",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#4a6070",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Statut du dossier
                  </p>
                </div>
                <div style={{ padding: "14px" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {(["pending", "validated", "rejected"] as const).map(
                      (st) => {
                        const info = STATUS_LABELS[st];
                        return (
                          <button
                            key={st}
                            disabled={saving}
                            onClick={() => updateStatus(st)}
                            style={{
                              flex: 1,
                              padding: "8px 4px",
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: saving ? "default" : "pointer",
                              border:
                                selected.status === st
                                  ? `2px solid ${info.color}`
                                  : "2px solid #dde3ec",
                              background:
                                selected.status === st ? info.bg : "#fff",
                              color:
                                selected.status === st ? info.color : "#4a6070",
                              transition: "all 0.15s",
                            }}
                          >
                            {info.label}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#4a6070",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Notes internes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #dde3ec",
                      fontSize: 13,
                      fontFamily: "inherit",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                    placeholder="Notes de validation, motif de refus…"
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 8,
                    }}
                  >
                    <button
                      onClick={saveNotes}
                      disabled={saving}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: "#0d6e4f",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: saving ? "default" : "pointer",
                      }}
                    >
                      {saving ? "Sauvegarde…" : "Sauvegarder les notes"}
                    </button>
                    {notesSaved && (
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0d6e4f",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          animation: "fadeIn 0.2s ease",
                        }}
                      >
                        ✓ Notes sauvegardées
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
