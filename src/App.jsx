import { useEffect, useRef, useState } from 'react'
import { Autoplay, Keyboard, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'swiper/css'
import 'swiper/css/pagination'
import data from './data/portfolio.json'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

/* ──────────────────────────────────────────────────────────────
   LIGHTNING CANVAS – animated electric bolts on the background
   ────────────────────────────────────────────────────────────── */
function LightningCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /**
     * Recursive jagged lightning segment
     */
    function drawBolt(x1, y1, x2, y2, depth, alpha) {
      if (depth <= 0) {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(255, 45, 45, ${alpha})`
        ctx.lineWidth = 0.8
        ctx.shadowColor = 'rgba(255, 45, 45, 0.8)'
        ctx.shadowBlur = 8
        ctx.stroke()
        return
      }
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 80 / depth
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 80 / depth
      drawBolt(x1, y1, midX, midY, depth - 1, alpha)
      drawBolt(midX, midY, x2, y2, depth - 1, alpha)

      // branch
      if (depth > 1 && Math.random() < 0.4) {
        const branchX = midX + (Math.random() - 0.5) * 120
        const branchY = midY + Math.random() * 120
        drawBolt(midX, midY, branchX, branchY, depth - 1, alpha * 0.5)
      }
    }

    let flashTimeout
    let animId

    function flash() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const startX = Math.random() * canvas.width
      const startY = 0
      const endX   = startX + (Math.random() - 0.5) * 300
      const endY   = canvas.height * (0.5 + Math.random() * 0.5)

      let frame = 0
      const maxFrames = 6

      function animate() {
        if (frame >= maxFrames) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          // schedule next flash
          flashTimeout = setTimeout(flash, 3000 + Math.random() * 5000)
          return
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const alpha = frame % 2 === 0 ? 0.7 + Math.random() * 0.3 : 0
        if (alpha > 0) drawBolt(startX, startY, endX, endY, 4, alpha)
        frame++
        animId = requestAnimationFrame(animate)
      }
      animate()
    }

    flashTimeout = setTimeout(flash, 1500)

    return () => {
      clearTimeout(flashTimeout)
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="lightning-canvas" aria-hidden="true" />
}

/* ──────────────────────────────────────────────────────────────
   NAVIGATION
   ────────────────────────────────────────────────────────────── */
function Navigation({ links }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive]     = useState('#home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // highlight active section
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`)
        })
      },
      { threshold: 0.35 }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <a className="brand" href="#home" aria-label="KC – Go to top">KC</a>
      <nav aria-label="Primary navigation">
        {links.map((link) => (
          <a
            href={link.href}
            key={link.label}
            className={active === link.href ? 'active' : ''}
          >
            {link.label}
          </a>
        ))}
        <a href="#contact" className="nav-cta">
          ⚡ Hire me
        </a>
      </nav>
    </header>
  )
}

/* ──────────────────────────────────────────────────────────────
   HERO
   ────────────────────────────────────────────────────────────── */
