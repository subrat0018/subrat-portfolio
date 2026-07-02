import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  Code2,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import heroImage from "./assets/hero-systems.png";

type Link = {
  label: string;
  url: string;
};

type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  points: string[];
  accent: string;
};

type Project = {
  name: string;
  period: string;
  stack: string[];
  description: string;
  highlights: string[];
  link: Link;
};

type Achievement = {
  name: string;
  metric: string;
  detail: string;
  link: Link;
};

type Profile = {
  name: string;
  title: string;
  location: string;
  email: string;
  summary: string;
  links: Link[];
  stats: Link[];
  skills: string[];
  languages: string[];
  education: Link[];
  experience: Experience[];
  projects: Project[];
  achievements: Achievement[];
};

type ContactState = {
  name: string;
  email: string;
  message: string;
};

const navItems = ["Experience", "Projects", "Achievements", "Contact"];

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isStaticHost()) {
      setProfile(fallbackProfile);
      setLoading(false);
      return;
    }

    fetch("/api/profile")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load portfolio profile");
        }
        return response.json() as Promise<Profile>;
      })
      .then(setProfile)
      .catch(() => setProfile(fallbackProfile))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ShellState label="Loading portfolio" />;
  }

  if (error || !profile) {
    return <ShellState label={error || "Portfolio unavailable"} />;
  }

  return (
    <main>
      <Hero profile={profile} />
      <section className="section intro-section" id="experience">
        <div className="section-heading">
          <p>Production backend work</p>
          <h2>Systems that moved real numbers.</h2>
        </div>
        <ExperienceGrid items={profile.experience} />
      </section>
      <section className="section split-section" id="projects">
        <div>
          <div className="section-heading align-left">
            <p>Selected builds</p>
            <h2>Product-minded engineering with fast execution.</h2>
          </div>
          <ProjectGrid projects={profile.projects} />
        </div>
        <SkillPanel profile={profile} />
      </section>
      <section className="section achievements-section" id="achievements">
        <div className="section-heading">
          <p>Competitive edge</p>
          <h2>Proof under pressure.</h2>
        </div>
        <AchievementGrid achievements={profile.achievements} />
      </section>
      <section className="section contact-section" id="contact">
        <Contact profile={profile} />
      </section>
    </main>
  );
}

