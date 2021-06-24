
export const registerModuleSettings = function() {

  game.settings.register('playlist-enhancer', 'enablePlaylistStates', {
    name: 'Enable playing/paused colours',
    hint: 'Choose to enable colour changes to the playlist/song titles when playing or paused. This includes the playlist folder icons too.',
    scope: 'client',     // "world" = sync to db, "client" = local storage
    config: true,       // false if you dont want it to show in module config
    type: Boolean,       // Number, Boolean, String,
    default: 1,
    onChange: value => { // value is the new value of the setting
      console.log(value)
    }
  });


  game.settings.register('playlist-enhancer', 'playlistPlayingColor', {
    name: 'Playing playlist/song highlight color',
    hint: 'Colors are only applicable when "Enable playing/paused colours" is enabled. Default: #008000',
    scope: 'client',     // "world" = sync to db, "client" = local storage
    config: true,       // false if you dont want it to show in module config
    type: String,       // Number, Boolean, String,
    default: "#008000",
    onChange: value => { // value is the new value of the setting
      document.querySelector(":root").style.setProperty("--playingColour", value)
    }
  });


  game.settings.register('playlist-enhancer', 'playlistPausedColor', {
    name: 'Paused playlist/song highlight color',
    hint: 'Colors are only applicable when "Enable playing/paused colours" is enabled. Default: #ff6400',
    scope: 'client',     // "world" = sync to db, "client" = local storage
    config: true,       // false if you dont want it to show in module config
    type: String,       // Number, Boolean, String,
    default: "#ff6400",
    onChange: value => { // value is the new value of the setting
      document.querySelector(":root").style.setProperty("--pausedColour", value)
    }
  });


  game.settings.register('playlist-enhancer', 'enableDragSongCopy', {
    name: 'Copy songs between playlists',
    hint: 'Enabling this setting will leave the original version of the moved song in the original playlist, creating a copy in the new playlist. Disable to remove the original on move.',
    scope: 'client',     // "world" = sync to db, "client" = local storage
    config: true,       // false if you dont want it to show in module config
    type: Boolean,       // Number, Boolean, String,
    default: 1
  });

}