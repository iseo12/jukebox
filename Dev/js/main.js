  
  var BASE_URL = 'https://api.spotify.com/v1/';
  var SEARCH_LIMIT = 5;
  var RELATED_LIMIT = 6;
  var suggestArtists = BASE_URL + '/artists' + artistID; 
  var $ajaxlog = $('#ajaxlog');  
  var $searchResults = $('#searchresults');
  var $selectedArtistTemplate = $('#selectedartisttemplate');
  var $relatedArtistTemplate = $('#relatedartisttemplate');
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
  
  $('#btnsearchartists').on('click', function(e) {
    var query = $('#txtArtistSearch').val();
    if (query.length > 2) {
      $searchResults.html('');      
      searchArtists(query);
    }
  });

  $('body').on('click', '.artist', function(e) {
    e.preventDefault();
    // while ('#txtArtistSearch'.val().length > 2) {
    //   (document).getElementById('#searchresults').style.display = "block";
    // }
    selectedIndex = $(this).attr('data-selected-index');
    selectedID = $(this).attr('href');
    selectedArtistData = searchResultData.artists.items[selectedIndex];
    console.log('passed to template1: ', selectedArtistData);
    var $renderedTemplate = $selectedArtistTemplate.tmpl(selectedArtistData);
    console.log('renderedTemplate: ', $renderedTemplate);
    $spotifyResults.html($renderedTemplate);
    getRelatedByID(selectedID);
    //$searchResults.html('');
    //$('#card-toggler').slideToggle(3000);
    $('#searchcard').addClass('hidden');
    $('#hiddenrow').removeClass('hidden').addClass('animated bounceInDown');
  });
  
  
  $('body').on('click', '#searchagainbutton', function(e) {
    $('#searchcard').removeClass('hidden').addClass('animated bounceInDown');
    $('#hiddenrow').removeClass('animated bounceInDown').addClass('hidden'); 
  });
  
  
searchArtists('Dave Matthews');
  
  function getRelatedByID(artistID) {
    return $.get(BASE_URL+'artists/'+artistID+'/related-artists')
      .pipe(trimResults)
      .pipe(renderRelatedTemplate);
  }


  function getSuggestedArtist() {
    $("#txtArtistSearch" ).autocomplete({
        source: function( request, response ) {
            $.ajax({
              url: "http://developer.echonest.com/api/v4/artist/suggest",
              dataType: "json",
              data: {
                  results: 4,
                  api_key: "RKFREUONDORDOYUPI",
                  format:"json",
                  name:request.term
              },
              success: function(data) {
                response( $.map( data.response.artists, function(item) {
                  return {
                    label: item.name,
                    value: item.name,
                    id: item.id
                  }
                }));
              }
            });
        },
        minLength: 3,
        select: function( event, ui ) {
          $("#log").empty();
          $("#log").append(ui.item ? ui.item.id + ' ' + ui.item.label : '(nothing)');
        },
    });
  });

  function trimResults(response) {
    if (response.artists.length > RELATED_LIMIT) {
      response.artists = response.artists.slice(0, RELATED_LIMIT);
    }
    return response;
  }

  function renderRelatedTemplate(relatedArtists) {
    console.log('relatedArtists: ', relatedArtists);
    console.log('passed to template2: ', relatedArtists.artists);
    var $renderedTemplate = $relatedArtistTemplate.tmpl(relatedArtists.artists);
    console.log('renderedTemplate: ', $renderedTemplate);
    $('#relatedartists').html($renderedTemplate);
  } 
  
  function searchArtists(query) { 
    var oData = {
      q: query,
      type: 'artist',
      limit: SEARCH_LIMIT,
      offset: 0,
      market: 'US'
    };
  }
  var url = BASE_URL+'search';
  return $.get(url, oData)
    .pipe(renderSearchResults);
  }

  function renderSearchResults(response) {
    searchResultData = response;
    var artists = response.artists.items;
    var topTracks = response.tracks.items;
    var result = '';
    for (var i = 0; i < artists.length; i++) {
      var artistName = artists[i].name;
      var artistID = artists[i].id;
      result += '<li><a class="artist" data-selected-index="'+i+'" data-artist-name="'+artistName+'" href="'+artistID+'">'+artistName+'</a></li>';
    }
    for (var j = 0; j < )
    $searchResults.html(result);  
  }

  function justDisplayResponse(response) {
    console.log('response: ', response);
  }