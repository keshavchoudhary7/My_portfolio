import { useEffect, useRef, useState } from 'react'
import { FreeMode, Keyboard, Mousewheel, Navigation as NavigationModule, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/free-mode'
import data from './data/portfolio.json'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

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

function CursorParticles() {
  const canvasRef = useRef(null)
  const pointerRef = useRef({ x: -100, y: -100, tx: -100, ty: -100, active: false })
  const particlesRef = useRef([])

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isFinePointer || reduceMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let frameId
    let lastEmit = 0

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const emitParticle = (x, y) => {
      particlesRef.current.push({
        x: x - 3 + Math.random() * 6,
        y: y - 3 + Math.random() * 6,
        vx: -0.35 + Math.random() * 0.7,
        vy: -0.35 + Math.random() * 0.7,
        life: 0.98,
        size: 0.8 + Math.random() * 2.2,
        hue: Math.random() > 0.78 ? 'white' : 'accent',
      })

      if (particlesRef.current.length > 60) {
        particlesRef.current.splice(0, particlesRef.current.length - 60)
      }
    }

    const onPointerMove = (event) => {
      const pointer = pointerRef.current
      pointer.tx = event.clientX
      pointer.ty = event.clientY
      pointer.active = true

      const now = performance.now()
      if (now - lastEmit > 20) {
        emitParticle(event.clientX, event.clientY)
        lastEmit = now
      }
    }

    const onPointerLeave = () => {
      pointerRef.current.active = false
    }

    const drawCursor = (x, y, active) => {
      // small, sleek cursor with subtle glow and ring
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-0.35)

      // main chevron / pointer (smaller)
      ctx.beginPath()
      ctx.moveTo(0, -6)
      ctx.lineTo(6, 6)
      ctx.lineTo(2, 6)
      ctx.lineTo(0, 2)
      ctx.closePath()

      ctx.fillStyle = 'rgba(18,18,18,0.95)'
      ctx.strokeStyle = active ? 'rgba(255, 68, 68, 0.95)' : 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 1
      ctx.shadowColor = 'rgba(255, 68, 68, 0.14)'
      ctx.shadowBlur = active ? 12 : 6
      ctx.fill()
      ctx.stroke()

      ctx.restore()

      // soft accent ring
      ctx.beginPath()
      ctx.arc(x, y, active ? 12 : 9, 0, Math.PI * 2)
      ctx.strokeStyle = active ? 'rgba(255,68,68,0.12)' : 'rgba(255,255,255,0.06)'
      ctx.lineWidth = active ? 2.5 : 1.2
      ctx.stroke()

      // inner subtle glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, active ? 22 : 16)
      grad.addColorStop(0, 'rgba(255,68,68,0.06)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, active ? 22 : 16, 0, Math.PI * 2)
      ctx.fill()
    }

    const draw = () => {
      const pointer = pointerRef.current
      // smoother, slightly slower follow for a premium feel
      pointer.x += (pointer.tx - pointer.x) * 0.16
      pointer.y += (pointer.ty - pointer.y) * 0.16

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0.03)
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.012
        particle.life *= 0.92

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2)
        if (particle.hue === 'white') {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.42 * particle.life})`
          ctx.shadowColor = 'rgba(255,255,255,0.36)'
        } else {
          ctx.fillStyle = `rgba(255, 68, 68, ${0.62 * particle.life})`
          ctx.shadowColor = 'rgba(255,68,68,0.5)'
        }
        ctx.shadowBlur = 8 * particle.life
        ctx.fill()
      })

      if (pointer.active) drawCursor(pointer.x, pointer.y, true)
      frameId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    frameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-particles" aria-hidden="true" />
}
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
      <a className="brand" href="#home" aria-label="KC - Go to top">KC</a>
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
          Hire me
        </a>
      </nav>
    </header>
  )
}

function Hero({ profile, stats }) {
  return (
    <section className="hero-section" id="home">
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
            Let's build together
          </a>
          <a href="#projects" className="btn-secondary">
            View my work
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
      <div className="hero-visual hero-anim">
        <div className="hero-ring" aria-hidden="true" />
        <div className="hero-ring hero-ring-2" aria-hidden="true" />

        <div className="hero-portrait-wrap" id="hero-portrait">
          <img
            src="/keshav_profile_pic.png"
            alt={`Portrait of ${profile.name}`}
          />
          <div className="hero-name-card">
            <span>{profile.role}</span>
            <strong>{profile.name}</strong>
            <em>Based in {profile.location}</em>
          </div>
        </div>
        {/* <div className="hero-badge-float float-badge-1">
          <span className="badge-icon">AI</span>
          AI Integration
        </div> */}
        {/* <div className="hero-badge-float float-badge-2">
          <span className="badge-icon">JS</span>
          MERN Stack
        </div>
        <div className="hero-badge-float float-badge-3">
          <span className="badge-icon">AG</span>
          Agentic AI
        </div> */}
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}

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

function Experience({ roles }) {
  return (
    <section className="page-section" id="experience">
      <div className="section-header reveal">
        <span className="section-eyebrow">Experience</span>
        <h2>Professional experience</h2>
        <p>
          Experience building enterprise and startup software with polished front-end interfaces,
          reliable backend services, and data-driven product workflows.
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

function Projects({ projects }) {
  const [expandedProject, setExpandedProject] = useState(null)

  const toggleExpanded = (projectName) => {
    setExpandedProject((current) => (current === projectName ? null : projectName))
  }

  const truncateDescription = (description) =>
    description.length > 140 ? `${description.slice(0, 140)}...` : description

  return (
    <section className="page-section project-section" id="projects">
      <div className="section-header reveal">
        <span className="section-eyebrow">Selected work</span>
        <h2>Product-ready builds and AI experiments</h2>
        <p>
          A curated view of the systems I have helped shape - from engaging
          user experiences to workflow automation.
        </p>
      </div>

      <div className="project-carousel-tools reveal" aria-label="Project carousel controls">
        <span>Drag, swipe, use trackpad, or jump with controls</span>
        <div className="project-nav-buttons">
          <button type="button" className="project-nav-btn project-prev" aria-label="Previous project">
            Prev
          </button>
          <button type="button" className="project-nav-btn project-next" aria-label="Next project">
            Next
          </button>
        </div>
      </div>

      <Swiper
        className="project-swiper reveal"
        modules={[FreeMode, Keyboard, Mousewheel, NavigationModule, Pagination]}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{ nextEl: '.project-next', prevEl: '.project-prev' }}
        mousewheel={{ forceToAxis: true, sensitivity: 0.75, releaseOnEdges: true }}
        freeMode={{ enabled: true, momentum: true, momentumRatio: 0.65, sticky: false }}
        grabCursor
        simulateTouch
        touchRatio={1.25}
        touchReleaseOnEdges
        threshold={4}
        speed={620}
        resistanceRatio={0.72}
        noSwipingSelector="a, button"
        spaceBetween={20}
        breakpoints={{
          0:    { slidesPerView: 1.04, spaceBetween: 14 },
          680:  { slidesPerView: 2.05, spaceBetween: 18 },
          1080: { slidesPerView: 3, spaceBetween: 20 },
        }}
      >
        {projects.map((project) => {
          const isExpanded = expandedProject === project.name
          const description = isExpanded
            ? project.description
            : truncateDescription(project.description)

          return (
            <SwiperSlide key={project.name}>
              <article
                className="project-card"
                style={project.image ? {
                  backgroundImage: `linear-gradient(rgba(4,11,17,0.88), rgba(4,11,17,0.74)), url(${project.image})`
                } : undefined}
              >
                <div>
                  <span className="project-type">{project.type}</span>
                  <h3>{project.name}</h3>
                  <p>{description}</p>
                </div>
                <div className="project-footer">
                  <div className="project-footer-row">
                    {project.link && (
                      <a
                        className="btn-secondary project-link"
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit Project
                      </a>
                    )}
                    {project.description.length > 140 && (
                      <button
                        type="button"
                        className="project-toggle"
                        onClick={() => toggleExpanded(project.name)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                  <div className="tag-list">
                    {project.tech.map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </section>
  )
}

function LearningProjects({ learningProjects }) {
  const [expandedProject, setExpandedProject] = useState(null)

  const toggleExpanded = (projectName) => {
    setExpandedProject((current) => (current === projectName ? null : projectName))
  }

  const truncateDescription = (description) =>
    description.length > 140 ? `${description.slice(0, 140)}...` : description

  if (!learningProjects || learningProjects.length === 0) return null

  return (
    <section className="page-section project-section" id="learning-projects">
      <div className="section-header reveal">
        <span className="section-eyebrow">Learning projects</span>
        <h2>Small builds and experiments</h2>
        <p>
          Short projects I built while learning new parts of the stack. Links go to live demos.
        </p>
      </div>

      <div className="project-carousel-tools reveal" aria-label="Learning project controls">
        <span>Click a card to visit the demo</span>
      </div>

      <Swiper
        className="project-swiper reveal"
        modules={[FreeMode, Keyboard, Mousewheel, NavigationModule, Pagination]}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        mousewheel={{ forceToAxis: true, sensitivity: 0.75, releaseOnEdges: true }}
        freeMode={{ enabled: true, momentum: true, momentumRatio: 0.65, sticky: false }}
        grabCursor
        simulateTouch
        touchRatio={1.25}
        touchReleaseOnEdges
        threshold={4}
        speed={620}
        resistanceRatio={0.72}
        noSwipingSelector="a, button"
        spaceBetween={20}
        breakpoints={{
          0:    { slidesPerView: 1.04, spaceBetween: 14 },
          680:  { slidesPerView: 2.05, spaceBetween: 18 },
          1080: { slidesPerView: 3, spaceBetween: 20 },
        }}
      >
        {learningProjects.map((project) => {
          const isExpanded = expandedProject === project.name
          const description = isExpanded
            ? project.description
            : truncateDescription(project.description)

          return (
            <SwiperSlide key={project.name}>
              <article className="project-card">
                <div>
                  <span className="project-type">Learning</span>
                  <h3>{project.name}</h3>
                  <p>{description}</p>
                </div>
                <div className="project-footer">
                  <div className="project-footer-row">
                    {project.link && (
                      <a
                        className="btn-secondary project-link"
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit Project
                      </a>
                    )}
                    {project.description.length > 140 && (
                      <button
                        type="button"
                        className="project-toggle"
                        onClick={() => toggleExpanded(project.name)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                  <div className="tag-list">
                    {(project.tech || []).map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </section>
  )
}

const SERVICE_ICONS = ['AI', 'FS', 'AG']

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

function Contact({ profile, links }) {
  const [form, setForm]       = useState({ name: '', email: '', message: '' })
  const [status, setStatus]   = useState('idle') // idle | sending | sent | error
  const [touched, setTouched] = useState({})
  const [submitError, setSubmitError] = useState('')

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
    setSubmitError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
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

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to send message right now.')
      }

      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
      setTouched({})
    } catch (error) {
      console.error('Contact form submission failed:', error)
      setSubmitError(error.message || 'Unable to send message right now.')
      setStatus('error')
    }
  }

  return (
    <section className="contact-outer reveal" id="contact">
      <div className="contact-section">
        <div className="contact-inner">
          <div>
            <span>Let's work together</span>
            <h2>Ready to turn your idea into a standout product?</h2>
            <p>{profile.contactNote}</p>
          </div>
          <div className="contact-actions">
            <a className="btn-primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            {links.map((link) => (
              <a
                className="btn-secondary"
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
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
      <div className="contact-form-wrap">
        <div className="contact-form-header">
          <span className="section-eyebrow">Send a message</span>
          <h3>Drop me a line - I read every message</h3>
          <p>Have a project idea, a question, or just want to say hi? Fill in the form and I'll get back to you within 24 hours.</p>
        </div>

        {status === 'sent' ? (
          <div className="form-success" role="alert">
            <div className="form-success-icon">OK</div>
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
                {submitError || 'Message could not be sent. Please try again later.'}
              </span>
            )}

            <button
              type="submit"
              className="btn-primary btn-submit"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? (
                <><span className="spinner" aria-hidden="true" /> Sending...</>
              ) : (
                <>Send Message</>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

function App() {
  const appRef = useRef(null)

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
      <CursorParticles />
      <Navigation links={data.navigation} />
      <main>
        <Hero   profile={data.profile} stats={data.stats} />
        <div className="red-divider" aria-hidden="true" />
        <About  profile={data.profile} focusAreas={data.focusAreas} />
        <Skills groups={data.skills} />
        <Experience roles={data.experience} />
        <Projects   projects={data.projects} />
        <LearningProjects learningProjects={data.learningProjects} />
        <Services   services={data.services} />
        <Contact    profile={data.profile} links={data.socialLinks} />
      </main>
      <footer>
        <p>Copyright 2024 <span>Keshav kumar Choudhary</span>. Built with care and precision.</p>
        <p>MERN Stack | AI Integration | Agentic AI</p>
      </footer>
    </div>
  )
}

export default App


