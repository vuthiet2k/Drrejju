export function createAudioService(manager, store) {
  const command = (name, callback) => (...args) => {
    if (import.meta.env?.DEV) console.debug('[Audio Controller]', name);
    return callback(...args);
  };

  return {
    state: store.state,
    playTour: command('Tour Play', (source, options = {}) => manager.playNarration(source, 'tour', options)),
    toggleTour: command('Tour Toggle', () => manager.toggleSession('tour')),
    pauseTour: command('Tour Pause', () => manager.pause('tour')),
    resumeTour: command('Tour Resume', () => manager.resume('tour')),
    playPoi: command('POI Play', (source, options = {}) => manager.playNarration(source, 'poi', options)),
    toggle: command('Toggle Active', () => manager.toggleActive()),
    pause: command('Pause Active', () => manager.pauseActive()),
    resume: command('Resume Active', () => manager.resumeActive()),
    seek: command('Seek Active', (time) => manager.seekActive(time)),
    setVolume: command('Set Volume', (volume) => manager.setActiveVolume(volume)),
    mute: command('Mute Active', () => manager.muteActive()),
    unmute: command('Unmute Active', () => manager.unmuteActive()),
    setPlaybackRate: command('Set Playback Rate', (rate) => manager.setActivePlaybackRate(rate)),
    setMasterVolume: command('Set Master Volume', (volume) => manager.setMasterVolume(volume)),
    stop: command('Stop', () => manager.stop()),
  };
}

export default createAudioService;
