(function($) {
	$.fn.facebookReactions = function(pk) {

		var emoji_value;
		var _react_html = '<div style="position:absolute; z-index: 1;" class="_bar" data-status="hidden"><div class="_inner">';
		var faces 	= '<img src="/static/emojis/like.svg" class="emoji emoji' + pk +'" data-emoji-value="like" style="" />';
		faces = faces + '<img src="/static/emojis/love.svg" class="emoji emoji' + pk +'" data-emoji-value="love" style="" />';
		faces = faces + '<img src="/static/emojis/haha.svg" class="emoji emoji' + pk +'" data-emoji-value="haha" style="" />';
		faces = faces + '<img src="/static/emojis/wow.svg" class="emoji emoji' + pk +'" data-emoji-value="wow" style="" />';
		faces = faces + '<img src="/static/emojis/sad.svg" class="emoji emoji' + pk +'" data-emoji-value="sad" style="" />';
		faces = faces + '<img src="/static/emojis/angry.svg" class="emoji emoji' + pk +'" data-emoji-value="angry" style="" />';
		_react_html = _react_html + faces;
		_react_html = _react_html + '<br clear="all" /></div></div>';

		$(_react_html).appendTo($('body'));

		var _bar = $('._bar');
		var _inner = $('._inner');

		// on click emotions
		$('.emoji' + pk).on("click",function (e) {
			// console.log(e);
			if(e.target !== e.currentTarget) return;
			// console.log('cameeeeeeeeeeeeeeeeeeee');
			var base = $(this).parent().parent().parent();
			var move_emoji = $(this);

			var scope = angular.element(this).scope();
			// console.log(scope);
			scope.$parent.emojiClicked(base.context.dataset.emojiValue , scope.p.pk);
			e.stopPropagation();
			return true;
		});


		return this.each(function() {

			var _this = $(this);
			window.tmr;
			window.selector = _this.get(0).className;

			$(this).find('span').click(function(e) {

				if(e.target !== e.currentTarget) return;
				var isLiked = $(this).parent().attr("data-emoji-class");
				var control_id = $(this).parent().attr("data-unique-id");
				var scope = angular.element(this).scope();
				scope.$parent.emojiClicked('like' , scope.p.pk);

				// $(this).html(settings.defaultText);

			});

			$(this).hover(function (){

				if ( $(this).hasClass("emoji") ){
					return false;
				}

				if($(this).hasClass("open") === true)
				{
					clearTimeout(window.tmr);
					return false;
				}

				$('.'+window.selector).each(function() {

					__hide(this);
				});

				if( _bar.attr('data-status') != 'active' ) {

					__show(this);
				}
			},function ()
				{
					var _this = this;
					window.tmr = setTimeout( function(){
					   __hide(_this);
					}, 100);
				}
			);

			// functions
			function __hide(_this) {
				_bar.attr('data-status', 'hidden');
				_bar.hide();
				$('.open').removeClass("open");
				_inner.removeClass('ov_visi');
			}

			function __show(_this) {
				clearTimeout(window.tmr);
				$(_this).append(_bar.fadeIn());
				_bar.attr('data-status', 'active');
				_inner.addClass('ov_visi');
				$(_this).addClass("open");
				// vertical or horizontal
				_inner.css('width', '270px');
				_inner.css('padding', '3px');
				// Set main bar position top: -50px; left:0px;
				_bar.css({'top': '-50px', 'left': '0px', 'right': 'auto' });
			}
		});
	};

})(jQuery);
