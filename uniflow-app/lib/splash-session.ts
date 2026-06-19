/**
 * Module-level splash session state survives RootLayout remounts on cold start
 * (common on Android dev builds when expo-router hydrates navigation).
 */

let animationStarted = false;
let animationFinished = false;
let mountCount = 0;
const finishListeners = new Set<() => void>();
const claimReleasedListeners = new Set<() => void>();

export function recordSplashMount(): number {
  mountCount += 1;
  if (__DEV__) {
    console.log(`[Splash] mount #${mountCount}`);
  }
  return mountCount;
}

/** Call synchronously on render — before useEffect — to win races with remounts. */
export function claimSplashAnimation(): boolean {
  if (animationFinished || animationStarted) return false;
  animationStarted = true;
  if (__DEV__) {
    console.log("[Splash] animation claimed");
  }
  return true;
}

/** Release claim when the animating instance unmounts before finishing. */
export function releaseSplashAnimationClaim(): void {
  if (animationFinished) return;
  animationStarted = false;
  if (__DEV__) {
    console.log("[Splash] animation claim released");
  }
  claimReleasedListeners.forEach((listener) => listener());
}

export function onSplashClaimReleased(listener: () => void): () => void {
  claimReleasedListeners.add(listener);
  return () => {
    claimReleasedListeners.delete(listener);
  };
}

export function isSplashAnimationFinished(): boolean {
  return animationFinished;
}

export function markSplashAnimationFinished(): void {
  if (animationFinished) return;
  animationFinished = true;
  animationStarted = false;
  if (__DEV__) {
    console.log("[Splash] animation finished");
  }
  finishListeners.forEach((listener) => listener());
  finishListeners.clear();
}

export function subscribeSplashFinished(listener: () => void): () => void {
  if (animationFinished) {
    listener();
    return () => {};
  }
  finishListeners.add(listener);
  return () => {
    finishListeners.delete(listener);
  };
}