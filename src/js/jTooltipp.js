/**********************************************************************
 * Copyright (c) 2009 Holger Szuesz, <hszuesz@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *********************************************************************/

/**
 * JQuery Tooltipp extension
 *
 */
(function($)
{
    $.fn.jTooltipp = function(settings, undefined)
    {
        settings = $.extend({}, $.fn.jTooltipp.defaults, settings);

        return this.each(function(){
            var $t=$(this);
            var $tc=$('#' + $t.attr('rel'));
            var m='';
            var h=0;
            var w=0;

            if((window.navigator.appVersion).search(/MSIE/) > 0) {
                if(!(document.documentElement.clientWidth == 0)) {
                    h = document.documentElement.clientHeight;
                    w = document.documentElement.clientWidth;
                } else {
                    h = document.body.clientHeight;
                    w = document.body.clientWidth;
                }
            } else {
                h = window.innerHeight;
                w = window.innerWidth;
            }

            $t.bind('jTooltipp.mouseenter', function(e) {

                m=setMode(e, settings.direction);

                var x	= calcX(e);
                var y	= calcY(e);

                $tc.css({
                    "position": "absolute",
                    "top": y + 'px',
                    "left": x + 'px'
                });

                $tc.show(0);

                $('body').bind('jTooltipp.mousemove', function(e) {
                    var x = calcX(e);
                    var y = calcY(e);

                    $tc.css({
                        "top": y,
                        "left": x
                    });
                });
            }).bind('jTooltipp.mouseleave', function() {
                $tc.hide(0);
                $('body').unbind('jTooltipp.mousemove');
            });

            var setMode = function(e, d){
                if(d&&d!='under') {
                    if(d=='over'&&((e.clientY - ($tc.height() + 20)) > 0)) {
                        return 'over';
                    }
                    if(d=='right'&&(e.clientX + $tc.width() + 20) < w) {
                        return 'right';
                    }
                    if(d=='left') {
                        return 'left';
                    }
                }

                if((e.clientY + $tc.height() + 20) < h) {
                    return 'under';
                }

                if(((e.clientY + $tc.height() + 20) >= h) && ((e.clientY - ($tc.height() + 20)) > 0)) {
                    return 'over';
                }

                if((e.clientX + $tc.width() + 20) < w) {
                    return 'right';
                }

                return 'left';
            };

            var calcX = function(e){
                if(m == 'right') {
                    return (e.pageX + 20);
                }

                if(m == 'left') {
                    return (e.pageX - ($tc.width() + 20));
                }

                if((e.pageX + ($tc.width() / 2)) > w) {
                    return (e.pageX - (($tc.width() / 2) + ((e.pageX + ($tc.width() / 2)) - w + 30)));
                } else if((e.pageX - ($tc.width() / 2)) < 0) {
                    return (e.pageX - (($tc.width() / 2) + (e.pageX - ($tc.width() / 2) - 5)));
                }

                return (e.pageX - ($tc.width() / 2));
            };

            var calcY = function(e){
                if(m == 'right' || m == 'left') {
                    if((e.clientY - ($tc.height() / 2)) < 0) {
                        return (e.pageY - (($tc.height() / 2) + (e.clientY - ($tc.height() / 2) + 5)));
                    } else if((e.clientY + ($tc.height() / 2)) > h) {
                        return (e.pageY - (($tc.height() / 2) + ((e.clientY + ($tc.height() / 2)) - h + 30)));
                    }

                    return (e.pageY - ($tc.height() / 2));
                }

                if(m == 'over') {
                    return (e.pageY - ($tc.height() + 20));
                }

                return (e.pageY + 20);
            };
        });
    };

    $.fn.jTooltipp.defaults = {
        direction: null
    };

})(jQuery);