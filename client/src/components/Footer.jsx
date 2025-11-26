import { footerLinks, socialLinks } from "@/data/mockdata";
import { Facebook, Instagram, Twitter } from "lucide-react";

const iconMap = {
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#e7edf3] flex justify-center">
      <div className="flex max-w-[960px] flex-1 flex-col px-5 py-10 text-center gap-6">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:flex-row sm:justify-around">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#4c739a] text-base leading-normal min-w-40"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((social) => {
            const Icon = iconMap[social.icon];
            return (
              <a key={social.label} href={social.href} aria-label={social.label}>
                {Icon && <Icon className="text-[#4c739a] size-6" />}
              </a>
            );
          })}
        </div>

        <p className="text-[#4c739a] text-base leading-normal">
          © {new Date().getFullYear()} AURA. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
