'use client'

import { useEffect, useRef, useState } from 'react'

const MERMAID_DEF = `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#2BB286', 'primaryTextColor': '#fff',
  'primaryBorderColor': '#1a8f6a', 'lineColor': '#666',
  'secondaryColor': '#f5f0eb', 'tertiaryColor': '#fff',
  'clusterBkg': '#faf8f6', 'clusterBorder': '#ddd',
  'nodeBorder': '#ccc', 'fontFamily': 'Segoe UI, system-ui, sans-serif'
}}}%%

graph TB
    subgraph UTILISATEUR["👤 Utilisateurs"]
        U1["📱 Application Capacitor (APK)"]
        U2["🌐 Navigateur timeheroes.fr"]
    end
    subgraph FRONTEND["🖥️ Frontend — Next.js 16 (React)"]
        PAGES["Pages & Composants<br/>Dashboard · Services · Bookings<br/>Wallet · Missions · Organisations"]
        NFC["📡 NFC Module<br/>@capgo/capacitor-nfc"]
        PWA["📲 PWA<br/>Manifest + App Icons"]
    end
    subgraph BACKEND["⚙️ Backend — API Routes (Next.js)"]
        API["API Routes<br/>/api/auth · /api/services<br/>/api/bookings · /api/wallet"]
        BIZ["Métier (lib/)<br/>NFC · Ratings · Matchmaking<br/>Gamification · Facilitateur"]
        STORE["🧩 Prisma ORM"]
    end
    subgraph DONNEES["💾 Données"]
        DB[("🗄️ SQLite<br/>timebank.db")]
    end
    subgraph MOBILE["📱 Capacitor — Coquille Native (Android)"]
        CAP["⚡ Capacitor Core<br/>WebView chrome"]
        PLUGINS["🔌 Plugins Natifs<br/>NFC · Push · Splash<br/>StatusBar · Share"]
    end
    subgraph EXTERNE["🌍 Services Externes"]
        FCM["🔥 Firebase Cloud<br/>Notifications Push"]
        DNS["🌐 DNS<br/>timeheroes.fr"]
    end
    subgraph SERVEUR["🖧 Serveur — Linux VPS"]
        NODE["🚀 Node.js<br/>Port 3096"]
        PM2["♻️ PM2<br/>Gestionnaire de processus"]
        GIT["📦 Git<br/>GitHub → Pull"]
    end
    U1 -->|"Charge https://timeheroes.fr"| CAP
    U2 -->|"HTTPS"| DNS
    DNS --> NODE
    CAP --> MOBILE
    MOBILE --> PLUGINS
    FRONTEND -->|"Appels API"| BACKEND
    BACKEND --> STORE
    STORE --> DB
    FRONTEND --> NFC
    FRONTEND --> PWA
    PWA -->|"Installation"| U2
    FCM -->|"Push"| PLUGINS
    NODE --> FRONTEND
    NODE --> BACKEND
    PM2 --> NODE
    GIT -->|"git pull"| NODE
`

const COLORS = [
  ['Next.js (React)', '#000'],
  ['SQLite + Prisma', '#003b57'],
  ['Capacitor (WebView)', '#119eff'],
  ['NFC natif', '#7c3aed'],
  ['Cloud (Firebase)', '#ea580c'],
  ['Serveur Linux', '#059669'],
  ['Services externes', '#dc2626'],
]

const CARDS = [
  {
    title: '📦 Stack Technique',
    items: ['Next.js 16 — Frontend + Backend API', 'React 19 + Tailwind CSS', 'Prisma ORM — Couche données', 'SQLite — Base embarquée', 'TypeScript — Typage strict'],
  },
  {
    title: '📱 Mobile (Capacitor)',
    items: ['Capacitor 8 — Coquille native Android', 'WebView chrome charge timeheroes.fr', '@capgo/capacitor-nfc — Tags NFC', 'Push Notifications — Firebase Cloud', 'APK signé — Distribution directe'],
  },
  {
    title: '🔧 Déploiement',
    items: ['Linux VPS — Ubuntu', 'Node.js — Port 3096', 'PM2 — Gestionnaire de processus', 'Git — Déploiement via git pull', 'timeheroes.fr — Domaine + SSL'],
  },
  {
    title: '🔄 Flux de données',
    items: ['1. Utilisateur ouvre app/link → timeheroes.fr', '2. Next.js sert la page + API', '3. Appels API → Prisma → SQLite', '4. NFC : Tap validation → API → DB', '5. Push : Firebase → Capacitor → Notification'],
  },
]

export default function DiagramPage() {
  const diagramRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let mounted = true

    async function renderMermaid() {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#2BB286',
            primaryTextColor: '#fff',
            primaryBorderColor: '#1a8f6a',
            lineColor: '#666',
            secondaryColor: '#f5f0eb',
            tertiaryColor: '#fff',
            clusterBkg: '#faf8f6',
            clusterBorder: '#ddd',
            nodeBorder: '#ccc',
          },
          flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis', padding: 12 },
        })

        const { svg } = await mermaid.render('mermaid-svg', MERMAID_DEF)
        if (mounted && diagramRef.current) {
          diagramRef.current.innerHTML = svg
          setStatus('ready')
        }
      } catch (e) {
        console.error('Mermaid render error:', e)
        if (mounted) setStatus('error')
      }
    }

    renderMermaid()
    return () => { mounted = false }
  }, [])

  return (
    <div style={{
      background: '#f5f0eb',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <header style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, color: '#1a1a2e', marginBottom: 8 }}>
            🏛️ <span style={{ color: '#2BB286' }}>TimeHeroes</span> — Schéma d&apos;Architecture
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            Plateforme de Time Banking · Next.js + SQLite + Capacitor · Juillet 2026
          </p>
        </header>

        <div style={{
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: 30,
          marginBottom: 30,
          overflowX: 'auto',
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {status === 'loading' && <p style={{ color: '#999' }}>⏳ Chargement du diagramme...</p>}
          {status === 'error' && <p style={{ color: '#dc2626' }}>❌ Erreur de rendu du diagramme</p>}
          <div ref={diagramRef} style={{ width: '100%' }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 24,
          padding: 20,
          background: '#faf8f6',
          borderRadius: 12,
        }}>
          {COLORS.map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#444' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: color, flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
          marginBottom: 24,
        }}>
          {CARDS.map(card => (
            <div key={card.title} style={{
              background: 'white',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{
                fontSize: 16,
                color: '#1a1a2e',
                marginBottom: 12,
                borderBottom: '2px solid #2BB286',
                paddingBottom: 8,
              }}>{card.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {card.items.map((item, i) => (
                  <li key={i} style={{ padding: '4px 0', fontSize: 13, color: '#444' }}>
                    <span style={{ color: '#2BB286', marginRight: 8 }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: 20, color: '#888', fontSize: 13 }}>
          TimeHeroes · Architecture Diagram · Généré par Hermes · Juillet 2026
        </div>
      </div>
    </div>
  )
}