function Hero({ profile, stats }) {
  return (
    <section className="hero-section" id="home">
      {/* ── Left: copy ── */}
      <div className="hero-copy hero-anim">
        <div className="hero-badge">
          <span className="dot" />
          {profile.availability}
        </div>

        <h1>
          Building
          <span className="hero-headline-accent"> AI-Powered</span>
          <br />
          Digital Products
        </h1>

        <p className="hero-summary">{profile.summary}</p>

        <div className="hero-actions">
          <a href="#contact" className="btn-primary">
            ⚡ Let's build together
          </a>
          <a href="#projects" className="btn-secondary">
            View my work →
          </a>
          <a
            href="/keshav_cv.pdf"
            download="Keshavkumar_Choudhary_CV.pdf"
            className="btn-cv"
            title="Download my CV"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CV
          </a>
        </div>

        <div className="hero-stats">
          {stats.map((stat) => (
            <div className="hero-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: portrait ── */}
      <div className="hero-visual hero-anim">
        <div className="hero-ring" aria-hidden="true" />
        <div className="hero-ring hero-ring-2" aria-hidden="true" />

        <div className="hero-portrait-wrap" id="hero-portrait">
          <img
            src="/keshav_profile_pic.png"
            alt={`Portrait of ${profile.name}`}
          />
          {/* Name overlay on portrait */}
          <div className="hero-name-card">
            <span>{profile.role}</span>
            <strong>{profile.name}</strong>
            <em>📍 {profile.location}</em>
          </div>
        </div>

        {/* Floating badge chips */}
        <div className="hero-badge-float float-badge-1">
          <span className="badge-icon">🤖</span>
          AI Integration
        </div>
        <div className="hero-badge-float float-badge-2">
          <span className="badge-icon">⚡</span>
          MERN Stack
        </div>
        <div className="hero-badge-float float-badge-3">
          <span className="badge-icon">🚀</span>
          Agentic AI
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hero-scroll" aria-hidden="true">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   ABOUT
   ────────────────────────────────────────────────────────────── */
function About({ profile, focusAreas }) {
  return (
    <section className="page-section" id="about">
      <div className="about-section">
        <div className="section-header reveal">
          <span className="section-eyebrow">About me</span>
          <h2>Why teams hire me to build AI products</h2>
          <p>{profile.about}</p>
        </div>

        <div className="focus-grid reveal">
          {focusAreas.map((area) => (
            <article className="focus-card" key={area.title}>
              <div className="focus-number">{area.number}</div>
              <div>
                <h3>{area.title}</h3>
              </div>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   SKILLS
   ────────────────────────────────────────────────────────────── */
function Skills({ groups }) {
  return (
    <section className="page-section" id="skills">
      <div className="section-header reveal">
        <span className="section-eyebrow">Toolkit</span>
        <h2>The stack I use to ship polished experiences</h2>
        <p>
          From front-end architecture to backend services and AI workflows,
          I build systems that stay reliable as they grow.
        </p>
      </div>

      <div className="skill-grid reveal">
        {groups.map((group) => (
          <article className="skill-card" key={group.name}>
            <h3>{group.name}</h3>
            <div className="tag-list">
              {group.items.map((item) => (
                <span className="tag" key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   EXPERIENCE
   ────────────────────────────────────────────────────────────── */
function Experience({ roles }) {
  return (
    <section className="page-section" id="experience">
      <div className="section-header reveal">
        <span className="section-eyebrow">Experience</span>
        <h2>A developer who moves from idea to launch</h2>
        <p>
          1.5 years of hands-on experience turning product requirements into
          clean interfaces, scalable APIs, and conversational AI features.
        </p>
      </div>

      <div className="timeline reveal">
        {roles.map((role) => (
          <article className="timeline-item" key={`${role.company}-${role.period}`}>
            <span className="timeline-period">{role.period}</span>
            <h3>{role.title}</h3>
            <span className="timeline-company">{role.company}</span>
            <ul>
              {role.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   PROJECTS
   ────────────────────────────────────────────────────────────── */
function Projects({ projects }) {
  return (
    <section className="page-section project-section" id="projects">
      <div className="section-header reveal">
        <span className="section-eyebrow">Selected work</span>
        <h2>Product-ready builds and AI experiments</h2>
        <p>
          A curated view of the systems I have helped shape — from engaging
          user experiences to workflow automation.
        </p>
      </div>

      <Swiper
        className="project-swiper reveal"
        modules={[Autoplay, Keyboard, Pagination]}
        autoplay={{ delay: 3800, disableOnInteraction: false }}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        spaceBetween={20}
        breakpoints={{
          0:    { slidesPerView: 1 },
          680:  { slidesPerView: 2 },
          1080: { slidesPerView: 3 },
        }}
      >
        {projects.map((project) => (
          <SwiperSlide key={project.name}>
            <article className="project-card">
              <div>
                <span className="project-type">{project.type}</span>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
              <div className="project-footer">
                {project.link && (
                  <a
                    className="btn-secondary project-link"
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit Project ↗
                  </a>
                )}
                <div className="tag-list">
                  {project.tech.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   SERVICES
   ────────────────────────────────────────────────────────────── */
const SERVICE_ICONS = ['🤖', '⚛️', '🔮']

function Services({ services }) {
  return (
    <section className="page-section" id="services">
      <div className="section-header reveal">
        <span className="section-eyebrow">Services</span>
        <h2>What I can build for your next launch</h2>
        <p>
          I help founders and teams turn ideas into polished digital products
          with AI features that users trust and enjoy.
        </p>
      </div>

      <div className="service-grid reveal">
        {services.map((service, i) => (
          <article className="service-card" key={service.title}>
            <div className="service-icon">{SERVICE_ICONS[i % SERVICE_ICONS.length]}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   CONTACT
   ────────────────────────────────────────────────────────────── */
function Contact({ profile, links }) {
  const [form, setForm]       = useState({ name: '', email: '', message: '' })
  const [status, setStatus]   = useState('idle') // idle | sending | sent | error
  const [touched, setTouched] = useState({})

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const errors = {
    name:    form.name.trim().length < 2    ? 'Name must be at least 2 characters' : '',
    email:   !isValidEmail(form.email)      ? 'Enter a valid email address'        : '',
    message: form.message.trim().length < 10 ? 'Message must be at least 10 characters' : '',
  }
  const isValid = !errors.name && !errors.email && !errors.message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid) return

    setStatus('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send message right now.')
      }

      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
      setTouched({})
    } catch (error) {
      console.error('Contact form submission failed:', error)
      setStatus('error')
    }
  }

  return (
    <section className="contact-outer reveal" id="contact">
      {/* ── Top CTA banner ── */}
      <div className="contact-section">
        <div className="contact-inner">
          <div>
            <span>Let's work together</span>
            <h2>Ready to turn your idea into a standout product?</h2>
            <p>{profile.contactNote}</p>
          </div>
          <div className="contact-actions">
            <a className="btn-primary" href={`mailto:${profile.email}`}>
              ✉️ {profile.email}
            </a>
            {links.map((link) => (
              <a
                className="btn-secondary"
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noreferrer"
              >
                {link.label} ↗
              </a>
            ))}
            <a
              href="/keshav_cv.pdf"
              download="Keshavkumar_Choudhary_CV.pdf"
              className="btn-secondary btn-cv-contact"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download CV
            </a>
          </div>
        </div>
      </div>

      {/* ── Message form ── */}
      <div className="contact-form-wrap">
        <div className="contact-form-header">
          <span className="section-eyebrow">Send a message</span>
          <h3>Drop me a line — I read every message</h3>
          <p>Have a project idea, a question, or just want to say hi? Fill in the form and I'll get back to you within 24 hours.</p>
        </div>

        {status === 'sent' ? (
          <div className="form-success" role="alert">
            <div className="form-success-icon">⚡</div>
            <h4>Message sent!</h4>
            <p>Thanks for reaching out, {form.name || 'there'}. I'll reply within 24 hours.</p>
            <button className="btn-primary" onClick={() => setStatus('idle')} style={{ marginTop: 16 }}>
              Send another
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cf-name">Your Name</label>
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  placeholder="Keshav Choudhary"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touched.name && errors.name ? 'input-error' : ''}
                  autoComplete="name"
                />
                {touched.name && errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cf-email">Email Address</label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touched.email && errors.email ? 'input-error' : ''}
                  autoComplete="email"
                />
                {touched.email && errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cf-message">Message</label>
              <textarea
                id="cf-message"
                name="message"
                rows={5}
                placeholder="Hi Keshav, I have a project idea..."
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.message && errors.message ? 'input-error' : ''}
              />
              {touched.message && errors.message && (
                <span className="field-error">{errors.message}</span>
              )}
              <span className="char-count">{form.message.length} / 1000</span>
            </div>

            {status === 'error' && (
              <span className="field-error" style={{ marginTop: 8 }}>
                Message could not be sent. Please try again later.
              </span>
            )}

            <button
              type="submit"
              className="btn-primary btn-submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? (
                <><span className="spinner" aria-hidden="true" /> Sending…</>
              ) : (
                <>⚡ Send Message</>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────
   ROOT APP
   ────────────────────────────────────────────────────────────── */
function App() {
  const appRef = useRef(null)

  /* ── GSAP animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from('.site-header', {
        y: -24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.1,
      })

      // Hero elements stagger
      gsap.from('.hero-anim', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.4,
      })

      // Scroll-triggered reveals
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      // Red glow pulse on hero heading
      gsap.to('.hero-headline-accent', {
        textShadow: '0 0 40px rgba(255,45,45,0.5)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // Portrait float (already in CSS, but let GSAP handle for better perf)
      gsap.to('#hero-portrait', {
        y: -14,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      })

      // Timeline items stagger
      gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.fromTo(
          item,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      // Skill cards
      gsap.utils.toArray('.skill-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.07,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      // Service cards
      gsap.utils.toArray('.service-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      // Section headers
      gsap.utils.toArray('.section-header').forEach((header) => {
        gsap.fromTo(
          header,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

    }, appRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="app-shell" ref={appRef}>
      <LightningCanvas />
      <Navigation links={data.navigation} />
      <main>
        <Hero   profile={data.profile} stats={data.stats} />
        <div className="red-divider" aria-hidden="true" />
        <About  profile={data.profile} focusAreas={data.focusAreas} />
        <Skills groups={data.skills} />
        <Experience roles={data.experience} />
        <Projects   projects={data.projects} />
        <Services   services={data.services} />
        <Contact    profile={data.profile} links={data.socialLinks} />
      </main>
      <footer>
        <p>© 2024 <span>Keshavkumar Choudhary</span>. Built with ⚡ and precision.</p>
        <p>MERN Stack · AI Integration · Agentic AI</p>
      </footer>
    </div>
  )
}

export default App
