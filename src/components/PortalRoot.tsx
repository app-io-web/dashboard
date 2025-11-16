// src/components/PortalRoot.tsx
let portalRoot: HTMLElement | null = null;

export function getPortalRoot() {
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'modal-portal';
    document.body.appendChild(portalRoot);
  }
  return portalRoot;
}