$(document).ready(function(){
    var page_view = false

    $('#cover a').click(function(e) {
        e.stopPropagation();
    });
    $('#cover').click(function(e) {
        $(this).toggleClass('cover_back2');
    });

    // anchor flash
    $('#arrow_icon_bottom')
        .delay(1000)
        .fadeOut(350)
        .fadeIn(700)
        .fadeOut(350)
        .fadeIn(700);
    // anchor smooth scroll
    $('a[href^="#jump_anchor"]').on('click',function (e) {
	    e.preventDefault();

	    var target = this.hash;
	    var $target = $(target);

	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 700, 'swing');
	});

    var efficient = debounce(function() {
        // clear color classes so they can change
        $('#custom_nav').attr('class', 'fixed');
        $('#cover').removeClass('sc_cover');

        var pos = $(this).scrollTop()
            , win_h = $(window).height()
            , fav = $('#whimsy').offset().top
            , code = $('#code').offset().top
            , photo = $('#photo').offset().top
            , ea = $('#ea').offset().top
            , doc_h = $(document).height()
            , h = $('#custom_nav').outerHeight();

        // nav color matching
        if( pos <= code - h ) {
            $('#custom_nav').addClass('nav_purple');
            // collapsing navbar
            $('#cover').addClass('n_space').removeClass('s_space');
        } else {
            // arrow icon hide when past
            $('#arrow_icon_bottom').hide();

            // smaller once it hits code anchor
            $('#cover').addClass('s_space').removeClass('n_space');

            $('#cover').addClass('sc_cover');
            $('#custom_nav').addClass('sc_nav');

            if( pos <= photo - h ) {
                $('#custom_nav').addClass('nav_grey');
            } else if( pos <= ea - h ) {
                $('#custom_nav').addClass('nav_blue');

                if ( page_view == false ) {
                    socket.emit( 'scroll_hit_bottom', 'page view' );
                    page_view = true; // once per load
                }
            } else if( pos <= fav - h ) {
                $('#custom_nav').addClass('nav_grey');
            } else {
                $('#custom_nav').addClass('nav_green');
            }
        }

        // reveal images as they move into view
        $('.hidden').each( function(i){
            var bot_obj = $(this).offset().top + $(this).outerHeight()
                , bot_win = $(window).scrollTop() + win_h;

            /* If the object is completely in the window, fade it */
            if( bot_win > bot_obj ){
                $(this).animate({'opacity':'1'}, 300);
            }
        });
    }, 50);

    window.addEventListener('scroll', efficient);
});

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
