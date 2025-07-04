export class BackgroundAudio {
  private audio: any;
  private isInitialized: boolean = false;
  private soundIcon: HTMLImageElement;
  private isPlaying: boolean = false;

  private isIOS(): boolean {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  constructor() {
    this.audio = document.getElementById('bgMusic');
    this.audio.volume = 0.3;
    this.audio.preload = 'auto';

    if (this.isIOS()) {
      this.audio.playsInline = true;
      this.audio.muted = true;
    }

    this.soundIcon = document.getElementById('soundIcon') as HTMLImageElement;
    this.setupToggleButton();
  }

  private initIOSAudio() {
    const startIOSAudio = () => {
      if (this.isInitialized) return;

      this.audio.muted = false;
      this.audio
        .play()
        .then(() => {
          this.isInitialized = true;
        })
        .catch((error: any) => {
          console.log('iOS audio start failed:', error);
          this.isInitialized = false;
        });
    };

    // iOS potrebuje touchend event
    document.addEventListener(
      'touchend',
      () => {
        if (!this.isInitialized) {
          startIOSAudio();
        }
      },
      false,
    );
  }

  private initStandardAudio() {
    const startAudio = () => {
      if (this.isInitialized) return;

      this.audio
        .play()
        .then(() => {
          this.isInitialized = true;
        })
        .catch((error: any) => {
          console.log('Standard audio start failed:', error);
          this.isInitialized = false;
        });
    };

    // Štandardné eventy pre ostatné zariadenia
    ['click', 'touchstart'].forEach((event) => {
      document.addEventListener(event, startAudio, { once: true });
    });
  }

  stop() {
    if (this.isInitialized) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  private setupToggleButton() {
    const toggleButton = document.getElementById('toggleAudio');
    if (toggleButton) {
      toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    this.updateIcon();
  }

  play() {
    if (!this.isInitialized) {
      if (this.isIOS()) {
        this.initIOSAudio();
      } else {
        this.initStandardAudio();
      }
    }

    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
        this.updateIcon();
      })
      .catch((error: any) => console.log('Audio play failed:', error));
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updateIcon();
  }

  private updateIcon() {
    if (this.soundIcon) {
      const iconName = this.isPlaying ? 'sound-on.svg' : 'sound-off.svg';
      this.soundIcon.src = `images/${iconName}`;
    }
  }

  setVolume(volume: number) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  private logAudioState() {
    console.log({
      isIOS: this.isIOS(),
      isInitialized: this.isInitialized,
      isMuted: this.audio.muted,
      volume: this.audio.volume,
      isPlaying: !this.audio.paused,
      currentTime: this.audio.currentTime,
      readyState: this.audio.readyState,
    });
  }
}
