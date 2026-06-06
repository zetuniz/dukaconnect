import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, MapPin, Bell, ShieldCheck, ChevronDown, BarChart2, Smartphone } from 'lucide-react'
import './Landing.css'

const FAQS = [
  { q: 'Je, DukaConnect ni bure?', a: 'Ndiyo! Kujisajili na kutumia DukaConnect ni bure kabisa. Hakuna ada ya kuanza wala malipo ya siri.' },
  { q: 'Ninahitaji simu ya bei gani?', a: 'DukaConnect inafanya kazi kwenye simu yoyote ya kisasa — Android au iPhone. Inafunguka kwenye browser ya simu yako, hakuna haja ya kudownload app.' },
  { q: 'Je, inahitaji intaneti daima?', a: 'Unahitaji intaneti kidogo tu kutuma agizo au kupokea. Hata mtandao wa 2G/3G wa kawaida unatosha vizuri.' },
  { q: 'Duka langu liko nje ya Mbeya — naweza kutumia?', a: 'Sasa hivi tunaanza Mbeya. Lakini tunafanya kazi ya haraka kupanua kwenye miji mingine ya Tanzania — Dar, Mwanza, Arusha na zaidi.' },
  { q: 'Nywila yangu ikisahaulika nifanye nini?', a: 'Bonyeza "Nimesahau nywila" kwenye ukurasa wa kuingia. Utapata link ya kubadilisha nywila kwenye barua pepe yako mara moja.' },
]

const TESTIMONIALS = [
  {
    jina: 'Mama Fatuma M.',
    duka: 'Duka la Rejareja — Mbeya',
    icon: '🏪',
    maoni: 'Zamani nilikuwa napoteza muda mrefu kufuata jumla. Sasa natuma agizo usiku, asubuhi bidhaa zinakuja. DukaConnect imebadilisha biashara yangu kabisa!',
    nyota: 5,
  },
  {
    jina: 'Bwana Hassan K.',
    duka: 'Jumla Shop — Mbeya Mjini',
    icon: '🚛',
    maoni: 'Nilikuwa napokea maagizo kwa WhatsApp — vikumbusho vinalichanganya. Sasa kila kitu kipo mahali pamoja. Wateja wangu wanafurahi na mimi pia.',
    nyota: 5,
  },
  {
    jina: 'Dada Neema T.',
    duka: 'Duka la Rejareja — Soweto',
    icon: '🏪',
    maoni: 'Nilijaribu kwa wasiwasi kidogo lakini baada ya agizo la kwanza nikapenda. Rahisi sana hata mama ambaye hajui teknolojia sana anaweza kutumia.',
    nyota: 5,
  },
]

function StarRow({ count }) {
  return <span className="test-stars">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="landing">

      {/* FLOATING WHATSAPP */}
      <a
        href="https://wa.me/255000000000?text=Habari%2C%20nataka%20kujua%20zaidi%20kuhusu%20DukaConnect"
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
        title="Piga WhatsApp"
      >
        💬
      </a>

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
          <span>✓ Inafanya kazi kwa simu yoyote</span>
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

      {/* FEATURES */}
      <section className="features-section">
        <div className="section-label">UNACHOPATA</div>
        <h2 className="section-title">Kila Kitu Mahali Pamoja</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Zap size={28} /></div>
            <h3>Maagizo ya Haraka</h3>
            <p>Tuma agizo kwa sekunde chache. Jumla anaona mara moja kwenye simu yake — bila kupiga simu, bila WhatsApp.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Bell size={28} /></div>
            <h3>Arifa Wakati Halisi</h3>
            <p>Pata taarifa papo hapo agizo lako likipokewa, kukubaliwa, au bidhaa zikiwa njiani.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><BarChart2 size={28} /></div>
            <h3>Takwimu za Biashara</h3>
            <p>Jumla wanaona mapato ya kila mwezi, maagizo yaliyokamilika, na tathmini za wateja wao.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Smartphone size={28} /></div>
            <h3>Inafanya Kazi Simu</h3>
            <p>Hakuna app ya kudownload. Fungua browser yako tu — iPhone au Android — DukaConnect inafanya kazi vizuri.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><MapPin size={28} /></div>
            <h3>Maduka Karibu Nawe</h3>
            <p>Tafuta jumla au bidhaa maalum katika jiji lako haraka. Ona bei, maelezo, na tathmini za wengine.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={28} /></div>
            <h3>Salama na Imara</h3>
            <p>Data yako inalindwa na teknolojia ya kisasa. Nywila zako na maelezo ya biashara yako ni salama kabisa.</p>
          </div>
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

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="section-label">WANASEMA NINI</div>
        <h2 className="section-title">Wafanyabiashara Wanatuambia</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <StarRow count={t.nyota} />
              <p className="test-maoni">"{t.maoni}"</p>
              <div className="test-author">
                <span className="test-icon">{t.icon}</span>
                <div>
                  <div className="test-jina">{t.jina}</div>
                  <div className="test-duka">{t.duka}</div>
                </div>
              </div>
            </div>
          ))}
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

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-label">MASWALI</div>
        <h2 className="section-title">Maswali Yanayoulizwa Mara Nyingi</h2>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'faq-open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{f.q}</span>
                <ChevronDown size={20} className="faq-chevron" />
              </button>
              {openFaq === i && (
                <div className="faq-answer">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="footer-cta">
        <div className="footer-cta-badge">🚀 Jiunge Leo</div>
        <h2>Uko Tayari Kuboresha Biashara Yako?</h2>
        <p>Jiunge na wafanyabiashara wanaotumia DukaConnect kukua haraka zaidi.</p>
        <div className="footer-cta-btns">
          <Link to="/jisajili" className="btn-primary btn-hero">
            Jisajili Sasa — Ni Bure
          </Link>
          <a
            href="https://wa.me/255000000000?text=Habari%2C%20nataka%20kujua%20zaidi%20kuhusu%20DukaConnect"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta-wa"
          >
            💬 Piga WhatsApp
          </a>
        </div>
      </section>

      <footer className="land-footer">
        <img src="/logo-light.png" alt="DukaConnect" className="footer-logo-img" />
        <span>© 2026 · Imetengenezwa Tanzania 🇹🇿</span>
        <span className="footer-credit">Imetengenezwa na <a href="https://zetuniz.github.io/" target="_blank" rel="noopener noreferrer" className="footer-brand-link">ZETU BRANDING</a></span>
      </footer>

    </div>
  )
}
