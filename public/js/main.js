$(document).foundation();

var host = window.location.host
    , socket = io.connect(host);

socket.on('initial', function(data) {
    console.log(data);
});

// close image gallery when mask is clicked
$(document).on('click', '.clearing-blackout', function (evt) {
    console.log('clearing clicked');
    if ($(evt.target).is('.visible-img')) {
        $(this).find('.clearing-close').trigger('click');
    }
});

$('#switcher img').hover(function() { // hightlights proj, greys others
    $('#switcher img').attr('class', 'greyscale').addClass('hidden'); // make all grey
    $(this).removeClass('greyscale');
});
