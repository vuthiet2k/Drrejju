import { reactive, readonly } from 'vue';
import { createAudioSession } from './AudioSession.js';

export function createAudioStore(manager) {
  const state = reactive({
    activeSession: createAudioSession(),
    isMuted: false,
    masterVolume: manager?.getMasterVolume?.() ?? 1,
  });

  const sync = () => {
    const session = manager?.getActiveSession?.();
    // Keep the session object stable. Replacing it for every progress tick
    // invalidates parent component props and needlessly re-renders the Viewer.
    Object.assign(state.activeSession, session || createAudioSession());
    state.masterVolume = manager?.getMasterVolume?.() ?? state.masterVolume;
    state.isMuted = Boolean(state.activeSession.muted);
    if (import.meta.env?.DEV) console.debug('[Audio Store] sync', state.activeSession.sourceType || 'none', state.activeSession.status);
  };

  const unsubscribe = manager?.subscribe?.(() => sync()) || (() => {});
  sync();

  return {
    state: readonly(state),
    sync,
    dispose: unsubscribe,
  };
}

export default createAudioStore;
