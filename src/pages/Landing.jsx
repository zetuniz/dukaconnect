import { Link } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  return (
    <div className="landing">

      {/* NAV */}
      <nav className="land-nav">
        <div className="land-logo">
          <img src="/logo-light.png" alt="DukaConnect" className="nav-logo-img" />
        </div>
        <div className="land-nav-actions">
          <Link to="/ingia" className="nav-ingia">Ingia</Link>
          <Link to="/jisajili" className="btn-primary">Jisajili Bure</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-brand">
          <img src="/logo-dark.png" alt="DukaConnect" className="hero-brand-img" />
        </div>
        <div className="hero-badge">🇹🇿 Imetengenezwa kwa Tanzania</div>
        <h1 className="hero-title">
          Agiza Bidhaa.<br />
          <span className="hero-highlight">Bila Kuacha Duka.</span>
        </h1>
        <p className="hero-sub">
          DukaConnect inaunganisha maduka ya rejareja na wasambazaji wa jumla Tanzania.
          Tuma agizo kwa sekunde — jumla anapokea mara moja.
        </p>
        <div className="hero-cta">
          <Link to="/jisajili" className="btn-primary btn-hero">
            Anza Sasa — Ni Bure
          </Link>
          <Link to="/ingia" className="btn-ghost">
            Nina Akaunti →
          </Link>
        </div>
        <div className="hero-trust">
          <span>✓ Hakuna ada ya kuanza</span>
          <span>✓ Dakika 2 kusajili</span>
          <span>✓ Inafanya kazi offline</span>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-band">
        <div className="stat-item">
          <span className="stat-big">99K+</span>
          <span className="stat-desc">Maduka Tanzania</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-big">2,000+</span>
          <span className="stat-desc">Wauza Jumla</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-big">90%</span>
          <span className="stat-desc">Bidhaa Kupitia Maduka Madogo</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-label">INAVYOFANYA KAZI</div>
        <h2 className="section-title">Rahisi Kama 1, 2, 3</h2>

        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-icon">📱</div>
            <h3>Sajili Akaunti</h3>
            <p>Jisajili kama rejareja au jumla. Dakika 2 tu — bila ada.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-icon">🛒</div>
            <h3>Tuma Agizo</h3>
            <p>Rejareja anachagua duka la jumla na kutuma agizo moja kwa moja.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-icon">🚚</div>
            <h3>Bidhaa Zinakuja</h3>
            <p>Jumla anakubali, anapanga, na rejareja anapokea taarifa wakati bidhaa zikifika.</p>
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className="forwhom">
        <div className="forwhom-card rejareja-card">
          <div className="forwhom-icon">🏪</div>
          <h3>Kwa Rejareja</h3>
          <ul>
            <li>✓ Agiza bila kufunga duka lako</li>
            <li>✓ Tazama maduka ya jumla karibu nawe</li>
            <li>✓ Fuatilia agizo lako wakati halisi</li>
            <li>✓ Historia ya maagizo yako yote</li>
          </ul>
          <Link to="/jisajili" className="forwhom-btn">Anza Bure →</Link>
        </div>

        <div className="forwhom-card jumla-card">
          <div className="forwhom-badge">Mwezi 1 BURE</div>
          <div className="forwhom-icon">🚛</div>
          <h3>Kwa Jumla</h3>
          <ul>
            <li>✓ Pokea maagizo mahali pamoja</li>
            <li>✓ Fikia rejareja zaidi bila ziara</li>
            <li>✓ Panga ratiba ya uwasilishaji</li>
            <li>✓ Takwimu za mauzo kila mwezi</li>
          </ul>
          <Link to="/jisajili" className="forwhom-btn jumla-btn">Jaribu Bure →</Link>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="footer-cta">
        <h2>Uko Tayari Kuboresha Biashara Yako?</h2>
        <p>Jiunge na wafanyabiashara wanaotumia DukaConnect kukua haraka zaidi.</p>
        <Link to="/jisajili" className="btn-primary btn-hero">
          Jisajili Sasa — Ni Bure
        </Link>
      </section>

      <footer className="land-footer">
        <img src="/logo-light.png" alt="DukaConnect" className="footer-logo-img" />
        <span>© 2026 · Imetengenezwa Tanzania 🇹🇿</span>
        <span className="footer-credit">Imetengenezwa na <a href="https://zetuniz.github.io/" target="_blank" rel="noopener noreferrer" className="footer-brand-link">ZETU BRANDING</a></span>
      </footer>

    </div>
  )
}
