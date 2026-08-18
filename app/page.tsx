'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowUp, Check, Copy } from 'lucide-react'

const CONTRACT = '0x8755c1f62cfb0fad7a3dfe6ee00585b594bcc981'
const X_PROFILE = 'https://x.com/TIME_RH1'
const X_COMMUNITY = 'https://x.com/i/communities/2008924415724077152'

const ART = {
  hero: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-18_03-27-17-U9hhUhq6JJJJuMi91MrMoON3kEnYiu.jpg',
  city: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-18_03-27-36-Z1gQ9Wu2T2D1T2eAnmGnUjr1bJxIvs.jpg',
  watch: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-18_03-27-23-mwKdSJdRmBqFv6cLphftmK4BWEZHKf.jpg',
  hourglass: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-18_03-27-10-nlodL6F104DOv3xtYINuAHDU2svnep.jpg',
  mountain: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-18_03-27-05-l7v6pMCpiX2oYzavhsoaB0oKzAS9tk.jpg',
  money: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-08-18_03-27-00-krsmpdxvPJDh6aEYxFA3YI9DLdgT0O.jpg',
}

const sections = ['origin', 'now', 'value', 'entity', 'enter']

function XIcon({ size = 14 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
}

type Price = { priceUsd: string | null; priceNative: string | null; change24h: number | null; marketCap: number | null; liquidity: number | null; volume24h: number | null; url: string | null }

function usePrice() {
  const [price, setPrice] = useState<Price | null>(null)
  const [status, setStatus] = useState<'loading' | 'live' | 'error'>('loading')
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch('/api/price', { cache: 'no-store' })
        if (!response.ok) throw new Error('bad response')
        const data = await response.json()
        if (cancelled) return
        setPrice(data)
        setStatus('live')
      } catch {
        if (!cancelled) setStatus((current) => (current === 'live' ? 'live' : 'error'))
      }
    }
    load()
    // Skip polling while the tab is backgrounded; refresh on return.
    const interval = setInterval(() => { if (document.visibilityState === 'visible') load() }, 30000)
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener('visibilitychange', onVisible) }
  }, [])
  return { price, status }
}

function formatUsd(value: string | number | null) {
  const amount = typeof value === 'string' ? Number(value) : value
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return '—'
  return `$${new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 }).format(amount)}`
}

function formatCompact(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—'
  return `$${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)}`
}

// One render per second, rather than one per animation frame.
function useSessionSeconds() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const started = Date.now()
    const interval = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])
  return seconds
}

