import { registerModuleSettings } from "./settings.js";
var curateDialog, bulkEditDialog;
var leftOffset = $(document).width() - 320 - 310;
var draggedSound;

Hooks.on("init", () => {
	//Enable Debug
	// CONFIG.debug.hooks = true;

	$("body").on("click", ".playlist-enhancer-save", function (e) {
		setBulkEditDefaults($("#bulkEdit"));
	});

	$("body").on("click", ".playlist-enhancer-curate", function (e) {
		curateDialog.render(true);
	});

	//Set default values for: dialog content and dialog box placement
	let curateDialogContent =
		'<div class="form-group"><label>Name</label><div class="form-fields"><input type="text" name="name" id="curated-name" placeholder="New Playlist" required=""></div></div>';

	// Set dialog options for placement
	const dialogOptions = {
		width: 320,
		top: 300,
		left: leftOffset,
	};

	// Create Dialog and save for later
	curateDialog = new Dialog(
		{
			title: "Curate Playlist",
			content: curateDialogContent,
			buttons: {
				button1: {
					label: "Create Playlist",
					callback: (html) => {
						beginCombinePlaylist(html);
					},
					icon: `<i class="fas fa-check"></i>`,
				},
			},
		},
		dialogOptions
	);

	registerModuleSettings();
});

// Add "Curate" button when a sound is playing and set the click event for dialog pop-up.
// Initiate Drop & Drop functionality for song movement between playlists
Hooks.on("renderPlaylistDirectory", (app, html) => {
	let qcButton =
		'<button class="playlist-enhancer-curate" title="Combine to playlist"><i class="fas fa-compress-arrows-alt"></i>Curate</button>';

	html.find("#currently-playing .playlist-header").append(qcButton);

	// Render play states UI
	if (game.settings.get("playlist-enhancer", "enablePlaylistStates")) {
		// Detect paused sounds and add classes
		let pausedSounds = $(
			"#playlists .directory-list .sound-control[title='Resume Sound']"
		);
		pausedSounds.closest(".sound.flexrow").addClass("paused-sound");
		pausedSounds.closest(".playlist").addClass("paused-playlist");
		pausedSounds
			.closest(".subdirectory")
			.siblings(".folder-header")
			.addClass("paused-folder");

		// Add playing sounds CSS classes
		$("#playlists .directory-list .playlist.playing")
			.closest(".subdirectory")
			.siblings(".folder-header")
			.addClass("playing-folder");
		$("#playlists .directory-list .playlist.playing").addClass(
			"playing-playlist"
		);
		$("#playlists .directory-list .sound.playing").addClass("playing-sound");

		// Add playing icon to playing folder
		$('<i class="fas fa-volume-up fa-fw"></i>').insertAfter(
			".playing-folder h3 i:first-child"
		);

		// Add paused icon to paused folder
		$('<i class="fas fa-pause fa-fw"></i>').insertAfter(
			".paused-folder:not(.playing-folder) h3 i:first-child"
		);
	}

	//Set the drag targets
	const sounds = html.find(".directory-list .sound-name");
	const playlists = html.find(".directory-list .playlist");

	// Get the sound IDs and set draggable, set ondragend callback
	sounds.each((index, el) => {
		try {
			const soundId = el.closest("li.sound").getAttribute("data-sound-id");

			if (!soundId) {
				return;
			}

			el.draggable = true;
			el.ondragstart = (e) => {
				draggedSound = e.target;
			};
		} catch (e) {
			console.error(`Error: ${e}: Unable to make song ${el} draggable`);
		}
	});

	// Get the sound IDs and set draggable, set ondragend callback
	playlists.each((index, el) => {
		try {
			// el.draggable = true;
			el.ondrop = (e) => moveSoundToPlaylist(draggedSound, e);
		} catch (e) {
			console.error(`Error: ${e}: Unable to make playlist ${el} droppable`);
		}
	});
});

Hooks.on("getPlaylistDirectoryEntryContext", (app, html) => {
	html.push({
		name: "Bulk Edit Sounds",
		icon: '<i class="fas fa-edit"></i>',
		condition: () => game.user.isGM,
		callback: (li) => {
			renderBulkdEditUI(li);
		},
	});
});

