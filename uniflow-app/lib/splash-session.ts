/**
 * Module-level splash session state survives RootLayout remounts on cold start
 * (common on Android dev builds when expo-router hydrates navigation).
 */

let animationStarted = false;
let animationFinished = false;
let mountCount = 0;

export function recordSplashMount(): number {
  mountCount += 1;
  if (__DEV__) {
    console.log(`[Splash] mount #${mountCount}`);
  }
  return mountCount;
}

/** Call synchronously on render — before useEffect — to win races with remounts. */
export function claimSplashAnimation(): boolean {
  if (animationStarted) return false;
  animationStarted = true;
  if (__DEV__) {
    console.log("[Splash] animation claimed");
  }
  return true;
}

export function isSplashAnimationFinished(): boolean {
  return animationFinished;
}

export function markSplashAnimationFinished(): void {
  animationFinished = true;
  if (__DEV__) {
    console.log("[Splash] animation finished");
  }
}