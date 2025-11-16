// src/pages/details/components/actions/AppActionsDrawer/types.ts
import {
  Globe, Wrench, Shield, BookOpen, GitBranch, Server,
} from "lucide-react";

export type ImportantUrl = { id: string; label: string; url: string };
export type AdminCred =
  | { kind: "setPasswordUrl"; loginEmail: string; setPasswordUrl: string; tempPassword?: never }
  | { kind: "tempPassword";   loginEmail: string; tempPassword: string;   setPasswordUrl?: never };

export type DrawerImages = {
  imageSquareUrl?: string | null;
  imageWideUrl?: string | null;
  logoUrl?: string | null; // fallback legado, se existir
};

export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 10);
}

export function normalizeUrl(s: string) {
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}
export function formatUrlForDisplay(s: string) {
  try {
    const u = new URL(normalizeUrl(s));
    const host = u.hostname.replace(/^www\./i, "");
    const path = u.pathname.replace(/\/$/, "");
    const show = path && path !== "/" ? `${host}${path}` : host;
    return show;
  } catch {
    return s;
  }
}
export function faviconUrl(raw: string) {
  try {
    const host = new URL(normalizeUrl(raw)).hostname;
    return `https://icons.duckduckgo.com/ip3/${host}.ico`;
  } catch {
    return undefined;
  }
}

export function iconFor(label?: string) {
  const L = (label || "").toLowerCase();
  if (L.includes("técn") || L.includes("tecn")) return { Icon: Wrench, cls: "text-slate-600" };
  if (L.includes("admin")) return { Icon: Shield, cls: "text-emerald-600" };
  if (L.includes("status")) return { Icon: Server, cls: "text-cyan-600" };
  if (L.includes("doc") || L.includes("wiki")) return { Icon: BookOpen, cls: "text-violet-600" };
  if (L.includes("git") || L.includes("repo")) return { Icon: GitBranch, cls: "text-orange-600" };
  return { Icon: Globe, cls: "text-sky-600" };
}
