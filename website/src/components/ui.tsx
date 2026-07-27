/**
 * Minimal UI primitives for "The Seal" site. Sections overlay the fixed
 * three.js canvas; content sections carry a soft veil for legibility.
 */
import type { ElementType, ReactNode } from "react";

interface SectionProps {
  id?: string;
  /** Render the legibility veil over the 3D canvas (use for content sections). */
  veil?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({ id, veil = false, className = "", children }: SectionProps) {
  return (
    <section id={id} className={`section${veil ? " veil" : ""}${className ? ` ${className}` : ""}`}>
      <div className="wrap">{children}</div>
    </section>
  );
}

interface HeadingProps {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
}

export function SectionHeading({ eyebrow, title, lead, center = false }: HeadingProps) {
  return (
    <div className={`section-head${center ? " center" : ""}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="section-title">{title}</h2>
      {lead && <p className="section-lead">{lead}</p>}
    </div>
  );
}

interface CardProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}

export function Card({ as: Comp = "div", className = "", children, ...rest }: CardProps) {
  return (
    <Comp className={`card${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </Comp>
  );
}
