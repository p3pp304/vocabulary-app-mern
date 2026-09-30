const LANGUAGE_LOCALES = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
};

export function isSpeechSupported() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

export function speakText(text, language, callbacks = {}) {
  if (!isSpeechSupported() || !text) return;

  const synthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  const requestedLocale = String(language || "en").replace(/^en-UK$/i, "en-GB");

  utterance.lang =
    LANGUAGE_LOCALES[requestedLocale.toLowerCase()] || requestedLocale;
  utterance.rate = 0.9;
  utterance.onstart = callbacks.onStart;
  utterance.onend = callbacks.onEnd;
  utterance.onerror = callbacks.onError;

  synthesis.cancel();
  synthesis.resume();
  synthesis.speak(utterance);
}