const background_images = [
    "charsbg1.jpg",
    "charsbg2.jpg",
    "charsbg3.jpg",
    "charsbg4.jpg",
    "charsbg5.jpg",
];
let image_index = 1;
let songs = [];
let current_song_index = 0;
const audio = new Audio();
audio.volume = 0.5;
let is_dragging = false;

// Click to extend tips
$(document).ready(function() {
	// Sets first background image
    $('#bg1').css('backgroundImage', `url(/html/assets/images/backgrounds/${background_images[1]})`);

	$("#news_content").removeClass("hidden");

    // Function to update background image
    function update_background_image() {
        let current_bg = ($('#bg1').css('opacity') == '1') ? $('#bg1') : $('#bg2');
        let next_bg = ($('#bg1').css('opacity') == '1') ? $('#bg2') : $('#bg1');
        next_bg.css('backgroundImage', `url(/html/assets/images/backgrounds/${background_images[image_index]})`);
        current_bg.css('opacity', '0');
        next_bg.css('opacity', '1');
        image_index = (image_index + 1) % background_images.length;
    }
    setInterval(update_background_image, 6000);

	// Switch content on grid click
    $(".grid_div").click(function() {
		console.log('clicked')
        const contentId = $(this).data("content");
        $(".content").addClass("hidden"); // Hide all contents
        $("#" + contentId).removeClass("hidden"); // Show the clicked content
    });

	 // Function expand a news div on click
	 $(document).on("click", ".news_div", function() {
        if (!$(this).hasClass("extended")) {
            $(".news_div.extended").removeClass("extended").find(".additional_text").addClass("hidden");
            $(this).addClass("extended").find(".additional_text").removeClass("hidden");
        } else {
            $(this).removeClass("extended").find(".additional_text").addClass("hidden");
        }
    });

    // Fetch and render news posts from JSON
    $.getJSON('/html/scripts/json/news.json', function(news_posts) {
        let news_container = $(".news_content_divs");        
        news_posts.forEach(post => {
            let news_div = $('<div class="news_div"></div>');
            news_div.append('<span class="expand_hint">Click to show additional content</span>');
            news_div.append('<div class="news_div_logo" style="background-image: url(' + post.logo + ')"></div>');           
            let summary_div = $('<div class="news_summary"></div>');
            summary_div.append('<h3>' + post.title + '</h3>');
            summary_div.append('<p>' + post.content + '</p>');           
            let additionalTextDiv = $('<div class="additional_text hidden"></div>');
            additionalTextDiv.append('<p>' + post.extendedContent + '</p>');           
            summary_div.append(additionalTextDiv);
            news_div.append(summary_div);
            news_container.append(news_div);
        });
    });

	// Function to get and set staff from json
    $.getJSON('/html/scripts/json/staff.json', function(staff_members) {
        let staff_container = $(".staff_content_divs");
        staff_members.forEach(member => {
            let staff_div = $('<div class="staff_div"></div>');
            staff_div.append('<div class="staff_div_logo" style="background-image: url(' + member.logo + ')"></div>');
            let info_div = $('<div class="staff_info"></div>');
            info_div.append('<h4>' + member.name + '</h4>');
            info_div.append('<p>' + member.role + '</p>');
            let bio_div = $('<div class="staff_bio"></div>');
            bio_div.append('<p>' + member.bio + '</p>');           
            info_div.append(bio_div);
            staff_div.append(info_div);
            staff_container.append(staff_div);
        });
    });
    
	// Function to get keybindings from json
    $.getJSON('/html/scripts/json/keybindings.json', function(bindings) {
        let table_body = $(".keybindings_table tbody");
        table_body.empty();
        bindings.forEach(binding => {
            let table_row = $('<tr></tr>');
            table_row.append('<td>' + binding.key + '</td>');
            table_row.append('<td>' + binding.action + '</td>');
            table_body.append(table_row);
        });
    });

	// Plays another song when one ends
    audio.onended = function() {
        current_song_index = (current_song_index + 1) % songs.length;
        play_song(current_song_index);
    };
    
    // Function to play songs
    function play_song(index) {
        audio.src = songs[index].file;
        audio.play();
        $('#progress_bar').css('width', '0%');
        $('#song_time').text(`0:00 / 0:00`);
        if (songs[index].artwork && songs[index].artwork !== "") {
            $('#song_artwork').css('background-image', 'url(' + songs[index].artwork + ')');
        } else {
            $('#song_artwork').css('background-image', '');
        }
        $('#current_song_title').text(songs[index].title);
        $('#current_song_artist').text(songs[index].artist);
        $('#current_song_album').text(songs[index].album);
    }
    $('#toggle_play_pause').click(() => {
        if (audio.paused) {
            audio.play();
            $('#toggle_play_pause i').removeClass('fa-play').addClass('fa-pause');
        } else {
            audio.pause();
            $('#toggle_play_pause i').removeClass('fa-pause').addClass('fa-play');
        }
    });

    // When the metadata is loaded, set the duration of the song
    audio.onloadedmetadata = function() {
        $('#progress_bar').attr('max', audio.duration);
    };

    // Update the progress bar in real-time
    audio.ontimeupdate = function() {
        const played_amount = (audio.currentTime / audio.duration) * 100;
        $('#progress_bar').css('width', played_amount + '%');
        const current_mins = Math.floor(audio.currentTime / 60);
        const current_secs = Math.floor(audio.currentTime % 60);
        const total_mins = Math.floor(audio.duration / 60);
        const total_secs = Math.floor(audio.duration % 60);
        $('#song_time').text(`${current_mins}:${current_secs < 10 ? '0' + current_secs : current_secs} / ${total_mins}:${total_secs < 10 ? '0' + total_secs : total_secs}`);
    };

    // Next song button on click
    $('#next_song').click(() => {
        current_song_index = (current_song_index + 1) % songs.length;
        play_song(current_song_index);
        $('#toggle_play_pause i').removeClass('fa-play').addClass('fa-pause');  // Set to pause icon
    });
    
    // Previous song button on click
    $('#prev_song').click(() => {
        current_song_index = (current_song_index - 1 + songs.length) % songs.length;
        play_song(current_song_index);
        $('#toggle_play_pause i').removeClass('fa-play').addClass('fa-pause');  // Set to pause icon
    });

    // Fetch the songs from the JSON file
    $.getJSON('/html/scripts/json/tracklist.json', function(data) {
        songs = data;
        current_song_index = Math.floor(Math.random() * songs.length);
        play_song(current_song_index);
    });

    // Volume slider stuff
    $(".slider_thumb").mousedown(function() {
        is_dragging = true;
    });

    $(document).mouseup(function() {
        is_dragging = false;
    });

    $(".slider_track").mousemove(function(event) {
        if (is_dragging) {
            let trackHeight = $(this).height();
            let trackTop = $(this).offset().top;
            let yPos = event.pageY - trackTop;
            yPos = Math.max(0, Math.min(yPos, trackHeight));
            let adjustedPos = trackHeight - yPos - $(".slider_thumb").height() / 2;
            $(".slider_thumb").css("bottom", adjustedPos);
            let volume = 1 - (yPos / trackHeight);
            audio.volume = volume;
        }
    });
   
	// Function to set active players
    function set_active_players() {
        const players = GetActivePlayers();
        const player_count = players.length;
        $('.header_players_online').text('PLAYERS: ' + player_count)
    }
    set_active_players()
});


function on_load() {
	window.addEventListener('mousemove', function(e) {
		cursor.style.left = e.clientX + "px"; 
    	cursor.style.top = e.clientY + "px";
	});
}