// Copy sound from one playlist to another
function moveSoundToPlaylist(soundElement, event) {
	// Check if it's a sound that's being dropped
	if (
		soundElement == undefined ||
		!soundElement.classList.contains("sound-name")
	) {
		return;
	}

	let startingPlaylist = soundElement.closest(".playlist");
	let targetPlaylist = event.target.classList.contains("playlist")
		? event.target
		: event.target.closest(".playlist");

	// Check if start & end playlists are the same
	if (targetPlaylist == startingPlaylist) {
		ui.notifications.warn(
			"PLaylist Enhancer: Cannot move a sound into the same playlist as it started."
		);
		return;
	}

	// The sound object being dragged
	let soundObject = getSoundObjectFromId(
		soundElement.closest("li.sound").getAttribute("data-sound-id")
	);
	// The target playlist ID
	let targetPlaylistId = targetPlaylist.getAttribute("data-entity-id");

	// Get playlist object from ID
	let playlist = game.playlists.contents.find((p) => p.id === targetPlaylistId);
	playlist.createEmbeddedDocuments("PlaylistSound", [soundObject.data]);

	// Check if settings enabled to move sounds rather than copy
	if (!game.settings.get("playlist-enhancer", "enableDragSongCopy")) {
		soundObject.delete();
	}
}

// Credit to https://github.com/gsimon2 for creating this function for use in playlist-drag-and-drop: https://github.com/gsimon2/playlist-drag-and-drop
function getSoundObjectFromId(soundId) {
	try {
		const playlistSounds = Array.from(game.playlists.values()).flatMap(
			(playlist) => Array.from(playlist.sounds.values())
		);
		return playlistSounds.find((playlistSound) => playlistSound.id === soundId);
	} catch (e) {
		console.error(
			`Playlist Enhancer Error: Failed to get sound object from soundId: ${soundId}. Error: ${e}`
		);
		return "";
	}
}

// Function for the playlist combination
async function beginCombinePlaylist(formHtml) {
	// Set Variables:
	// Playlist name: string, form input
	// Playing sounds: array, list of currently playing sounds
	// Playlist: playlist, checks if the name's in use
	let playlistName = formHtml.find("#curated-name").val();
	if (playlistName.length == 0) {
		ui.notifications.error("Please enter a playlist name");
		return;
	}
	let playingSounds = game.playlists.directory._playingSounds;

	// Check if sounds are playing
	if (playingSounds.length == 0) {
		ui.notifications.warn(
			"Playlist Enhancer: No tracks are currently playing, start building your atomsphere first."
		);
		return;
	}

	let playlist = game.playlists.contents.filter((p) => p.name === playlistName);

	if (playlist.length > 1) {
		ui.notifications.error(
			`Playlist Enhancer: Multiple tracks with the name '${playlistName}' already exist. Please use a unique name, or combine with a single existing playlist.`
		);
		return;
	}

	playlist = game.playlists.contents.find((p) => p.name === playlistName);

	checkOverwriteExistingPlaylist(playlistName, playingSounds, playlist);
}

async function checkOverwriteExistingPlaylist(
	playlistName,
	playingSounds,
	playlist
) {
	// Check if playlist name is in use already
	if (playlist != undefined || playlist != null) {
		// Create confirmation dialog to see if user wants to combine
		Dialog.confirm({
			title: "Combine with existing",
			content: `Playlist '${playlistName}' already exists. Do you want to add these tracks into the existing playlist?\n`,
			yes: () => {
				curatePlaylist(playlistName, playingSounds, playlist, true);
			},
			no: () => {
				ui.notifications.error(
					"Playlist Enhancer: Playlist already exists with the name '" +
						playlistName +
						"'."
				);
				return;
			},
			defaultYes: true,
		});
	} else {
		curatePlaylist(playlistName, playingSounds, playlist, false);
	}
}

