export const registerModuleSettings = function () {
  // Playlist States Settings
  game.settings.register("playlist-enhancer", "enablePlaylistStates", {
    name: "Enable playing/paused colours",
    hint: "Choose to enable colour changes to the playlist/song titles when playing or paused. This includes the playlist folder icons too.",
    scope: "client",
    config: true,
    type: Boolean,
    default: 1,
  });

  game.settings.register("playlist-enhancer", "playlistPlayingColor", {
    name: "Playing playlist/song highlight color",
    hint: 'Colors are only applicable when "Enable playing/paused colours" is enabled. Default: #ffaa00',
    scope: "client",
    config: true,
    type: String,
    default: "#ffaa00",
    onChange: (value) => {
      // value is the new value of the setting
      document
        .querySelector(":root")
        .style.setProperty("--playingColour", value);
    },
  });

  game.settings.register("playlist-enhancer", "playlistPausedColor", {
    name: "Paused playlist/song highlight color",
    hint: 'Colors are only applicable when "Enable playing/paused colours" is enabled. Default: #999999',
    scope: "client",
    config: true,
    type: String,
    default: "#999999",
    onChange: (value) => {
      // value is the new value of the setting
      document
        .querySelector(":root")
        .style.setProperty("--pausedColour", value);
    },
  });

  // Bulkd Edit Tracks settings
  game.settings.register("playlist-enhancer", "defaultSongVolume", {
    name: "'Bulk Edit' default: Song volume",
    hint: 'This is your default setting for volume when using the "Bulk Edit Songs" feature.',
    scope: "client",
    config: true,
    type: Number,
    default: 0.5,
    range: {
      min: 0,
      max: 1,
      step: 0.05,
    },
  });

  game.settings.register("playlist-enhancer", "defaultSongRepeat", {
    name: "'Bulk Edit' default: Song repeat",
    hint: 'This is your default setting for repeat when using the "Bulk Edit Songs" feature',
    scope: "client",
    config: true,
    type: Boolean,
    default: 1,
  });

  game.settings.register("playlist-enhancer", "defaultSongFade", {
    name: "'Bulk Edit' default: Song fade",
    hint: 'This is your default setting for fade when using the "Bulk Edit Songs" feature',
    scope: "client",
    config: true,
    type: Number,
    default: 1000,
  });
};
