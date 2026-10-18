import { socialLinks } from "@/data/socials";

export function SocialLinks() {
  return (
    <nav
      className="social-links"
      aria-label="AVANTIC LABS social and community accounts"
    >
      {socialLinks.map(([name, href]) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`AVANTIC LABS on ${name} (opens in a new tab)`}
        >
          {name}
        </a>
      ))}
    </nav>
  );
}
