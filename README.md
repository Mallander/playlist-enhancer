![](https://img.shields.io/badge/Foundry-v0.8.8-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/Mallander/playlist-enhancer/latest/module.zip)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fplaylist-enhancer&colorB=4aa94a)

# Playlist Enhancer - A Foundry VTT Module

Playlist Enhancer allows you to create playlists from the current playing sounds. Curate your sounds and atmosphere and click the "Curate" button to create a playlist containing those sounds and their properties. Also adds support for drag & dropping copies of songs between playlists to make sound management a breeze.

All track settings (Volume, fade etc.) are accurately saved within the new playlist when curating playlists or moving songs.

Full feature list:

- Curate new playlists from playing sounds
- Add playing sounds to existing playlists
- Drag & Drop sounds between playlists (Settings for both Copy or move)
- Highlight playing/paused playlists, folders & sounds in the playlist directory
- Bulk edit sounds within a playlist

![](/images/demo.gif)

### Incompatibilities

Most likely incompatible with "Playlist Drag and Drop" as the drop functions may conflict. Remains untested.

### Issues

If you have any issues, please feel free to raise them here on Github.

## Changelog

### v1.0.5: Settings & Playlist status coloring

Manifest: https://github.com/Mallander/playlist-enhancer/releases/download/v1.0.5/module.json

Fixed an issue where curating mutiple sounds at once may cause some to not play afterwards.
Improved functionality around adding songs to playlist. Affects and improves all areas of the module.
Fixed compatibility with Maestro module button placement.
Added module settings for:

- Enable/Disable copying of modules between playlists. Disabling will delete the original and "move" the track.
- Enable/Disable playlist status coloring and icons
- Set playlist status colors for "Playing" and "Paused" sounds

### v1.0.2: Combine with existing playlist

Manifest: https://github.com/Mallander/playlist-enhancer/releases/download/v1.0.2/module.json

Added support for combining with an existing playlist
Improved error handling for cases where multiple playlists exist with the same name already to avoid confusion
Improved existing sound data handling, now correctly assigns all properties

### v1.0.1: Main release including all major features:

Manifest: https://github.com/Mallander/playlist-enhancer/releases/download/v1.0.1/module.json

Added drag & drop support for copying songs between playlists
Improved error handling
Improved code structure and function use
First major release

0.1: Initial Release
Base strcutures and ideas in place.
