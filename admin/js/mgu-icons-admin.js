(function($){
    $(document).on('click', '.mgu-icon-select', function(e){
        e.preventDefault();
        var $btn = $(this);
        var $wrapper = $btn.closest('.mgu-icon-field');
        var $input = $wrapper.find('.mgu-icon-url');
        var $preview = $wrapper.find('.mgu-icon-preview');

        var frame = wp.media({
            title: 'Select Icon',
            button: { text: 'Use this icon' },
            multiple: false
        });

        frame.on('select', function(){
            var attachment = frame.state().get('selection').first().toJSON();
            if (attachment && attachment.url) {
                $input.val(attachment.url);
                $preview.css('background-image', 'url(' + attachment.url + ')');
            }
        });

        frame.open();
    });

    $(document).on('click', '.mgu-icon-remove', function(e){
        e.preventDefault();
        var $wrapper = $(this).closest('.mgu-icon-field');
        $wrapper.find('.mgu-icon-url').val('');
        $wrapper.find('.mgu-icon-preview').css('background-image', 'none');
    });
})(jQuery);


