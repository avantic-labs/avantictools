import { socialLinks } from "@/data/socials";
import { SocialIcon } from "./SocialIcon";

const platforms = {
  Instagram: "instagram",
  X: "x",
  YouTube: "youtube",
  GitHub: "github",
  Telegram: "telegram",
  Facebook: "facebook",
  "WhatsApp Community": "whatsapp",
  "WhatsApp Channel": "whatsapp",
} as const;

export function SocialLinks({ showLabels = false }: { showLabels?: boolean }) {
  return (
    <nav
      className={`social-links${showLabels ? " social-links-labelled" : ""}`}
      aria-label="AVANTIC LABS social and community accounts"
    >
      {socialLinks.map(([name, href]) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`AVANTIC LABS on ${name} (opens in a new tab)`}
          title={`${name} (opens in a new tab)`}
        >
          <SocialIcon platform={platforms[name]} />
          {showLabels ? (
            <span>{name}</span>
          ) : name.startsWith("WhatsApp ") ? (
            <span>{name.replace("WhatsApp ", "")}</span>
          ) : null}
        </a>
      ))}
    </nav>
  );
}
