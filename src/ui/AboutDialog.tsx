import { useEffect, useState } from 'react'
import { ABOUT, APP_VERSION, acknowledgement } from '../app/about'

export function AboutDialog({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const text = acknowledgement()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable (insecure context); the text is selectable */
    }
  }
  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal narrow about">
        <header><span>About DiagramIt</span><button onClick={onClose} aria-label="Close">×</button></header>
        <div className="body">
          <div className="about-head">
            <img src={`${import.meta.env.BASE_URL}cahanlab.png`} alt="" width={44} height={44} />
            <div>
              <div className="about-title">DiagramIt <span className="about-version">v{APP_VERSION}</span></div>
              <div className="hint">© {ABOUT.year} {ABOUT.author} · <a href={ABOUT.labUrl} {...ext}>{ABOUT.lab}</a></div>
            </div>
          </div>
          <p>{ABOUT.summary}</p>
          <p className="hint">
            Everything runs in your browser: figures and project files are never uploaded. Work autosaves to this browser's local storage; use File ▸ Save project to keep a copy.
          </p>
          <div className="about-links">
            <a href={ABOUT.labUrl} {...ext}>Cahan Lab website</a>
            <a href={ABOUT.repoUrl} {...ext}>Source code on GitHub</a>
            <a href={ABOUT.issuesUrl} {...ext}>Report a problem or request a feature</a>
          </div>
          <div className="about-ack">
            <div className="about-ack-title">Terms of use and licence</div>
            <p className="hint">{ABOUT.termsOfUse}</p>
            <p className="hint">
              {ABOUT.licenseSummary} Licence: <a href={ABOUT.licenseUrl} {...ext}>{ABOUT.licenseName}</a>. For commercial licensing of the code, contact {ABOUT.author} via the <a href={ABOUT.labUrl} {...ext}>lab website</a>.
            </p>
          </div>
          <div className="about-ack">
            <div className="about-ack-title">Acknowledging DiagramIt</div>
            <p className="hint">
              If a figure made here appears in a paper, poster, talk or web page, a line in the legend, methods or acknowledgements is appreciated. Suggested wording:
            </p>
            <div className="about-cite">
              <code>{text}</code>
              <button className="btn" onClick={() => void copy()}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
          </div>
        </div>
        <footer><button className="btn primary" onClick={onClose}>Close</button></footer>
      </div>
    </div>
  )
}
