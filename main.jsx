import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

function App() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);

    const digits = phone.replace(/\D/g, "");
    const normalizedDigits = digits.length === 11 && digits.startsWith("226")
      ? digits.slice(3)
      : digits;

    if (!/^\d{8}$/.test(normalizedDigits)) {
      setNotice({ type: "error", text: "Entre un numéro burkinabè valide de 8 chiffres." });
      return;
    }
    if (new TextEncoder().encode(password).length < 8 ||
        new TextEncoder().encode(password).length > 72) {
      setNotice({ type: "error", text: "Le mot de passe doit contenir entre 8 et 72 octets." });
      return;
    }
    if (password !== confirmation) {
      setNotice({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    if (referralCode.trim() && !/^[a-zA-Z0-9]{6}$/.test(referralCode.trim())) {
      setNotice({ type: "error", text: "Le code de parrainage doit contenir 6 lettres ou chiffres." });
      return;
    }
    if (!supabase) {
      setNotice({
        type: "error",
        text: "La connexion Supabase n’est pas configurée. Copie .env.example vers .env.local et renseigne les paramètres publics du projet."
      });
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("register_user", {
        p_country_code: "BF",
        p_phone: normalizedDigits,
        p_password: password,
        p_password_confirmation: confirmation,
        p_referral_code: referralCode.trim() || null
      });

      if (error) {
        // Les messages renvoyés par la fonction peuvent être affichés,
        // mais ne jamais afficher le mot de passe ni les paramètres sensibles.
        const safeMessage = typeof error.message === "string"
          ? error.message.replace(/<[^>]*>/g, "").slice(0, 220)
          : "Inscription impossible. Réessaie plus tard.";
        setNotice({ type: "error", text: safeMessage });
        return;
      }

      if (data?.success) {
        setNotice({
          type: "success",
          text: "Compte créé avec succès. La connexion sera proposée lorsque le parcours de connexion aura été validé."
        });
        setPhone("");
        setPassword("");
        setConfirmation("");
        setReferralCode("");
      } else {
        setNotice({
          type: "error",
          text: data?.message || "Inscription impossible. Vérifie les informations saisies."
        });
      }
    } catch {
      setNotice({ type: "error", text: "Erreur de connexion. Vérifie ton réseau puis réessaie." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <section className="brand-panel" aria-label="Présentation d’Oscar">
        <div className="brand-mark" aria-hidden="true">O</div>
        <p className="eyebrow">BIENVENUE CHEZ</p>
        <h1>Oscar<span>.</span></h1>
        <p className="brand-copy">Crée ton compte pour commencer.</p>
        <div className="brand-note">
          <span className="note-dot" />
          Une expérience simple, pensée pour toi.
        </div>
      </section>

      <section className="form-panel">
        <div className="form-wrap">
          <div className="mobile-brand"><span className="mini-mark">O</span> Oscar</div>
          <p className="eyebrow form-eyebrow">NOUVEAU COMPTE</p>
          <h2>Inscription</h2>
          <p className="intro">Renseigne tes informations pour créer ton compte.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="phone">Numéro de téléphone</label>
            <div className="phone-field">
              <span className="country-code" aria-label="Indicatif du Burkina Faso">🇧🇫 +226</span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="70 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={24}
                required
              />
            </div>
            <p className="field-help">Burkina Faso · 8 chiffres</p>

            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="confirmation">Confirmer le mot de passe</label>
            <input
              id="confirmation"
              name="confirmation"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Répète ton mot de passe"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              required
            />
            <label className="show-password">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Afficher les mots de passe
            </label>

            <label htmlFor="referral">Code de parrainage <span className="optional">Facultatif</span></label>
            <input
              id="referral"
              name="referral"
              type="text"
              autoComplete="off"
              placeholder="Ex. ab12cd"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              maxLength={6}
              spellCheck="false"
            />

            {notice && (
              <div className={`notice ${notice.type}`} role="status" aria-live="polite">
                {notice.text}
              </div>
            )}

            <button type="submit" disabled={busy}>
              {busy ? <><span className="spinner" /> Création en cours…</> : "Créer mon compte"}
            </button>
          </form>

          <p className="legal">
            En créant un compte, tu demandes l’enregistrement de tes informations selon les règles du service Oscar.
          </p>
          <div className="prototype-note">
            Prototype non déployé · Le raccordement à la production reste désactivé tant que l’audit de sécurité n’est pas validé.
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
