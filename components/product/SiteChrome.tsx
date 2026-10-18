import Link from "next/link";
import { SearchDialog } from "./SearchDialog";
import { SocialLinks } from "./SocialLinks";
import { MobileMenu } from "./MobileMenu";
export function Brand() {
  return (
    <Link
      href="/"
      prefetch={false}
      className="brand"
      aria-label="AVANTIC Tools home"
    >
      {/* A proportional crop of the Founder-supplied artwork. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/avantic-tools-mark.png" width={40} height={40} alt="" />
      <span>
        AVANTIC <span className="brand-product">Tools</span>
      </span>
    </Link>
  );
}
export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav aria-label="Primary" className="desktop-nav">
            <Link href="/#tools" prefetch={false}>
              Browse tools
            </Link>
            <Link href="/categories/files" prefetch={false}>
              Files
            </Link>
            <Link href="/categories/business" prefetch={false}>
              Business
            </Link>
          </nav>
          <SearchDialog />
          <MobileMenu />
        </div>
      </header>
    </>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>AVANTIC Tools — a product of AVANTIC LABS.</p>
        <nav aria-label="Footer">
          <Link href="/about" prefetch={false}>
            About
          </Link>
          <Link href="/privacy" prefetch={false}>
            Privacy
          </Link>
          <Link href="/terms" prefetch={false}>
            Terms
          </Link>
        </nav>
        <SocialLinks />
      </div>
    </footer>
  );
}
