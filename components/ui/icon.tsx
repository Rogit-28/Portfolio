"use client";

import { type ComponentProps } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaArrowDown,
  FaDownload,
  FaBars,
  FaTimes,
  FaHome,
  FaTerminal,
  FaNewspaper,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { IconType } from "react-icons";

export type IconName =
  | "arrow-right"
  | "arrow-left"
  | "arrow-down"
  | "chevron-down"
  | "email"
  | "github"
  | "linkedin"
  | "location"
  | "download"
  | "menu"
  | "terminal"
  | "close"
  | "blog"
  | "home";

interface IconProps extends ComponentProps<"svg"> {
  name: IconName;
  colored?: boolean;
}

const iconMap: Record<IconName, IconType> = {
  "arrow-left": FaChevronLeft,
  "arrow-right": FaChevronRight,
  "arrow-down": FaArrowDown,
  "chevron-down": FaChevronDown,
  email: FaEnvelope,
  github: FaGithub,
  linkedin: FaLinkedin,
  location: FaMapMarkerAlt,
  download: FaDownload,
  menu: FaBars,
  terminal: FaTerminal,
  close: FaTimes,
  blog: FaNewspaper,
  home: FaHome,
};

// Brand colors for social icons
const brandColors: Partial<Record<IconName, string>> = {
  linkedin: "#0A66C2",
  github: "", // Uses currentColor (adapts to theme)
  email: "#EA4335",
};

export function Icon({ name, className, colored = false, ...props }: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const colorStyle = colored && brandColors[name] ? { color: brandColors[name] } : undefined;

  return (
    <IconComponent
      className={className}
      style={colorStyle}
      aria-hidden="true"
      {...props}
    />
  );
}