function useActiveSection(refs: React.RefObject<Record<string, HTMLElement | null>>) {
  const [active, setActive] = useState('origin')
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id) }),
      { threshold: 0.42 },
    )
    Object.values(refs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [refs])
  return active
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${secs}`
}

function Clock({ small = false, onClick, expanded = false }: { small?: boolean; onClick?: () => void; expanded?: boolean }) {
  // Stays null through SSR so the hands don't hydrate against server time.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { setNow(new Date()); const interval = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(interval) }, [])
  const second = now ? now.getSeconds() * 6 : 0
  const minute = now ? now.getMinutes() * 6 + now.getSeconds() / 10 : 0
  const hour = now ? (now.getHours() % 12) * 30 + now.getMinutes() / 2 : 0
  return <button aria-label={expanded ? 'Close time navigation' : 'Open time navigation'} onClick={onClick} className={`clock ${small ? 'clock--small' : ''} ${expanded ? 'clock--expanded' : ''}`}>
    <span className="clock-face"><span className="clock-mark clock-mark--12" /><span className="clock-mark clock-mark--3" /><span className="clock-mark clock-mark--6" /><span className="clock-mark clock-mark--9" /><i className="hand hand--hour" style={{ transform: `rotate(${hour}deg)` }} /><i className="hand hand--minute" style={{ transform: `rotate(${minute}deg)` }} /><i className="hand hand--second" style={{ transform: `rotate(${second}deg)` }} /><b /></span>
  </button>
}

const ImageScene = memo(function ImageScene({ src, alt, className = '', sizes = '100vw', children }: { src: string; alt: string; className?: string; sizes?: string; children?: React.ReactNode }) {
  const hero = className.includes('hero')
  return <div className={`image-scene ${className}`}>
    <Image src={src} alt={alt} fill sizes={sizes} priority={hero} loading={hero ? undefined : 'lazy'} draggable={false} />
    <div className="scene-vignette" />{children}
  </div>
})

function TemporalNavigation({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  return <div className="temporal-nav"><Clock small expanded={open} onClick={() => setOpen(!open)} />{open && <div className="nav-orbit" role="navigation" aria-label="Time navigation">{sections.map((section, i) => <button key={section} className={active === section ? 'is-active' : ''} style={{ '--i': i } as React.CSSProperties} onClick={() => { onSelect(section); setOpen(false) }}>{section}</button>)}</div>}</div>
}

function ContractAddress() {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT)
    } catch {
      const field = document.createElement('textarea')
      field.value = CONTRACT
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      document.execCommand('copy')
      document.body.removeChild(field)
    }
    setCopied(true)
  }, [])
  useEffect(() => { if (!copied) return; const timeout = setTimeout(() => setCopied(false), 1800); return () => clearTimeout(timeout) }, [copied])
  return <button type="button" className="contract" onClick={copy} aria-label={`Copy contract address ${CONTRACT}`}>
    <span className="contract-label">CA</span>
    <span className="contract-value">{CONTRACT}</span>
    <span className="contract-icon">{copied ? <Check size={15} /> : <Copy size={15} />}</span>
    <span className="contract-status" aria-live="polite">{copied ? 'COPIED' : ''}</span>
  </button>
}

function App() {
  const { price, status } = usePrice()
  const sessionTime = useSessionSeconds()
  const [spent, setSpent] = useState(false)
  const [intro, setIntro] = useState(true)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const active = useActiveSection(sectionRefs)
  useEffect(() => { const timeout = setTimeout(() => setIntro(false), 2100); return () => clearTimeout(timeout) }, [])
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const change = price?.change24h ?? null
  return <main>
    <div className={`intro ${intro ? '' : 'intro--gone'}`}><Clock /><p>THE CLOCK IS RUNNING</p></div>
    <div className="hud"><span>TIME / 01</span><span className="hud-line" /><span>{formatTime(sessionTime)} SPENT</span><a className="hud-x" href={X_PROFILE} target="_blank" rel="noopener noreferrer" aria-label="TIME on X (opens in a new tab)"><XIcon size={17} /></a></div>
    <TemporalNavigation active={active} onSelect={jump} />
    <section id="origin" ref={(el) => { sectionRefs.current.origin = el }} className="hero section"><ImageScene src={ART.hero} alt="A luminous timekeeper holding two giant pocket watches above a bowed crowd" className="image-scene--hero" sizes="100vw" /><div className="hero-copy"><p className="eyebrow">THE MOST VALUABLE ASSET</p><h1>TIME</h1><p className="hero-sub">YOU ARE SPENDING IT<br />ALREADY.</p></div><ContractAddress /></section>
    <section id="now" ref={(el) => { sectionRefs.current.now = el }} className="manifesto section section--dark"><p className="eyebrow">THE FIRST LAW</p><h2>YOU CANNOT<br /><em>KEEP</em> IT.</h2><div className="manifesto-image"><ImageScene src={ART.city} alt="Two solemn timekeepers in a dark city, one holding a pocket watch" sizes="(max-width: 640px) 78vw, 48vw" /></div><p className="side-note">It moves even when you do not.<br />It leaves no receipt.</p></section>
    <section id="value" ref={(el) => { sectionRefs.current.value = el }} className="watches section"><div className="section-heading"><p className="eyebrow">VALUE IS A DISTRACTION</p><h2>WHAT WOULD YOU<br /><span>PAY</span> FOR ONE MORE<br />MINUTE?</h2></div><div className={`watch-stage ${spent ? 'watch-stage--missing' : ''}`}><ImageScene src={ART.watch} alt="A flying timekeeper reaches through a giant pocket watch" className="image-scene--watch" sizes="(max-width: 640px) 110vw, min(86vw, 900px)" /><button type="button" className="watch-hotspot" disabled={spent} onClick={() => setSpent(true)}>{spent ? <>GONE<br /><small>NO REFUND</small></> : <>SPEND<br /><small>CLICK ONCE</small></>}</button></div><p className="interaction-note">{spent ? 'SOME THINGS ONLY HAPPEN ONCE.' : 'THE WATCH IS TICKING. HOVER. THEN DECIDE.'}</p></section>
    <section id="entity" ref={(el) => { sectionRefs.current.entity = el }} className="money section section--dark"><ImageScene src={ART.money} alt="A timekeeper seated behind a table covered in pocket watches and money" className="image-scene--money" sizes="100vw" /><div className="money-copy"><p className="eyebrow">THE EXCHANGE</p><h2>MONEY<br /><span>RETURNS.</span><br />TIME DOES NOT.</h2><div className="money-control"><div className="ticker"><span className="ticker-head"><i className={`ticker-dot ticker-dot--${status}`} />$TIME / LIVE</span><strong>{status === 'error' && !price ? '—' : formatUsd(price?.priceUsd ?? null)}</strong><span className={`ticker-change ${change === null ? '' : change >= 0 ? 'is-up' : 'is-down'}`}>{change === null ? 'AWAITING FEED' : `${change >= 0 ? '+' : ''}${change.toFixed(2)}% / 24H`}</span><span className="ticker-cap">MCAP {formatCompact(price?.marketCap ?? null)}</span></div><div><span>YOUR TIME</span><strong>{formatTime(sessionTime)}</strong></div></div></div></section>
    <section id="enter" ref={(el) => { sectionRefs.current.enter = el }} className="hourglass section"><ImageScene src={ART.hourglass} alt="A glowing hourglass held in the hands of a timekeeper" className="image-scene--hourglass" sizes="(max-width: 640px) 90vw, 52vw"><div className="hourglass-meter" style={{ height: `${Math.min(92, 30 + sessionTime * 2)}%` }} /></ImageScene><div className="hourglass-copy"><p className="eyebrow">NO PAUSE BUTTON</p><h2>THE SAND<br />DOES NOT<br /><em>NEGOTIATE.</em></h2></div></section>
    <section className="crowd section"><ImageScene src={ART.mountain} alt="A lone timekeeper overlooks a mountain valley where a giant clock rises from the horizon" className="image-scene--mountain" sizes="100vw" /><div className="crowd-copy"><p className="eyebrow">SCALE IS NOT MERCY</p><h2>EVERYONE HAS TIME.<br /><span>NO ONE HAS ENOUGH.</span></h2></div></section>
    <section className="final section"><div className="final-clock"><Clock /></div><p className="eyebrow">SESSION ENDED</p><h2>THAT TIME<br /><span>IS GONE.</span></h2><p className="final-time">YOU SPENT {formatTime(sessionTime)} HERE.</p><a className="community" href={X_COMMUNITY} target="_blank" rel="noopener noreferrer"><XIcon size={15} /> JOIN THE X COMMUNITY</a><div className="final-statement">TIME IS<br /><strong>THE ONLY<br />THING YOU<br />CAN&apos;T GET<br />BACK.</strong></div><button className="restart" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={14} /> RETURN TO ORIGIN</button></section>
    <footer><span>TIME / 2026</span><a href={X_PROFILE} target="_blank" rel="noopener noreferrer" className="footer-x"><XIcon size={11} /> @TIME_RH1</a><span>NO REPLAY</span></footer>
  </main>
}

export default function Page() { return <App /> }
