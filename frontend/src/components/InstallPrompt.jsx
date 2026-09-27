import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'vocaflow-install-prompt-dismissed';

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone || localStorage.getItem(DISMISSED_KEY)) return undefined;

    const showTimer = window.setTimeout(() => setIsVisible(true), 900);
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const handleAppInstalled = () => {
      localStorage.setItem(DISMISSED_KEY, 'installed');
      setIsVisible(false);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'dismissed');
    setIsVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    dismiss();
  };

  if (!isVisible) return null;

  const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <section
        aria-labelledby="install-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 shadow-2xl"
        role="dialog"
      >
        <div className="mb-4 flex items-center gap-3">
          <img alt="" className="h-12 w-12 rounded-xl" src="/icons/icon-192.png" />
          <div>
            <h2 className="text-lg font-semibold" id="install-title">Vocaflow sul tuo dispositivo</h2>
            <p className="text-sm text-zinc-400">Aprila come un’app, senza la barra del browser.</p>
          </div>
        </div>

        {installEvent ? (
          <button
            className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-300"
            onClick={install}
            type="button"
          >
            Aggiungi alla schermata Home
          </button>
        ) : (
          <p className="text-sm leading-6 text-zinc-300">
            {isAppleMobile
              ? 'Apri questa pagina in Safari, tocca Condividi e scegli “Aggiungi alla schermata Home”.'
              : 'Apri il menu del browser e scegli “Installa app” oppure “Aggiungi a schermata Home”.'}
          </p>
        )}

        <button
          className="mt-3 w-full rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:text-white"
          onClick={dismiss}
          type="button"
        >
          Non ora
        </button>
      </section>
    </div>
  );
}