async function curatePlaylist(
	playlistName,
	playingSounds,
	playlist,
	overwrite
) {
	// Begin Curation
	ui.notifications.info("Curating playlist...");

	const songsToAdd = playingSounds.map((sound) => sound.toObject());

	for (var key in songsToAdd) {
		if (!songsToAdd.hasOwnProperty(key)) continue;

		var obj = songsToAdd[key];
		for (var prop in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, prop)) {
				if (!obj.hasOwnProperty(prop)) continue;

				if (prop == "playing") {
					obj[prop] = false;
				}
				if (prop == "fade") {
					obj[prop] = obj[prop] == undefined ? 1000 : obj[prop];
				}
			}
		}
	}

	if (!overwrite) {
		// Create empty playlsit
		await Playlist.create({
			name: playlistName,
			permission: {
				default: 0,
			},
			flags: {},
			sounds: songsToAdd,
			mode: 2,
			playing: false,
		});

		// Complete curation
		ui.notifications.info(
			"Playlist Enhancer: Playlist '" + playlistName + "' created successfully!"
		);
	} else {
		playlist.createEmbeddedDocuments("PlaylistSound", songsToAdd);
		// Complete curation (overwritten)
		ui.notifications.info(
			"Playlist Enhancer: Playlist '" + playlistName + "' updated successfully!"
		);
	}
}

async function renderBulkdEditUI(elArray) {
	let playlistID = elArray[0].getAttribute("data-entity-id");
	let playlist = game.playlists.contents.find((p) => p.id === playlistID);
	const defaults = {
		volume: game.settings.get("playlist-enhancer", "defaultSongVolume"),
		repeat: game.settings.get("playlist-enhancer", "defaultSongRepeat"),
		fade: game.settings.get("playlist-enhancer", "defaultSongFade"),
	};

	//Set HTML for bulk edit form
	let bulkEditDialogContent = `<form id="bulkEdit">These settings will be applied to all sounds in your playlist.<hr> <div class="form-group"> <label>Sound Volume</label> <input class="sound-volume" type="range" name="beVolume" value="${defaults.volume}" title="Sound Volume" value="" min="0" max="1" step="0.05" tabindex="-1"> </div> <div class="form-group"> <label>Repeat</label> <input type="checkbox" name="beRepeat" checked="${defaults.repeat}" value="true"> </div> <div class="form-group" style="padding-bottom: 5px;"> <label>Fade Duration (ms)</label> <input name="beFade" type="number"  value="${defaults.fade}" step="1" min="0"> </div><input type="button" name="beSaveDefaults" class="playlist-enhancer-save" value="Save Defaults"> </form>`;

	// Set dialog options for placement
	const dialogOptions = {
		width: 320,
		top: 200,
		left: leftOffset,
	};

	// Create Dialog and render
	bulkEditDialog = new Dialog(
		{
			title: "Bulk Edit Sounds",
			content: bulkEditDialogContent,
			buttons: {
				apply: {
					label: "Apply to all",
					callback: (html) => {
						bulkEditTracks(html, playlist);
					},
					icon: '<i class="fas fa-check"></i>',
				},
			},
			default: "apply",
		},
		dialogOptions
	);

	bulkEditDialog.render(true);
}

async function bulkEditTracks(formHtml, playlist) {
	let playlistSounds = playlist.getEmbeddedCollection("PlaylistSound");
	let newVolume = AudioHelper.inputToVolume(
		parseFloat(formHtml.find("input[name=beVolume]").val())
	);
	let newRepeat = formHtml.find("input[name=beRepeat]:checked").length > 0;
	let newFade = parseInt(formHtml.find("input[name=beFade]").val());
	let updatedSounds = [];

	for (let [key, value] of playlistSounds.entries()) {
		updatedSounds.push({
			_id: value.id,
			volume: newVolume,
			repeat: newRepeat,
			fade: newFade,
		});
	}

	playlist.updateEmbeddedDocuments("PlaylistSound", updatedSounds); // do the update
	ui.notifications.info(
		"Playlist Enhancer: All sounds in playlist '" +
			playlist.data.name +
			"' updated successfully!"
	);
}

async function setBulkEditDefaults(formHtml) {
	let newVolume = parseFloat(formHtml.find("input[name=beVolume]").val());
	let newRepeat = formHtml.find("input[name=beRepeat]:checked").length > 0;
	let newFade = parseInt(formHtml.find("input[name=beFade]").val());

	game.settings.set("playlist-enhancer", "defaultSongVolume", newVolume);
	game.settings.set("playlist-enhancer", "defaultSongRepeat", newRepeat);
	game.settings.set("playlist-enhancer", "defaultSongFade", newFade);

	ui.notifications.info(
		"Playlist Enhancer: Bulk Edit Sounds default values updated"
	);
}
