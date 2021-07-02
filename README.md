![](https://img.shields.io/badge/Foundry-v0.8.8-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/Mallander/playlist-enhancer/latest/module.zip)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fplaylist-enhancer&colorB=4aa94a)

# Playlist Enhancer - A Foundry VTT Module

Playlist Enhancer allows you to create playlists from the current playing sounds. Curate your sounds and atmosphere and click the "Curate" button to create a playlist containing those sounds and their properties. Also adds support for drag & dropping copies of songs between playlists to make sound management a breeze.

![](/images/demo.gif)

## Features

### Create new playlists from playing songs

Create your atmosphere by playing songs & editing sound levels.
Click the "Curate" button to create a new playlist with these sounds or add the sounds to an existing playlist.

### Drag & Drop sounds between playlists

Move or copy sounds between playlists using drag & drop (Move/Copy can be changed in moodule settings)

#### Applicable settings:

Enable or disable copy of sounds between playlists (Disabling changes the behavior to "move")

### Highlighting of playing sounds

Playlists and folders containing playing/paused sounds are highlighted in the playlist menu for improved readability.

#### Applicable settings:

Playing track colour
Paused track colour
Enable/Disable entirely

### Bulk Edit sounds within a playlist

Change the volume, repeat and fade of all tracks within a playlist. Save your defaults to quickly apply those same settings to other playlists.

#### Applicable settings:

Default Volume
Default Repeat
Default Fade

## Incompatibilities

Most likely incompatible with "Playlist Drag and Drop" as the drop functions may conflict. Remains untested.

## Known Issues

If you have any issues, please feel free to raise them here on Github.

## Changelog

### v1.1.0: Bulk editing of sounds

Manifest: https://github.com/Mallander/playlist-enhancer/releases/download/v1.1.0/module.json

- Added MVP for bulk editing of sounds via right-clicking on a playlist
- Added associated settings for "Default" bulk edit states, these can be edited via the Bulk Edit dialog window or the module settings.
- Improved debug for moving songs between playlists to detect folder actions.
- Improved paused/playing track state detection
- Improved reliability of curation
- Updated README
- Added artwork
- module.json improvements to add issue tracking, changelog and more detail

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
