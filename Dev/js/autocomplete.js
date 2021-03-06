function suggestedArtists() {    
    $("#artistSearch" ).autocomplete({
        source: function( request, response ) {
            $.ajax({
                url: "http://developer.echonest.com/api/v4/artist/suggest",
                dataType: "jsonp",
                data: {
                    results: 3,
                    api_key: "RKFREUONDORDOYUPI",
                    format:"jsonp",
                    name:request.term
                },
                success: function( data ) {
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
        appendTo: '.input-field',
        minLength: 3,
        select: function( event, ui ) {
            $("#log").empty();
            $("#log").append(ui.item ? ui.item.id + ' ' + ui.item.label : '(nothing)');
        },
    });
}
suggestedArtists();