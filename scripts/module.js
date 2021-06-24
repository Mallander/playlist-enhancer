
import { registerModuleSettings } from "./settings.js";

var curateDialog;

Hooks.on("init", () => {

	var leftOffset = $(document).width() - 320 - 310;

	//Set default values for: dialog content and dialog box placement
	let curateDialogContent = '<div class="form-group"><label>Name</label><div class="form-fields"><input type="text" name="name" id="curated-name" placeholder="New Playlist" required=""></div></div>';

	// Set dialog options for placement
	const dialogOptions = {
		width: 320,
		top: 140,
		left: leftOffset
	};

	// Create Dialog and save for later
	curateDialog = new Dialog({
		title: 'Curate Playlist',
		content: curateDialogContent,
		buttons: {
			button1: {
				label: "Create Playlist",
				callback: (html) => {beginCombinePlaylist(html)},
				icon: `<i class="fas fa-check"></i>`
			},
		}
	}, dialogOptions)

	registerModuleSettings();


})

// Add "Curate" button when a sound is playing and set the click event for dialog pop-up.
// Initiate Drop & Drop functionality for song movement between playlists
Hooks.on('renderPlaylistDirectory', (app, html) => {
  	let qcButton = '<button class="quick-combine" title="Quick Combine"><i class="fas fa-compress-arrows-alt"></i>Curate</button>';
	
	html.find('#currently-playing .playlist-header').append(qcButton);
	html.find('.quick-combine').on('click', (e) => {
		curateDialog.render(true);
	})

	if(game.settings.get("playlist-enhancer", "enablePlaylistStates")) {
		// Detect paused sounds and add classes
		let pausedSounds = $("#playlists .directory-list .sound-control[title='Resume Sound']")
		pausedSounds.closest(".sound.flexrow").addClass("paused-sound");
		pausedSounds.closest(".playlist").addClass("paused-playlist");
		pausedSounds.closest(".subdirectory").siblings(".folder-header").addClass("paused-folder");

		// Add playing sounds CSS classes
		$("#playlists .directory-list .playlist.playing").closest(".subdirectory").siblings(".folder-header").addClass("playing-folder");
		$("#playlists .directory-list .playlist.playing").addClass("playing-playlist");
		$("#playlists .directory-list .sound.playing").addClass("playing-sound");

		// Add playing icon to playing folder
		$('<a style="padding-right: 5px;"><i class="fas fa-volume-up fa-fw"></i></a>').insertAfter(".playing-folder h3 i:first-child")

		// Add paused icon to paused folder
		$('<a style="padding-right: 5px;"><i class="fas fa-pause fa-fw"></i></a>').insertAfter(".paused-folder:not(.playing-folder) h3 i:first-child")
	}

	//Set the drag targets
	const sounds = html.find(".directory-list .sound-name");

	// Get the sound IDs and set draggable, set ondragend callback
	sounds.each((index, el) => {
		try {
			const soundId = el.closest("li.sound").getAttribute('data-sound-id');

			if (!soundId) {
				return;
			}

			el.draggable = true;
			el.ondragend = (e) => moveSoundToPlaylist(soundId, e);
		} catch (e) {
			console.error(`Error: ${e}: Unable to make song ${el} draggable`);
		}
	})

  
});

// Copy sound from one playlist to another
function moveSoundToPlaylist(soundId, event) {

	// Playlist ID that the drag was started from
	let startingPlaylistId = getPlaylistIdFromElement(event.srcElement.closest(".playlist"));
	// The sound object being dragged
	let soundObject = getSoundObjectFromId(soundId);
	// The target playlist ID from the drop co-ordinates
	let targetPlaylistId = getPlaylistIdFromElement(document.elementFromPoint(event.clientX, event.clientY))

	// If drop target is not a playlist, throw error
	if(!targetPlaylistId) {
		ui.notifications.error("Error: Target must be a playlist");
		return;
	} else if (startingPlaylistId == targetPlaylistId) { // Check if the drop target is the same as the starting playlist
		return;
	}

	let playlist = game.playlists.entities.find(p => p.id === targetPlaylistId)
	playlist.createEmbeddedDocuments('PlaylistSound', [soundObject.data]);

	if(!game.settings.get("playlist-enhancer", "enableDragSongCopy")) {
		soundObject.delete();
	}

}

