<script>
  import { onMount } from 'svelte';

  const counterEndpoint = 'https://kjnbxinxccc3nk7bs6r4qqx7ta0vjwid.lambda-url.ca-central-1.on.aws/';
  const visitorStorageKey = 'samuel-okorie-resume-visitor-id';

  const createVisitorId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const randomValues = new Uint32Array(4);
      window.crypto.getRandomValues(randomValues);
      return Array.from(randomValues, (value) => value.toString(16).padStart(8, '0')).join('-');
    }

    return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  };

  const getVisitorId = () => {
    try {
      const existingId = window.localStorage.getItem(visitorStorageKey);
      if (existingId) return existingId;

      const visitorId = createVisitorId();
      window.localStorage.setItem(visitorStorageKey, visitorId);
      return visitorId;
    } catch (error) {
      console.warn('Visitor identity storage unavailable', error);
      return createVisitorId();
    }
  };

  onMount(() => {
    const body = document.body;
    const header = document.querySelector('[data-site-header]');
    const toggle = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-nav-panel]');
    const navLinks = panel ? Array.from(panel.querySelectorAll('a')) : [];
    /** @type {Array<() => void>} */
    const cleanupCallbacks = [];

    /**
     * @param {EventTarget} target
     * @param {string} eventName
     * @param {EventListener} handler
     */
    const addListener = (target, eventName, handler) => {
      target.addEventListener(eventName, handler);
      cleanupCallbacks.push(() => target.removeEventListener(eventName, handler));
    };

    const closeMenu = () => {
      if (!toggle || !panel) return;
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      body.classList.remove('nav-open');
    };

    const openMenu = () => {
      if (!toggle || !panel) return;
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      body.classList.add('nav-open');
    };

    if (toggle && panel) {
      addListener(toggle, 'click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMenu() : openMenu();
      });

      navLinks.forEach((link) => {
        addListener(link, 'click', closeMenu);
      });

      addListener(document, 'keydown', (event) => {
        if (event instanceof KeyboardEvent && event.key === 'Escape') closeMenu();
      });

      addListener(document, 'click', (event) => {
        if (!body.classList.contains('nav-open')) return;
        if (header && event.target instanceof Node && header.contains(event.target)) return;
        closeMenu();
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      addListener(anchor, 'click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        event.preventDefault();
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        if (targetElement instanceof HTMLElement) {
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus({ preventScroll: true });
        }
      });
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const showWelcomeToast = (/** @type {number} */ visitorNumber) => {
      const toast = document.createElement('div');
      toast.className = 'welcome-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);

      const lines = [
        { prompt: '$', text: ' ./hello.sh --new-visitor' },
        { prompt: '>', text: ' 👾 first boot detected' },
        { prompt: '>', text: ` you're visitor #${visitorNumber} · welcome 🟢` },
      ];

      const addLine = (/** @type {string} */ prompt, /** @type {string} */ text, /** @type {number} */ startDelay) => {
        setTimeout(() => {
          const line = document.createElement('p');
          line.className = 'welcome-toast__line';

          const promptEl = document.createElement('span');
          promptEl.className = 'welcome-toast__prompt';
          promptEl.textContent = prompt;

          const textEl = document.createElement('span');
          line.append(promptEl, textEl);
          toast.appendChild(line);

          if (reducedMotion) {
            textEl.textContent = text;
            return;
          }

          let i = 0;
          const type = () => {
            if (i < text.length) {
              textEl.textContent += text[i++];
              setTimeout(type, 28);
            }
          };
          type();
        }, startDelay);
      };

      const delays = reducedMotion ? [0, 0, 0] : [0, 650, 1350];
      lines.forEach(({ prompt, text }, i) => addLine(prompt, text, delays[i]));

      const dismissDelay = reducedMotion ? 3000 : 5500;
      setTimeout(() => {
        toast.classList.add('is-exiting');
        setTimeout(() => toast.remove(), 350);
      }, dismissDelay);
    };

    const counter = document.querySelector('[data-counter]');
    const updateCounter = async () => {
      if (!counter) return;
      try {
        const url = new URL(counterEndpoint);
        url.searchParams.set('visitorId', getVisitorId());
        url.searchParams.set('path', window.location.pathname);

        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Counter request failed: ${response.status}`);
        const data = await response.json();
        const unique = data.unique_visitors;
        counter.textContent = unique ? `${unique} visitors` : '';
        if (data.new_visitor) showWelcomeToast(unique);
      } catch (error) {
        console.warn('Visitor counter unavailable', error);
      }
    };

    updateCounter();

    return () => {
      cleanupCallbacks.forEach((callback) => callback());
      body.classList.remove('nav-open');
    };
  });
</script>

<svelte:head>
  <title>Samuel Okorie | DevOps & Cloud Engineer</title>
  <meta
    name="description"
    content="DevOps and Cloud Engineer focused on CI/CD automation, Kubernetes platforms, infrastructure as code, monitoring, and secure cloud operations."
  />
</svelte:head>

<a class="skip-link" href="#main">Skip to main content</a>

    <header class="site-header" data-site-header>
        <nav class="site-nav" aria-label="Primary navigation">
            <a class="brand-mark" href="#page-top" aria-label="Samuel Okorie home">
                <span aria-hidden="true">$</span>
                <span>sam_okorie</span>
            </a>

            <button class="nav-toggle" type="button" aria-controls="primary-menu" aria-expanded="false" data-nav-toggle>
                <span class="nav-toggle__label">Menu</span>
                <span class="nav-toggle__icon" aria-hidden="true"></span>
            </button>

            <div class="nav-panel" id="primary-menu" data-nav-panel>
                <ul class="nav-links">
                    <li><a href="#experience">Experience</a></li>
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#skills">Skills</a></li>
                    <li><a href="#education">Education</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
                <div class="nav-actions" role="group" aria-label="Contact links">
                    <a href="mailto:thesamokorie@gmail.com">Email</a>
                    <a href="https://linkedin.com/in/sokorie/" target="_blank" rel="noreferrer">LinkedIn</a>
                </div>
            </div>
        </nav>
    </header>

    <main id="main" class="site-main">
        <section class="hero section-shell" aria-labelledby="hero-title">
            <div class="hero__content">
                <h1 id="hero-title">I help teams ship safer: cleaner pipelines, observable systems, recoverable infrastrcuture.</h1>
                <p class="hero__lede">DevOps and Cloud Engineer focused on CI/CD, Kubernetes, Infrastructure as Code, and secure cloud operations.</p>
                <div class="hero__actions" role="group" aria-label="Primary contact actions">
                    <a class="button button--primary" href="mailto:thesamokorie@gmail.com">Email Samuel</a>
                    <a class="button button--primary" href="https://linkedin.com/in/sokorie/" target="_blank" rel="noreferrer">Connect on LinkedIn</a>
                    <a class="button button--secondary" href="/assets/Samuel_Okorie.pdf" target="_blank" rel="noreferrer">View resume</a>
                </div>
            </div>

            <div class="hero-card" role="group" aria-label="Professional snapshot">
                <img class="hero-card__portrait" src="/assets/img/profile.jpg" alt="Portrait of Samuel Okorie" width="320" height="320">
                <div class="hero-card__body">
                    <p class="terminal-label">current focus</p>
                    <ul class="status-list">
                        <li><span>Cloud platforms</span><strong>AWS, GCP</strong></li>
                        <li><span>Infrastructure</span><strong>Terraform, Kubernetes</strong></li>
                        <li><span>Operations</span><strong>CI/CD, monitoring, security</strong></li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="proof-strip" aria-label="Core engineering strengths">
            <div>
                <span class="proof-strip__label">Cloud systems</span>
                <strong>AWS, GCP, hybrid connectivity, disaster recovery</strong>
            </div>
            <div>
                <span class="proof-strip__label">Automation</span>
                <strong>Terraform, Ansible, GitHub Actions, Cloud Build</strong>
            </div>
            <div>
                <span class="proof-strip__label">Reliability</span>
                <strong>Kubernetes, Prometheus, Grafana, CloudWatch</strong>
            </div>
        </section>

        <section id="experience" class="page-section" aria-labelledby="experience-title">
            <div class="section-heading">
                <h2 id="experience-title">Production experience, shaped for fast review.</h2>
            </div>

            <div class="timeline">
                <article class="timeline-item">
                    <div class="timeline-item__meta">
                        <p>March 2022 to Present</p>
                        <span>ActZero</span>
                    </div>
                    <div class="timeline-item__body">
                        <h3>Cloud Support Engineer</h3>
                        <ul class="achievement-list">
                            <li>Engineered and optimized CI/CD pipelines with GitHub Actions and GCP Cloud Build to improve deployment flow across cloud environments.</li>
                            <li>Architected Terraform-based infrastructure across AWS and GCP, including secure VPC design, hybrid cloud connectivity, and reusable modules.</li>
                            <li>Designed Kubernetes infrastructure with GKE, self-managed clusters, HPA, and cluster autoscaling for resilient resource allocation.</li>
                            <li>Built monitoring, logging, and alerting with Prometheus, Grafana, AWS CloudWatch, and Google Cloud Operations Suite.</li>
                            <li>Established AWS disaster recovery architectures and automated on-premises to cloud migrations around RPO and RTO requirements.</li>
                        </ul>
                    </div>
                </article>

                <article class="timeline-item">
                    <div class="timeline-item__meta">
                        <p>January 2019 to February 2022</p>
                        <span>IntelliGO Networks</span>
                    </div>
                    <div class="timeline-item__body">
                        <h3>IT Support Analyst</h3>
                        <ul class="achievement-list">
                            <li>Improved visibility and incident response with ELK Stack and Grafana logging and monitoring.</li>
                            <li>Optimized cloud orchestration with Terraform and Ansible across AWS and GCP environments, including EKS, VPC, EC2, and Route53.</li>
                            <li>Integrated Jira with GitHub, automated security monitoring with Nexus IQ, and maintained code quality through SonarQube and Jenkins.</li>
                            <li>Reduced Linux server downtime by 15% using Prometheus and Grafana-supported automation.</li>
                            <li>Enhanced threat detection and vulnerability management with CrowdStrike, Stellar Cyber XDR, and Tenable.sc.</li>
                        </ul>
                    </div>
                </article>

                <article class="timeline-item">
                    <div class="timeline-item__meta">
                        <p>September 2014 to November 2018</p>
                        <span>Andela</span>
                    </div>
                    <div class="timeline-item__body">
                        <h3>System Administrator</h3>
                        <ul class="achievement-list">
                            <li>Hardened devices and systems with least-privilege account assignments, unused service removal, encryption enforcement, and password policy improvements.</li>
                        </ul>
                    </div>
                </article>
            </div>
        </section>

        <section id="projects" class="page-section" aria-labelledby="projects-title">
            <div class="section-heading section-heading--split">
                <div>
                    <h2 id="projects-title">Technical proof beyond the resume.</h2>
                </div>
                <p>Compact case studies that show infrastructure judgment, automation fluency, and product-minded engineering.</p>
            </div>

            <div class="project-grid">
                <article class="project-card">
                    <div class="project-card__topline">
                        <h3>Resona</h3>
                        <a href="https://resona.cv" target="_blank" rel="noreferrer">Visit resona.cv</a>
                    </div>
                    <p>A smart resume tailoring platform for LinkedIn job postings, combining a Chrome extension, dashboard, backend API, AI tailoring, and production cloud infrastructure.</p>
                    <dl class="project-facts">
                        <div>
                            <dt>Built</dt>
                            <dd>Chrome extension flow, dashboard integration, backend API, caching, auth, and payment path.</dd>
                        </div>
                        <div>
                            <dt>Stack</dt>
                            <dd>React, Next.js, Flask, OpenAI API, PostgreSQL, Redis, AWS S3/RDS, Docker, Cloudflare.</dd>
                        </div>
                        <div>
                            <dt>Signal</dt>
                            <dd>Shows product architecture, secure API design, scalable deployment thinking, and practical AI integration.</dd>
                        </div>
                    </dl>
                </article>

                <article class="project-card">
                    <div class="project-card__topline">
                        <h3>Azure Nuke</h3>
                        <a href="https://github.com/sojay/azure-nuke" target="_blank" rel="noreferrer">View on GitHub</a>
                    </div>
                    <p>A CLI tool for scanning and cleaning up Azure resources, designed to reduce cloud cost and improve security posture through safe resource management.</p>
                    <dl class="project-facts">
                        <div>
                            <dt>Built</dt>
                            <dd>Subscription scanning, dry-run deletion, filters, exclusion rules, and color-coded CLI output.</dd>
                        </div>
                        <div>
                            <dt>Stack</dt>
                            <dd>Python, Azure SDK, Azure CLI, Docker, GitHub Actions.</dd>
                        </div>
                        <div>
                            <dt>Signal</dt>
                            <dd>Shows infrastructure cleanup discipline, safety-first automation, and cloud governance awareness.</dd>
                        </div>
                    </dl>
                </article>

                <article class="project-card">
                    <div class="project-card__topline">
                        <h3>Homelab Environment</h3>
                    </div>
                    <p>A personal infrastructure environment for hands-on practice with virtualization, containerization, IAM, networking, and self-hosted systems.</p>
                    <dl class="project-facts">
                        <div>
                            <dt>Built</dt>
                            <dd>Two-node PVE cluster, reverse proxy access, traffic analysis, monitoring, and CI/CD for personal development projects.</dd>
                        </div>
                        <div>
                            <dt>Stack</dt>
                            <dd>Proxmox VE, Kubernetes, Docker, Nginx, DHCP/DNS, NAS.</dd>
                        </div>
                        <div>
                            <dt>Signal</dt>
                            <dd>Shows curiosity, systems practice, and reliable infrastructure learning outside formal work.</dd>
                        </div>
                    </dl>
                </article>
            </div>
        </section>

        <section id="skills" class="page-section" aria-labelledby="skills-title">
            <div class="section-heading">
                <h2 id="skills-title">Skills grouped by operating domain.</h2>
            </div>

            <div class="capability-grid">
                <article class="capability-group">
                    <h3>Cloud and infrastructure</h3>
                    <ul class="chip-list">
                        <li>AWS</li>
                        <li>GCP</li>
                        <li>VPC</li>
                        <li>EC2</li>
                        <li>Route53</li>
                        <li>Disaster recovery</li>
                    </ul>
                </article>
                <article class="capability-group">
                    <h3>Automation and CI/CD</h3>
                    <ul class="chip-list">
                        <li>Terraform</li>
                        <li>Ansible</li>
                        <li>GitHub Actions</li>
                        <li>GCP Cloud Build</li>
                        <li>Jenkins</li>
                        <li>GitLab</li>
                    </ul>
                </article>
                <article class="capability-group">
                    <h3>Containers and orchestration</h3>
                    <ul class="chip-list">
                        <li>Kubernetes</li>
                        <li>GKE</li>
                        <li>EKS</li>
                        <li>Docker</li>
                        <li>HPA</li>
                        <li>Cluster autoscaling</li>
                    </ul>
                </article>
                <article class="capability-group">
                    <h3>Monitoring and security</h3>
                    <ul class="chip-list">
                        <li>Prometheus</li>
                        <li>Grafana</li>
                        <li>CloudWatch</li>
                        <li>ELK Stack</li>
                        <li>CrowdStrike</li>
                        <li>Tenable.sc</li>
                    </ul>
                </article>
                <article class="capability-group">
                    <h3>Languages and systems</h3>
                    <ul class="chip-list">
                        <li>Python</li>
                        <li>JavaScript</li>
                        <li>Linux</li>
                        <li>Networking</li>
                        <li>Cybersecurity</li>
                        <li>Homelab</li>
                    </ul>
                </article>
                <article class="capability-group capability-group--certs">
                    <h3>Certifications</h3>
                    <ul class="cert-list">
                        <li>Linux Foundation: Kubernetes Certified Administrator</li>
                        <li>Amazon Web Services: Solutions Architect</li>
                        <li>Red Hat: Certified System Administrator</li>
                        <li>SAFe Agile: Scrum Master</li>
                    </ul>
                </article>
            </div>
        </section>

        <section id="education" class="page-section" aria-labelledby="education-title">
            <div class="section-heading">
                <h2 id="education-title">Formal foundation.</h2>
            </div>

            <div class="education-list">
                <article>
                    <p class="terminal-label">June 2022</p>
                    <h3>Cambrian College of Applied Art &amp; Science</h3>
                    <p>Diploma, Business Analytics</p>
                </article>
                <article>
                    <p class="terminal-label">May 2010</p>
                    <h3>University of Port-Harcourt</h3>
                    <p>Bachelor of Science, Computer Science</p>
                </article>
            </div>
        </section>

        <section id="contact" class="contact-section" aria-labelledby="contact-title">
            <div>
                <h2 id="contact-title">Let's connect.</h2>
                <!-- <p>Email and LinkedIn are equal-priority paths. The resume is available for deeper review.</p> -->
            </div>
            <div class="contact-actions" role="group" aria-label="Contact Samuel">
                <a class="button button--primary" href="mailto:thesamokorie@gmail.com">thesamokorie@gmail.com</a>
                <a class="button button--primary" href="https://linkedin.com/in/sokorie/" target="_blank" rel="noreferrer">LinkedIn profile</a>
                <a class="button button--secondary" href="https://github.com/sojay" target="_blank" rel="noreferrer">GitHub</a>
                <a class="button button--secondary" href="/assets/Samuel_Okorie.pdf" target="_blank" rel="noreferrer">Resume PDF</a>
            </div>
        </section>
    </main>

    <footer class="site-footer">
        <p>© 2026 Samuel Okorie. Reliable cloud systems, automation, and operations.</p>
        <p class="counter-number" aria-live="polite" data-counter></p>
    </footer>