function Hero({ profile }: { profile: Profile }) {
  const linkMap = useMemo(
    () => Object.fromEntries(profile.links.map((link) => [link.label.toLowerCase(), link])),
    [profile.links],
  );

  return (
    <header className="hero">
      <img src={heroImage} alt="" className="hero-image" />
      <div className="hero-scrim" />
      <nav className="top-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label={profile.name}>
          <span>SN</span>
        </a>
        <div className="nav-links">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </div>
      </nav>

      <div className="hero-content" id="top">
        <div className="eyebrow">
          <Sparkles size={16} />
          Backend systems, product velocity, competitive precision
        </div>
        <h1>{profile.name}</h1>
        <p className="hero-title">{profile.title}</p>
        <p className="hero-summary">{profile.summary}</p>

        <div className="hero-meta" aria-label="Contact details">
          <span>
            <MapPin size={17} />
            {profile.location}
          </span>
          <a href={`mailto:${profile.email}`}>
            <Mail size={17} />
            {profile.email}
          </a>
        </div>

        <div className="hero-actions">
          <IconLink href={linkMap.linkedin?.url} label="LinkedIn" icon={<Linkedin size={19} />} />
          <IconLink href={linkMap.github?.url} label="GitHub" icon={<Github size={19} />} />
          <IconLink href={linkMap.resume?.url} label="Resume" icon={<Download size={19} />} />
        </div>
      </div>

      <div className="metric-strip">
        {profile.stats.map((stat) => (
          <div className="metric" key={stat.label}>
            <strong>{stat.label}</strong>
            <span>{stat.url}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

function ExperienceGrid({ items }: { items: Experience[] }) {
  return (
    <div className="timeline">
      {items.map((item) => (
        <article className="experience-card" key={item.company}>
          <div className="card-kicker">
            <span>{item.accent}</span>
            <span>{item.period}</span>
          </div>
          <h3>{item.company}</h3>
          <p className="role">
            {item.role} · {item.location}
          </p>
          <ul>
            {item.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <article className="project-card" key={project.name}>
          <div className="project-topline">
            <Code2 size={20} />
            <span>{project.period}</span>
          </div>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <div className="chip-row">
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <ul>
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a className="text-link" href={project.link.url} target="_blank" rel="noreferrer">
            {project.link.label}
            <ArrowUpRight size={17} />
          </a>
        </article>
      ))}
    </div>
  );
}

function SkillPanel({ profile }: { profile: Profile }) {
  return (
    <aside className="skill-panel" aria-label="Skills and education">
      <div className="panel-header">
        <BriefcaseBusiness size={22} />
        <h2>Core Stack</h2>
      </div>
      <div className="skill-cloud">
        {profile.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
      <div className="education-list">
        <h3>Education</h3>
        {profile.education.map((item) => (
          <div key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.url}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="achievement-grid">
      {achievements.map((achievement, index) => (
        <article className="achievement-card" key={achievement.name}>
          <div className="rank-mark">
            {index < 4 ? <Trophy size={18} /> : <Award size={18} />}
          </div>
          <h3>{achievement.name}</h3>
          <strong>{achievement.metric}</strong>
          <p>{achievement.detail}</p>
          <a href={achievement.link.url} target="_blank" rel="noreferrer" aria-label={`${achievement.name} ${achievement.link.label}`}>
            <ArrowUpRight size={18} />
          </a>
        </article>
      ))}
    </div>
  );
}

function Contact({ profile }: { profile: Profile }) {
  const [form, setForm] = useState<ContactState>({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    if (isStaticHost()) {
      openEmailClient(profile.email, form);
      setIsSubmitting(false);
      setStatus("Opening email instead.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Message failed");
      }
      setForm({ name: "", email: "", message: "" });
      setStatus(payload.message || "Message sent.");
    } catch (err) {
      openEmailClient(profile.email, form);
      setStatus(err instanceof Error ? `${err.message}. Opening email instead.` : "Opening email instead.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="contact-layout">
      <div className="contact-copy">
        <p>Work together</p>
        <h2>Bring me the hard backend problems.</h2>
        <span>
          I am especially interested in systems work where product speed, measurable impact, and engineering depth meet.
        </span>
        <div className="contact-links">
          <a href={`mailto:${profile.email}`}>
            <Mail size={18} />
            {profile.email}
          </a>
          <a href="https://github.com/subrat0018" target="_blank" rel="noreferrer">
            <Github size={18} />
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/subrat-chandra-naha-3a5890202/" target="_blank" rel="noreferrer">
            <Linkedin size={18} />
            LinkedIn
          </a>
        </div>
      </div>

      <form className="contact-form" onSubmit={submit}>
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Your name"
            required
          />
        </label>
        <label>
          Email
          <input
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@example.com"
            type="email"
            required
          />
        </label>
        <label>
          Message
          <textarea
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            placeholder="Tell me what you are building"
            rows={5}
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          <Send size={18} />
          {isSubmitting ? "Sending" : "Send message"}
        </button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </div>
  );
}

const fallbackProfile: Profile = {
  name: "Subrat Chandra Naha",
  title: "Backend Software Engineer",
  location: "Cuttack, Odisha",
  email: "subratchandra2003@gmail.com",
  summary:
    "I build reliable backend and Applied AI systems where latency, correctness, quality signals, and business impact all matter. Most recently I have worked on AI-adjacent evaluation workflows, referral intelligence, payments-scale profit sharing, compression, caching, and observability across high-traffic products.",
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/subrat-chandra-naha-3a5890202/" },
    { label: "GitHub", url: "https://github.com/subrat0018" },
    { label: "Email", url: "mailto:subratchandra2003@gmail.com" },
    { label: "Resume", url: "/SubratChandraNahaResume.pdf" },
  ],
  stats: [
    { label: "$400K+/week", url: "Referral profit-sharing distribution" },
    { label: "50% lower", url: "Dashboard latency through async Snowflake calculations" },
    { label: "6x lower", url: "Redis cache cost after Protobuf and Snappy" },
    { label: "2446", url: "LeetCode max rating, Guardian" },
  ],
  skills: [
    "Go",
    "C++",
    "Python",
    "JavaScript",
    "MySQL",
    "Redis",
    "Kafka",
    "DynamoDB",
    "MongoDB",
    "gRPC",
    "Protobuf",
    "Docker",
    "Distributed Systems",
    "Applied AI",
    "AI Evaluation",
    "WebSocket",
    "Zstandard",
    "Snappy",
    "Snowflake",
    "Solidity",
  ],
  languages: ["Go", "C++", "Python", "JavaScript", "HTML/CSS", "Solidity"],
  education: [
    { label: "B.Tech in Computer Science and Engineering, NIT Rourkela", url: "CGPA 9.06, 2020 - 2024" },
    { label: "Adyant Higher Secondary School, Bhubaneswar", url: "93.33%, ranked 8th in Odisha board exams" },
  ],
  experience: [
    {
      company: "Mercor",
      role: "SDE | Backend & Applied AI",
      period: "Oct 2025 - Present",
      location: "Remote",
      accent: "AI Systems",
      points: [
        "Building Applied AI workflows around expert quality signals, evaluation loops, and intelligence features used to identify stronger talent.",
        "Led a scalable quality-driven referral profit-sharing system distributing more than $400K/week and lifting new users by 10%.",
        "Removed service coupling and introduced asynchronous Snowflake dashboard calculations, lowering dashboard latency by 50% and saving $300/month.",
        "Built referral intelligence features including Reputation Score and Boost Email campaigns to move incentives toward quality-first acquisition.",
      ],
    },
    {
      company: "Zomato",
      role: "SDE | Backend",
      period: "Sept 2024 - Oct 2025",
      location: "Gurugram",
      accent: "Impact",
      points: [
        "Shipped Quick Delivery, Gold surge fee, Tip Zomato, Crazy Drops, personalized carts, dynamic pricing, and other high-impact product work.",
        "Reduced Redis cache costs 6x using Protobuf serialization and Snappy compression.",
        "Reduced Kafka payload storage costs by 20% after evaluating and integrating Zstandard compression.",
        "Removed a dependent RPC through local caching and polling, cutting latency by 30ms and reducing an external service's container count by 25%.",
      ],
    },
    {
      company: "American Express",
      role: "SDE Intern",
      period: "May 2023 - July 2023",
      location: "Bengaluru",
      accent: "Optimization",
      points: [
        "Optimized parser runtime from 7 hours to 23 minutes.",
        "Improved observability and alerting with Slack and email notifications plus stakeholder escalation.",
        "Investigated and fixed log forwarding bugs that could cause data loss during analysis.",
      ],
    },
    {
      company: "Printerverse",
      role: "Fullstack Intern",
      period: "Feb 2023 - April 2023",
      location: "Remote",
      accent: "Product",
      points: [
        "Designed and integrated file-system features including upload, delete, copy, move, and context menus.",
        "Resolved 20+ frontend bugs to improve responsiveness and stability.",
      ],
    },
  ],
  projects: [
    {
      name: "Typing Titans",
      period: "July 2023",
      stack: ["Go", "WebSocket", "MongoDB", "React", "Tailwind CSS"],
      description: "A speed-typing game with solo practice and real-time multiplayer competition.",
      highlights: [
        "Implemented live progress, typing speed visualization, and multiplayer race flows.",
        "Built the backend with Go, WebSocket transport, and MongoDB persistence.",
      ],
      link: { label: "GitHub", url: "https://github.com/subrat0018/Typing-Titans" },
    },
    {
      name: "SnapSwap",
      period: "EthIndia 2023",
      stack: ["Solidity", "Web3", "Product Engineering"],
      description: "An EthIndia-winning application that secured a $2000 prize.",
      highlights: [
        "Built during EthIndia 2023 and selected as a winner.",
        "Focused on fast product execution across blockchain workflows.",
      ],
      link: { label: "Project", url: "https://ethglobal.com/showcase/snapswap-k6dx7" },
    },
  ],
  achievements: [
    {
      name: "CodeChef",
      metric: "2123 | 5 star",
      detail: "Top 300 in India and top 750 worldwide.",
      link: { label: "Profile", url: "https://www.codechef.com/users/subrat0018/" },
    },
    {
      name: "LeetCode",
      metric: "2446 | Guardian",
      detail: "Top 0.35 percentile among 5.5L participants.",
      link: { label: "Profile", url: "https://leetcode.com/subrat0018/" },
    },
    {
      name: "Codeforces",
      metric: "1888 | Expert",
      detail: "Top 500 in India.",
      link: { label: "Profile", url: "https://codeforces.com/profile/subrat0018" },
    },
    {
      name: "AtCoder",
      metric: "1620",
      detail: "Top 1 percentile among 1.53L participants.",
      link: { label: "Profile", url: "https://atcoder.jp/users/subrat18" },
    },
    {
      name: "ICPC Kanpur Regionals 2023",
      metric: "Rank 23",
      detail: "Regional competitive programming result.",
      link: {
        label: "Certificate",
        url: "https://drive.google.com/file/d/1h98ZvD8WsEp9Al4KSccUFWPnYhfnvxl7/view?usp=sharing",
      },
    },
    {
      name: "Oppo Inspiration Cup",
      metric: "Finalist",
      detail: "Top 20 among 9k+ participants.",
      link: {
        label: "Certificate",
        url: "https://drive.google.com/file/d/1C1DqoebuyviGtSh4RMoU9yH6sDDxi27P/view?usp=share_link",
      },
    },
  ],
};

function IconLink({ href, label, icon }: { href?: string; label: string; icon: ReactNode }) {
	if (!href) {
		return null;
	}

	const external = href.startsWith("http");
	const resolvedHref = resolveHref(href);
	return (
		<a className="icon-link" href={resolvedHref} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
			{icon}
			{label}
		</a>
	);
}

function resolveHref(href: string) {
	if (!href.startsWith("/") || href.startsWith("//")) {
		return href;
	}
	return `${import.meta.env.BASE_URL}${href.slice(1)}`;
}

function isStaticHost() {
	return window.location.hostname.endsWith("github.io");
}

function openEmailClient(email: string, form: ContactState) {
	const subject = encodeURIComponent(`Portfolio inquiry from ${form.name}`);
	const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name} <${form.email}>`);
	window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

function ShellState({ label }: { label: string }) {
  return (
    <main className="shell-state">
      <div>
        <Sparkles size={28} />
        <p>{label}</p>
      </div>
    </main>
  );
}