// Credit to https://github.com/gsimon2 for creating this function for use in playlist-drag-and-drop: https://github.com/gsimon2/playlist-drag-and-drop
function getSoundObjectFromId(soundId) {
	try {
		const playlistSounds = Array.from(game.playlists.values()).flatMap((playlist) => Array.from(playlist.sounds.values()));
		return playlistSounds.find(playlistSound => playlistSound.id === soundId);
	} catch (e) {
		console.error(`Error: Failed to get sound object from soundId: ${soundId}. Error: ${e}`);
		return '';
	}
}

// Return the playlist ID from the DOM element if applicable, otherwise return false
function getPlaylistIdFromElement(el) {
	if((el.closest(".playlist") == undefined || el.closest(".playlist") == null) && !el.classList.contains("playlist")) {
		return false;
	}
	return el.classList.contains("playlist") ? el.getAttribute("data-entity-id") : el.closest(".playlist").getAttribute("data-entity-id");
}


// Function for the playlist combination
async function beginCombinePlaylist(formHtml) {

	// Set Variables:
	// Playlist name: string, form input
	// Playing sounds: array, list of currently playing sounds
	// Playlist: playlist, checks if the name's in use
	let playlistName = formHtml.find("#curated-name").val();
	let playingSounds = game.playlists.directory._playingSounds
	let playlist = game.playlists.entities.filter(p => p.name === playlistName)

	if(playlist.length > 1) {
		ui.notifications.error(`Multiple tracks with the name '${playlistName}' already exist. Please use a unique name, or combine with a single existing playlist.`)
		return;
	}

	playlist = game.playlists.entities.find(p => p.name === playlistName)

	// Check if sounds are playing
	if(playingSounds.length == 0) {
		ui.notifications.warn("No tracks are currently playing, start building your atomsphere first.");
		return;
	}

	checkOverwriteExistingPlaylist(playlistName, playingSounds, playlist);

}

async function checkOverwriteExistingPlaylist(playlistName, playingSounds, playlist) {

	// Check if playlist name is in use already
	if(playlist != undefined || playlist != null) {

		// Create confirmation dialog to see if user wants to combine
		Dialog.confirm({
			title: 'Combine with existing',
			content: `Playlist '${playlistName}' already exists. Do you want to add these tracks into the existing playlist?\n`,
			yes: () => { createCombinePlaylist(playlistName, playingSounds, playlist, true); },
			no: () => {
				ui.notifications.error("Playlist already exists with the name '" + playlistName + "'.");
				return;
			},
			defaultYes: true
		})

	} else {
		createCombinePlaylist(playlistName, playingSounds, playlist, false);
	}
	
}

async function createCombinePlaylist(playlistName, playingSounds, playlist, overwrite) {

	// Begin Curation
	ui.notifications.info("Curating playlist...")

	const songsToAdd = playingSounds.map((sound) => sound.toObject());

	for(var key in songsToAdd) {
		if (!songsToAdd.hasOwnProperty(key)) continue;

    	var obj = songsToAdd[key];
		for (var prop in obj) {
		    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
		        if (!obj.hasOwnProperty(prop)) continue;

		        if(prop == "playing") { obj[prop] = false }
		        if(prop == "fade") { obj[prop] = obj[prop] == undefined ? 1000 : obj[prop] }
		    }
		}
	}

	if(!overwrite) {
		// Create empty playlsit
		await Playlist.create({
		    "name": playlistName,
		    "permission": {
		        "default": 0,
		    },
		    "flags": {},
		    "sounds": songsToAdd,
		    "mode": 2,
		    "playing": false,
		});
	} else {
		playlist.createEmbeddedDocuments('PlaylistSound', songsToAdd);
	}

	if(overwrite) {
		// Complete curation (overwritten)
		ui.notifications.info("Playlist '" + playlistName + "' updated successfully!")
	} else {
		// Complete curation
		ui.notifications.info("Playlist '" + playlistName + "' created successfully!")
	}
}