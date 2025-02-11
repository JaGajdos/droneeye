function loadScript(url: string, callback: () => void) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = callback;
  document.head.appendChild(script);
}

function setWeight(action: any, weight: any) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

export function loadFont() {}

export function isSubpageOpen() {
  const subpages = document.querySelectorAll('.subpage-container');
  return Array.from(subpages).some((subpage) => (subpage as HTMLElement).style.transform === 'translateY(0px)');
}
