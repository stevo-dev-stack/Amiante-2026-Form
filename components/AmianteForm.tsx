"use client";

import { useState, useRef, useEffect } from "react";

const SITES = ["Messanges", "Bénesse-Maremne"];

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h < 12; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  for (let h = 13; h < 17; h++) {
    for (let m = h === 13 ? 30 : 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
};

const ALL_SLOTS = generateTimeSlots();

const AVAILABLE_DROP_SLOTS: Record<string, string[]> = {
  "2026-05-25": ALL_SLOTS,
  "2026-05-26": ALL_SLOTS,
  "2026-05-27": ALL_SLOTS,
  "2026-06-01": ALL_SLOTS,
  "2026-06-02": ALL_SLOTS,
  "2026-06-03": ALL_SLOTS,
  "2026-06-08": ALL_SLOTS,
  "2026-06-09": ALL_SLOTS,
};

const AVAILABLE_EPI_SLOTS: Record<string, string[]> = {
  "2026-05-20": ALL_SLOTS,
  "2026-05-21": ALL_SLOTS,
  "2026-05-22": ALL_SLOTS,
  "2026-05-23": ALL_SLOTS,
  "2026-06-04": ALL_SLOTS,
  "2026-06-05": ALL_SLOTS,
  "2026-06-10": ALL_SLOTS,
  "2026-06-11": ALL_SLOTS,
};

function formatDateFR(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDay = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

function Calendar({
  availableSlots,
  value,
  onChange,
}: {
  availableSlots: Record<string, string[]>;
  value: string;
  onChange: (d: string) => void;
}) {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const { year, month } = view;
  const daysInMonth = getDaysInMonth(year, month);
  let firstDay = getFirstDay(year, month);
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const dayNames = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div style={{ fontFamily: "inherit" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <button
          onClick={() =>
            setView((v) =>
              v.month === 0
                ? { year: v.year - 1, month: 11 }
                : { year: v.year, month: v.month - 1 },
            )
          }
          style={navBtnStyle}
        >
          ‹
        </button>
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#1a2e44",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {monthNames[month]} {year}
        </span>
        <button
          onClick={() =>
            setView((v) =>
              v.month === 11
                ? { year: v.year + 1, month: 0 }
                : { year: v.year, month: v.month + 1 },
            )
          }
          style={navBtnStyle}
        >
          ›
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 2,
          marginBottom: 4,
        }}
      >
        {dayNames.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#8a9ab0",
              padding: "2px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 2,
        }}
      >
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = toKey(d);
          const hasSlots = !!availableSlots[key];
          const isSelected = value === key;
          const isToday = key === todayKey;
          return (
            <button
              key={i}
              disabled={!hasSlots}
              onClick={() => onChange(key)}
              style={{
                padding: "10px 4px",
                borderRadius: 8,
                minHeight: "44px",
                border: isSelected
                  ? "2px solid #0d6e4f"
                  : isToday
                    ? "2px solid #94d4b8"
                    : "2px solid transparent",
                background: isSelected
                  ? "#0d6e4f"
                  : hasSlots
                    ? "#e8f5ef"
                    : "transparent",
                color: isSelected ? "#fff" : hasSlots ? "#0d6e4f" : "#c5cdd8",
                fontWeight: isSelected || hasSlots ? 700 : 400,
                fontSize: 13,
                cursor: hasSlots ? "pointer" : "default",
                transition: "all 0.15s",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid #dde3ec",
  borderRadius: 8,
  width: 36,
  height: 36,
  cursor: "pointer",
  fontSize: 20,
  color: "#4a6070",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function TimeSlots({
  slots,
  value,
  onChange,
}: {
  slots: string[];
  value: string;
  onChange: (t: string) => void;
}) {
  if (!slots || slots.length === 0)
    return (
      <p style={{ color: "#aaa", fontSize: 13, marginTop: 8 }}>
        Aucun créneau disponible ce jour.
      </p>
    );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      {slots.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            minHeight: "44px",
            border: value === t ? "2px solid #0d6e4f" : "2px solid #dde3ec",
            background: value === t ? "#0d6e4f" : "#fff",
            color: value === t ? "#fff" : "#2a3d50",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function StepBar({ step }: { step: number }) {
  const steps = ["Identité", "Remise EPI", "Dépôt déchets", "Confirmation"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < steps.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 64,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: done || active ? "#0d6e4f" : "#e8edf3",
                  color: done || active ? "#fff" : "#8a9ab0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  border: active
                    ? "3px solid #94d4b8"
                    : "3px solid transparent",
                  boxShadow: active ? "0 0 0 3px #e8f5ef" : "none",
                  transition: "all 0.3s",
                }}
              >
                {done ? "✓" : idx}
              </div>
              <span
                className={`step-text ${active ? "active" : ""}`}
                style={{
                  fontSize: 10.5,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#0d6e4f" : done ? "#4a6070" : "#aab5c3",
                  marginTop: 5,
                  textAlign: "center",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 4px",
                  marginBottom: 20,
                  background: done ? "#0d6e4f" : "#e0e7ef",
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontSize: 12.5,
          fontWeight: 700,
          color: "#4a6070",
          marginBottom: 6,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label} {required && <span style={{ color: "#e04040" }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: 11.5, color: "#8a9ab0", marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1.5px solid #dde3ec",
  fontSize: 14,
  color: "#1a2e44",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

function SitcomLogo({ light = false }: { light?: boolean }) {
  return (
    <img
      src="/logo.svg"
      alt="SITCOM Côte sud des Landes"
      style={{
        height: 70,
        width: "auto",
        display: "block",
        filter: light ? "brightness(0) invert(1)" : "none",
      }}
    />
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
        paddingBottom: 10,
        borderBottom: "1.5px solid #eef2f7",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <h3
        style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1a2e44" }}
      >
        {title}
      </h3>
    </div>
  );
}

function ErrMsg({ msg }: { msg: string }) {
  return (
    <p
      style={{ fontSize: 12, color: "#e04040", marginTop: 4, fontWeight: 600 }}
    >
      ⚠ {msg}
    </p>
  );
}

function RecapBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: 14,
        background: "#f7fafd",
        border: "1.5px solid #e0e7ef",
        borderRadius: 10,
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
            fontSize: 11.5,
            fontWeight: 800,
            color: "#4a6070",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </p>
      </div>
      <div style={{ padding: "10px 14px" }}>{children}</div>
    </div>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "4px 0",
        borderBottom: "1px solid #eef2f7",
      }}
    >
      <span
        style={{
          fontSize: 12.5,
          color: "#8a9ab0",
          fontWeight: 600,
          minWidth: 90,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "#1a2e44",
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

const uploadBtnStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 8,
  border: "1.5px solid #b0c8b0",
  background: "#f0f7f3",
  color: "#0d6e4f",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flex: 1,
  minHeight: "44px",
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(160deg, #f0f6f2 0%, #e8edf5 50%, #f0f4f8 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "16px 12px",
  fontFamily: "'Lato', sans-serif",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 4px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
  width: "100%",
};

const responsiveStyles = `
  .responsive-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .responsive-grid-1-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .responsive-card {
    padding: 24px 16px;
  }
  .responsive-flex-row {
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }
  .responsive-flex-row-mobile-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .responsive-footer-buttons {
    display: flex;
    flex-direction: column-reverse;
    gap: 12px;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #e8edf3;
  }
  .responsive-footer-buttons button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
  }
  .step-text {
    display: none;
  }
  .step-text.active {
    display: block;
  }
  @media (min-width: 640px) {
    .responsive-grid {
      grid-template-columns: 1fr 1fr;
    }
    .responsive-grid-1-2 {
      grid-template-columns: 1fr 2fr;
    }
    .responsive-card {
      padding: 36px 40px;
    }
    .responsive-flex-row {
      flex-direction: row;
      align-items: start;
    }
    .responsive-flex-row > div {
      flex: 1;
      width: 100%;
    }
    .responsive-flex-row-mobile-col {
      flex-direction: row;
    }
    .responsive-footer-buttons {
      flex-direction: row;
      justify-content: space-between;
    }
    .responsive-footer-buttons button {
      width: auto;
    }
    .step-text {
      display: block;
    }
  }
`;

export default function AmianteForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [validationCode, setValidationCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [site, setSite] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");

  type AddressFeature = {
    properties: {
      id: string;
      name: string;
      postcode: string;
      city: string;
    };
  };

  const [addressSuggestions, setAddressSuggestions] = useState<AddressFeature[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleAddressSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStreet(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=5`,
        );
        const data = await res.json();
        setAddressSuggestions(data.features || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const selectAddress = (feature: AddressFeature) => {
    const props = feature.properties;
    setStreet(props.name);
    setPostcode(props.postcode);
    setCity(props.city);
    setAddressSuggestions([]);
  };
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [dropDate, setDropDate] = useState("");
  const [dropTime, setDropTime] = useState("");
  const [epiDate, setEpiDate] = useState("");
  const [epiTime, setEpiTime] = useState("");

  const [bookedDropSlots, setBookedDropSlots] = useState<
    Record<string, string[]>
  >({});
  const [bookedEpiSlots, setBookedEpiSlots] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    fetch("/api/slots")
      .then((res) => res.json())
      .then((data) => {
        if (data.bookedDropSlots) setBookedDropSlots(data.bookedDropSlots);
        if (data.bookedEpiSlots) setBookedEpiSlots(data.bookedEpiSlots);
      })
      .catch(console.error);
  }, []);

  const availableDropSlots = Object.fromEntries(
    Object.entries(AVAILABLE_DROP_SLOTS).map(([date, slots]) => [
      date,
      slots.filter((s) => !bookedDropSlots[date]?.includes(s)),
    ]),
  );

  const availableEpiSlots = Object.fromEntries(
    Object.entries(AVAILABLE_EPI_SLOTS).map(([date, slots]) => [
      date,
      slots.filter((s) => !bookedEpiSlots[date]?.includes(s)),
    ]),
  );

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap";
    if (!document.head.querySelector('[href*="Lato"]'))
      document.head.appendChild(link);
  }, []);

  const handleFile = (f: File | null) => {
    if (!f) return;
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(f.type)) {
      setErrors((e) => ({
        ...e,
        file: "Format non accepté (PDF, JPG, PNG uniquement)",
      }));
      return;
    }
    setFile(f);
    setErrors((e) => ({ ...e, file: "" }));
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  };

  const handleCamera = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e: Event) =>
      handleFile((e.target as HTMLInputElement).files?.[0] ?? null);
    input.click();
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!site) e.site = "Sélectionnez un site";
    if (!nom.trim()) e.nom = "Nom requis";
    if (!prenom.trim()) e.prenom = "Prénom requis";
    if (!street.trim()) e.street = "Adresse requise";
    if (!postcode.trim()) e.postcode = "Code postal requis";
    if (!city.trim()) e.city = "Ville requise";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Email invalide";
    if (!file) e.file = "Document obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!epiDate) e.epiDate = "Sélectionnez une date";
    if (!epiTime) e.epiTime = "Sélectionnez un créneau";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!dropDate) e.dropDate = "Sélectionnez une date";
    if (!dropTime) e.dropTime = "Sélectionnez un créneau";
    if (epiDate && dropDate && epiDate >= dropDate)
      e.dropDate = "Le RDV dépôt doit avoir lieu après la remise EPI";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep4 = () => {
    if (!agreed) {
      setErrors({ agreed: "Vous devez accepter les conditions" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;
    setSubmitting(true);
    setSubmitError("");

    const fd = new FormData();
    fd.append("site", site);
    fd.append("nom", nom);
    fd.append("prenom", prenom);
    fd.append("adresse", `${street}, ${postcode} ${city}`);
    fd.append("email", email);
    fd.append("dropDate", dropDate);
    fd.append("dropTime", dropTime);
    fd.append("epiDate", epiDate);
    fd.append("epiTime", epiTime);
    if (file) fd.append("document", file);

    try {
      const res = await fetch("/api/submit", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setValidationCode(data.code);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erreur lors de la soumission",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4) {
      handleSubmit();
      return;
    }
    setStep((s) => s + 1);
    setErrors({});
  };

  const back = () => {
    setStep((s) => s - 1);
    setErrors({});
  };

  if (submitted) {
    return (
      <div style={pageStyle}>
        <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
        <div
          className="responsive-card"
          style={{ ...cardStyle, maxWidth: 560, textAlign: "center" }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#0d6e4f,#1aab7c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 32,
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0d6e4f",
              marginBottom: 8,
            }}
          >
            Demande enregistrée
          </h2>
          <p
            style={{
              color: "#4a6070",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            Votre dossier a bien été soumis. Un email de confirmation sera
            envoyé à <strong>{email}</strong> avec votre code de dossier.
          </p>
          <div
            style={{
              background: "#e8f5ef",
              border: "2px dashed #94d4b8",
              borderRadius: 10,
              padding: "16px 24px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#4a6070",
                marginBottom: 4,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Code de dossier
            </p>
            <p
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#0d6e4f",
                letterSpacing: "0.12em",
              }}
            >
              {validationCode}
            </p>
          </div>
          <div
            style={{
              background: "#fff8e8",
              border: "1px solid #f0d080",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: 12.5, color: "#7a6020", fontWeight: 600 }}>
              ⏳ Validation du document en attente
            </p>
            <p style={{ fontSize: 12, color: "#9a7a30", marginTop: 4 }}>
              Un second email vous sera envoyé une fois votre document validé
              par nos équipes.
            </p>
          </div>
          <div style={{ textAlign: "left" }}>
            <RecapBlock title="Résumé de votre inscription">
              <RecapRow label="Site" value={site} />
              <RecapRow label="Demandeur" value={`${prenom} ${nom}`} />
              <RecapRow
                label="RDV EPI"
                value={`${formatDateFR(epiDate)} à ${epiTime}`}
              />
              <RecapRow
                label="RDV Dépôt"
                value={`${formatDateFR(dropDate)} à ${dropTime}`}
              />
            </RecapBlock>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            display: "inline-block",
            background: "#fff",
            borderRadius: 12,
            padding: "16px 32px 12px",
            marginBottom: 16,
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            border: "1px solid #e8edf3",
          }}
        >
          <SitcomLogo />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#0d6e4f",
              borderRadius: 20,
              padding: "5px 18px",
            }}
          >
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Campagne Collecte Amiante 2026
            </span>
          </div>
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#1a2e44",
            margin: "0 0 4px",
          }}
        >
          Inscription à la collecte
        </h1>
        <p style={{ color: "#6a7f90", fontSize: 13 }}>
          Déchetteries SITCOM Côte Sud des Landes
        </p>
      </div>

      <div className="responsive-card" style={{ ...cardStyle, maxWidth: 640 }}>
        <StepBar step={step} />

        {step === 1 && (
          <div>
            <SectionTitle icon="🏢" title="Site de dépôt" />
            <Field label="Site de collecte" required>
              <div className="responsive-flex-row-mobile-col">
                {SITES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSite(s)}
                    style={{
                      flex: 1,
                      padding: "12px 8px",
                      borderRadius: 10,
                      border:
                        site === s ? "2px solid #0d6e4f" : "2px solid #dde3ec",
                      background: site === s ? "#e8f5ef" : "#fff",
                      color: site === s ? "#0d6e4f" : "#4a6070",
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    📍 {s}
                  </button>
                ))}
              </div>
              {errors.site && <ErrMsg msg={errors.site} />}
            </Field>

            <SectionTitle icon="👤" title="Vos coordonnées" />
            <div className="responsive-grid">
              <Field label="Nom" required>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: errors.nom ? "#e04040" : "#dde3ec",
                  }}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="DUPONT"
                />
                {errors.nom && <ErrMsg msg={errors.nom} />}
              </Field>
              <Field label="Prénom" required>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: errors.prenom ? "#e04040" : "#dde3ec",
                  }}
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Jean"
                />
                {errors.prenom && <ErrMsg msg={errors.prenom} />}
              </Field>
            </div>
            <div style={{ position: "relative" }}>
              <Field label="Adresse complète" required>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: errors.street ? "#e04040" : "#dde3ec",
                  }}
                  value={street}
                  onChange={handleAddressSearch}
                  placeholder="12 rue des Pins"
                  autoComplete="off"
                />
                {errors.street && <ErrMsg msg={errors.street} />}
              </Field>
              {addressSuggestions.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    top: 60,
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1.5px solid #0d6e4f",
                    borderRadius: 8,
                    margin: 0,
                    listStyle: "none",
                    padding: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {addressSuggestions.map((s) => (
                    <li
                      key={s.properties.id}
                      onClick={() => selectAddress(s)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eef2f7",
                        fontSize: 13,
                        color: "#1a2e44",
                        background: "#fff",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f0f7f3")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      <strong>{s.properties.name}</strong>,{" "}
                      {s.properties.postcode} {s.properties.city}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="responsive-grid-1-2">
              <Field label="Code postal" required>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: errors.postcode ? "#e04040" : "#dde3ec",
                  }}
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="40660"
                />
                {errors.postcode && <ErrMsg msg={errors.postcode} />}
              </Field>
              <Field label="Ville" required>
                <input
                  style={{
                    ...inputStyle,
                    borderColor: errors.city ? "#e04040" : "#dde3ec",
                  }}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Messanges"
                />
                {errors.city && <ErrMsg msg={errors.city} />}
              </Field>
            </div>
            <Field
              label="Adresse email"
              required
              hint="Votre code de confirmation sera envoyé à cette adresse."
            >
              <input
                type="email"
                style={{
                  ...inputStyle,
                  borderColor: errors.email ? "#e04040" : "#dde3ec",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean.dupont@example.com"
              />
              {errors.email && <ErrMsg msg={errors.email} />}
            </Field>

            <SectionTitle icon="📎" title="Justificatif de domicile" />
            <Field
              label="Justificatif de domicile"
              required
              hint="Formats acceptés : PDF, JPG, PNG. Ce document sera vérifié par nos équipes avant confirmation."
            >
              <div
                className="responsive-flex-row-mobile-col"
                style={{ marginBottom: 10 }}
              >
                <button
                  onClick={() => fileRef.current?.click()}
                  style={uploadBtnStyle}
                >
                  📁 Choisir un fichier
                </button>
                <button
                  onClick={handleCamera}
                  style={{
                    ...uploadBtnStyle,
                    background: "#f0f7ff",
                    borderColor: "#b0cce8",
                    color: "#1a5a90",
                  }}
                >
                  📷 Prendre une photo
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#e8f5ef",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="preview"
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 24 }}>📄</span>
                  )}
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0d6e4f",
                        margin: 0,
                      }}
                    >
                      {file.name}
                    </p>
                    <p style={{ fontSize: 11, color: "#4a6070", margin: 0 }}>
                      {(file.size / 1024).toFixed(1)} Ko
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                    }}
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      color: "#c04040",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              {errors.file && <ErrMsg msg={errors.file} />}
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <SectionTitle
              icon="🦺"
              title="RDV Remise des équipements de protection (EPI)"
            />
            <p
              style={{
                fontSize: 13,
                color: "#5a7080",
                marginBottom: 20,
                background: "#e8f0ff",
                border: "1px solid #b0c8f0",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              ℹ️ Ce rendez-vous doit impérativement avoir lieu{" "}
              <strong>avant</strong> votre RDV de dépôt.
            </p>
            <div className="responsive-flex-row">
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4a6070",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Choisissez une date
                </p>
                <div
                  style={{
                    background: "#f7fafd",
                    border: "1.5px solid #dde3ec",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <Calendar
                    availableSlots={availableEpiSlots}
                    value={epiDate}
                    onChange={(d) => {
                      setEpiDate(d);
                      setEpiTime("");
                    }}
                  />
                </div>
                {errors.epiDate && <ErrMsg msg={errors.epiDate} />}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4a6070",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Créneaux disponibles
                </p>
                {epiDate ? (
                  <>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#0d6e4f",
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      📅 {formatDateFR(epiDate)}
                    </p>
                    <TimeSlots
                      slots={availableEpiSlots[epiDate]}
                      value={epiTime}
                      onChange={setEpiTime}
                    />
                    {errors.epiTime && <ErrMsg msg={errors.epiTime} />}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: "#aab5c3", marginTop: 8 }}>
                    ← Sélectionnez d&apos;abord une date
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <SectionTitle icon="🗓️" title="RDV Dépôt des déchets amiantés" />
            <p
              style={{
                fontSize: 13,
                color: "#5a7080",
                marginBottom: 20,
                background: "#fff8e8",
                border: "1px solid #f0d080",
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              ⚠️ Ce rendez-vous correspond à votre venue à la déchetterie pour
              déposer vos déchets amiantés, <strong>après</strong> avoir
              récupéré vos équipements de protection.
            </p>
            <div
              style={{
                background: "#f7fafd",
                border: "1px solid #dde3ec",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 12.5, color: "#4a6070", margin: 0 }}>
                🦺 Votre RDV Remise EPI prévu :{" "}
                <strong style={{ color: "#0d6e4f" }}>
                  {formatDateFR(epiDate)} à {epiTime}
                </strong>
              </p>
            </div>
            <div className="responsive-flex-row">
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4a6070",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Choisissez une date
                </p>
                <div
                  style={{
                    background: "#f7fafd",
                    border: "1.5px solid #dde3ec",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <Calendar
                    availableSlots={availableDropSlots}
                    value={dropDate}
                    onChange={(d) => {
                      setDropDate(d);
                      setDropTime("");
                    }}
                  />
                </div>
                {errors.dropDate && <ErrMsg msg={errors.dropDate} />}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4a6070",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Créneaux disponibles
                </p>
                {dropDate ? (
                  <>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#0d6e4f",
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      📅 {formatDateFR(dropDate)}
                    </p>
                    <TimeSlots
                      slots={availableDropSlots[dropDate]}
                      value={dropTime}
                      onChange={setDropTime}
                    />
                    {errors.dropTime && <ErrMsg msg={errors.dropTime} />}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: "#aab5c3", marginTop: 8 }}>
                    ← Sélectionnez d&apos;abord une date
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <SectionTitle icon="✅" title="Récapitulatif et confirmation" />
            <p style={{ fontSize: 13, color: "#5a7080", marginBottom: 20 }}>
              Vérifiez les informations ci-dessous avant de valider votre
              inscription.
            </p>

            <RecapBlock title="Informations personnelles">
              <RecapRow label="Site" value={`📍 ${site}`} />
              <RecapRow label="Nom" value={`${prenom} ${nom}`} />
              <RecapRow
                label="Adresse"
                value={`${street}, ${postcode} ${city}`}
              />
              <RecapRow label="Email" value={email} />
              <RecapRow
                label="Document"
                value={file ? `📎 ${file.name}` : "—"}
              />
            </RecapBlock>

            <RecapBlock title="RDV Remise EPI">
              <RecapRow label="Date" value={formatDateFR(epiDate)} />
              <RecapRow label="Heure" value={epiTime} />
            </RecapBlock>

            <RecapBlock title="RDV Dépôt des déchets">
              <RecapRow label="Date" value={formatDateFR(dropDate)} />
              <RecapRow label="Heure" value={dropTime} />
            </RecapBlock>

            <div
              style={{
                background: "#fff8e8",
                border: "1.5px solid #f0c040",
                borderRadius: 10,
                padding: "14px 16px",
                marginTop: 20,
              }}
            >
              <p
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#7a6020",
                  marginBottom: 6,
                }}
              >
                📧 Deux emails vous seront envoyés :
              </p>
              <ul
                style={{
                  fontSize: 12.5,
                  color: "#9a7a30",
                  margin: 0,
                  paddingLeft: 18,
                  lineHeight: 1.7,
                }}
              >
                <li>
                  Un <strong>email de confirmation immédiat</strong> avec votre
                  code de dossier
                </li>
                <li>
                  Un <strong>email de validation</strong> une fois votre
                  document vérifié par nos équipes
                </li>
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginTop: 20,
              }}
            >
              <input
                type="checkbox"
                id="cgu"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: 3, accentColor: "#0d6e4f" }}
              />
              <label
                htmlFor="cgu"
                style={{ fontSize: 12.5, color: "#5a7080", lineHeight: 1.5 }}
              >
                J&apos;atteste que les informations fournies sont exactes et
                j&apos;accepte que mes données soient traitées dans le cadre de
                cette campagne de collecte d&apos;amiante.
              </label>
            </div>
            {errors.agreed && <ErrMsg msg={errors.agreed} />}

            {submitError && (
              <div
                style={{
                  marginTop: 16,
                  background: "#fff0f0",
                  border: "1px solid #f0a0a0",
                  borderRadius: 8,
                  padding: "12px 16px",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "#c04040",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  ❌ {submitError}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="responsive-footer-buttons">
          <button
            onClick={back}
            disabled={step === 1}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "1.5px solid #dde3ec",
              background: "#fff",
              color: step === 1 ? "#c5cdd8" : "#4a6070",
              fontWeight: 700,
              fontSize: 14,
              cursor: step === 1 ? "default" : "pointer",
            }}
          >
            ← Retour
          </button>
          <button
            onClick={next}
            disabled={submitting}
            style={{
              padding: "10px 28px",
              borderRadius: 8,
              border: "none",
              background: submitting
                ? "#6ab89a"
                : "linear-gradient(135deg, #0d6e4f, #1aab7c)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: submitting ? "default" : "pointer",
              boxShadow: "0 4px 14px rgba(13,110,79,0.35)",
              transition: "opacity 0.15s",
            }}
          >
            {submitting
              ? "Envoi en cours…"
              : step === 4
                ? "✓ Valider ma demande"
                : "Continuer →"}
          </button>
        </div>
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: 11.5,
          color: "#8a9ab0",
          marginTop: 16,
        }}
      >
        SITCOM Côte Sud des Landes — Campagne Amiante 2026 · Données traitées
        conformément au RGPD
      </p>
    </div>
  );
}
