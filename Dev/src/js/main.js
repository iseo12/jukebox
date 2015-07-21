  var BASE_URL = 'https://api.spotify.com/v1/';
  var SEARCH_LIMIT = 5;
  var RELATED_LIMIT = 6;
  var selectedID = '';
  var selectedArtistData = '';
  var albumPopularity = ''; 
  var $ajaxlog = $('#ajaxlog');  
  var $bioPlaceholder = $('#selectedArtistBio');
  var $artistImage = $("#artistImage");
  var $artistName = $("#artistName");
  // var $selectedArtistTemplate = $('#selectedartisttemplate');
  var $topTracks = $('#topTracks');
  var $albums = $('#albums');
  var $relatedArtists = $('#relatedArtists');
  // var $relatedArtistTemplate = $('#relatedartisttemplate');
  var $spotifyResults = $('#spotifyresults');  
  var searchResultData = {};

  $(document).ajaxComplete(function(event, request, settings) {
    $ajaxlog.append('<li>Request Complete.</li>');
  });
  $(document).ajaxError(function(event, request, settings, thrownError) {
    $ajaxlog.append('<li>Error requesting page <b>' + settings.url + '</b></li>');
    $ajaxlog.append('<li>Error Thrown: <b>' + thrownError + '</b></li>');
  });
  $(document).ajaxSend(function(event, request, settings) {
    $ajaxlog.append('<li>Starting request at ' + settings.url + '</li>');
  });
  $(document).ajaxStart(function() {
    $ajaxlog.append('<li>ajax call started</li>');
  });
  $(document).ajaxStop(function() {
    $ajaxlog.append('<li>ajax call stopped</li>');
  });
  $(document).ajaxSuccess(function(event, request, settings) {
    $ajaxlog.append('<li>Successful Request!</li>');
  });  
  
  $('.modal-trigger').leanModal();
  
  $('#artistSearch').keypress(function(e) {
    if (e.which == 13) {
      e.preventDefault();
      console.log($('#artistSearch').val());
      var query = $('#artistSearch').val();
      if (query.length > 2) {
        // $searchResults.html('');
        $('#artist').removeClass('hidden');
        var targetContent = $(this).data('navigation-item');
        var topPosition = $('.content-' + targetContent).offset().top;
        $('body').animate ({
          scrollTop: topPosition
        });
        $('.fixed-action-btn').removeClass('hidden');
        $('#top10tracks').removeClass('hidden');
        $('#withoutborder').removeClass('hidden');      
        searchArtists(query);
      }
    }
  }); 

  $('body').on('click', '.artist', function(e) {
    e.preventDefault();
    var relatedName= $(this).attr('data-artist-name');
    selectedID = $(this).attr('href');
    searchArtists(relatedName);
    getTopTracksByID(selectedID);
    getAlbums(selectedID);
    getRelatedByID(selectedID);
    var targetContent = $(this).data('navigation-item');
    var topPosition = $('.content-' + targetContent).offset().top;
    $('body').animate ({
      scrollTop: topPosition
    });
    $('#artistSearch').val(relatedName);
  });

  $('body').on('click', '.btn-large i', function(e) {
    var targetContent = $(this).data('navigation-item');
    var topPosition = $('.content-' + targetContent).offset().top;
    $('body').animate ({
      scrollTop: topPosition
    });
  });

  $('body').on('click', '.searchAgain', function(e) {
    var targetContent = $(this).data('navigation-item');
    var topPosition = $('.content-' + targetContent).offset().top;
    $('body').animate ({
      scrollTop: topPosition
    });
  });

  $('body').on('click', '#topTracksMore', function(e) {
    e.preventDefault();
    $('.viewMoreTracks').css('display', 'none');
    $('#top10tracks').css('overflow-y', 'scroll');
    $('.viewLessTracks').css('display', 'block');
  });

  $('body').on('click', '#albumsMore', function(e) {
    e.preventDefault();
    $albums.css('overflow-y', 'scroll');
    $('.viewMoreAlbums').css('display', 'none');
    $('.viewLessAlbums').css('display', 'block');
  });

  $('body').on('click', '#albumsLess', function(e) {
    e.preventDefault();
    $('.viewLessAlbums').css('display', 'none');
    $albums.animate ({scrollTop: 0},'fast');
    $albums.css('overflow-y', 'hidden');
    $('.viewMoreAlbums').css('display', 'block');
  });

  $('body').on('click', '#topTracksLess', function(e) {
    e.preventDefault();
    $('.viewLess').css('display', 'none');
    $('#top10tracks').animate ({scrollTop: 0},'fast');
    $('#top10tracks').css('overflow-y', 'hidden');
    $('.viewMoreTracks').css('display', 'block');
  });

  $('body').on('scroll', '#top10tracks', function(e) {
    e.preventDefault();
    console.log($('.content-3').offset().top);
  });

  // $('body').on('click', '.artist', function(e) {
  //   e.preventDefault();
  //   selectedIndex = $(this).attr('data-selected-index');
  //   selectedID = $(this).attr('href');
  //   displayArtistData(selectedIndex);
  // });
  
  // $('body').on('click', '#searchagainbutton', function(e) {
  //   $('#searchcard').removeClass('hidden').addClass('animated bounceInDown');
  // });
  
  // $('body').on('click', '#spotifylogin', function(e) {
  //   e.preventDefault();
  //   console.log($(this).attr('id') + ' clicked');    
  //   console.log(e);
  //   window.location = BUILT_URL;
  // }); 

  // $('#related').on('click', function(e) {
  //   var query = $(this).val();
  //   $searchResults.html('');      
  //   searchArtists(query);
  // });

  function getTopTracksByID(artistID) {
    console.log(artistID);
    return $.get(BASE_URL + 'artists/' + artistID + '/top-tracks?country=US')
    .pipe(renderTopTracks);
  } 

  function getAlbums(artistID) {
    console.log('albums url: ' + BASE_URL + 'artists/' + artistID + '/albums')
    return $.get(BASE_URL + 'artists/' + artistID + '/albums')
    .pipe(renderAlbums);
  }
  
  function getRelatedByID(artistID) {
    return $.get(BASE_URL + 'artists/' + artistID + '/related-artists')
    .pipe(trimResults)
    .pipe(renderRelated);
  }

  function getArtistImage(artistID) {
    return $.get(BASE_URL + 'artists/' + artistID)
    .pipe(renderArtistImage);
  }

  function trimResults(response) {
    if (response.artists.length > RELATED_LIMIT) {
      response.artists = response.artists.slice(0, RELATED_LIMIT);
    }
    return response;
  }
  
  function searchArtists(query) {
    var oData = {
      q: query,
      type: 'artist',
      limit: SEARCH_LIMIT,
      offset: 0,
      market: 'US',
      album_type: 'album'
    };
    var url = BASE_URL+'search';
    return $.get(url, oData)
      .pipe(renderSearchResults);
  }

  function renderSearchResults(response) {
    searchResultData = response;
    // console.log(response.artists.items);
    var artists = response.artists.items;
    if (artists.length > 0) {
      displayArtistData(0);
    }
  }

  function renderTopTracks(topTracks) {
    console.log('topTracks: ', topTracks);
    var topTracksResult = '';
    for (var i = 0; i < 10; i++) {
      // console.log('topTracksFor: ', topTracks);
      var trackName = topTracks.tracks[i].name;
      var trackTime = topTracks.tracks[i].duration_ms;
      var seconds = Math.round(trackTime/1000);
      var minutes = Math.floor(seconds/60);
      var time = minutes%60 + ":" + seconds%60;
      if (time.length == 3) {
        time += '0';
      }
      console.log("track time: " + trackTime);
      var albumCover = topTracks.tracks[i].album.images[2].url;
      var href = topTracks.tracks[i].href;
      var number = i+1;
      var externalURL = topTracks.tracks[i].external_urls.spotify;
      console.log("minutes: " + minutes%60);
      console.log("seconds: " + seconds);
      // console.log('trackName: ' + trackName);
      topTracksResult += '<tr><td>'+number+'</td><td><img src="'+albumCover+'"></td><td>'+trackName+'</td><td>'+time+'</td><td><a class="playBtn btn-floating btn-small waves-effect waves-light lime lighten-1" href="'+externalURL+'" target="_blank"><i class="material-icons">play_arrow</i></a></td></tr>' 
      // console.log('topTracksResult: ' + topTracksResult);
    }
    $topTracks.html(topTracksResult);
  }

  function renderAlbums(albums) {
    var albumsResult = '';
    var response = albums.items;
    albumsResult += '<div class="no-text section-header"><div class="title"><i class="material-icons">'+"album"+'</i><h3>'+"Albums"+'</h3></div></div>';
    for (var i = 0; i < response.length; i++) {
      for (var j = 0; j < response[i].available_markets.length; j++) {
        var albumName = response[i].name;
        var albumCover = response[i].images[1].url;
        var albumID = response[i].id;
        var externalURL = response[i].external_urls.spotify;
        console.log('albums: ' + response);
        if (response[i].available_markets[j] === 'US') {
          albumsResult += '<figure class="effect-apollo"><a href="'+externalURL+'" target="_blank"><img src="'+albumCover+'"><figcaption><h2>'+albumName+'</h2></figcaption></a></figure>';
        }
      }
    }
    albumsResult += '<div class="viewLessAlbums"><a href="#" id="albumsLess">'+"View Less"+'</a></div>';
    albumsResult += '<div class="viewMoreAlbums"><a href="#" id="albumsMore">'+"View More"+'</a></div>';
    $albums.html(albumsResult);
  }

  function renderRelated(relatedArtists) {
    console.log('relatedArtists: ', relatedArtists);
    console.log('passed to template2: ', relatedArtists.artists);
    var rArtistsResult = '';
    for (var i = 0; i < 5; i++) {
      // var artistPicture = rArtists;
      var artistName = relatedArtists.artists[i].name;
      var artistID = relatedArtists.artists[i].id;
      var artistImage = relatedArtists.artists[i].images[1].url;
      var artistPopularity = relatedArtists.artists[i].popularity;
      if (i == 2) {
        rArtistsResult += '<div class="no-text section-header"><div class="title"><i class="material-icons">'+"headset"+'</i><h3>'+"Related Artists"+ '</h3></div></div>';
      }
      rArtistsResult += '<figure class="effect-apollo"><a class="artist" data-selected-index="'+i+'" data-navigation-item="1" data-artist-name="'+artistName+'" href="'+artistID+'"><img src="'+artistImage+'"><figcaption><h2>'+artistName+'</h2></figcaption></a></figure>';
      console.log("artistResult: " + rArtistsResult);
    }
    $relatedArtists.html(rArtistsResult);
  }

  function renderArtistImage(artist) {
    console.log("artist image: " + artist);
    $artistImage.attr('src', artist.images[2].url);
    $artistName.html(artist.name);
  }

  function displayArtistData(index) {
    selectedArtistData = searchResultData.artists.items[index];
    selectedID = searchResultData.artists.items[index].id;
    console.log('passed to template1: ', selectedArtistData);
    getArtistImage(selectedID);
    getTopTracksByID(selectedID);
    getAlbums(selectedID);
    getRelatedByID(selectedID);
    // $searchResults.html('');
  }

  function justDisplayResponse(response) {
    console.log('response: ', response);
  }