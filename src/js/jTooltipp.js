/**********************************************************************
 * Copyright (c) 2010 Holger Szuesz, <hszuesz@gmail.com>
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

            $t.on({
                'mouseenter.jTooltipp': function(e) {
                    m=setMode(e, settings.direction);

                    $tc.css({
                        "position": "absolute",
                        "top": calcY(e) + 'px',
                        "left": calcX(e) + 'px'
                    });

                    $tc.show(0);

                    $('body').on('mousemove.jTooltipp', function(e) {
                        $tc.css({
                            "top": calcY(e) + 'px',
                            "left": calcX(e) + 'px'
                        });
                    });
                },
                'mouseleave.jTooltipp': function() {
                    $tc.hide(0);
                    $('body').off('mousemove.jTooltipp');
                }
            });

            var setMode = function(e, d){
                if(d&&d!='bottom') {
                    if(d=='top'&&((e.clientY - ($tc.outerHeight(true) + 20)) > 0)) {
                        return 'top';
                    }
                    if(d=='right'&&(e.clientX + $tc.outerWidth(true) + 20) < w) {
                        return 'right';
                    }
                    if(d=='left') {
                        return 'left';
                    }
                }

                if((e.clientY + $tc.outerHeight(true) + 20) < h) {
                    return 'bottom';
                }

                if(((e.clientY + $tc.outerHeight(true) + 20) >= h) && ((e.clientY - ($tc.outerHeight(true) + 20)) > 0)) {
                    return 'top';
                }

                if((e.clientX + $tc.outerWidth(true) + 20) < w) {
                    return 'right';
                }

                return 'left';
            };

            var calcX = function(e){
                var x = (e.pageX - ($tc.outerWidth(true) / 2));

                if(m == 'right') {
                    x = (e.pageX + 20);
                }

                if(m == 'left') {
                    x = (e.pageX - ($tc.outerWidth(true) + 20));
                }

                if(x - 5 < 0) {
                    x = 5;
                } else if(x + $tc.outerWidth(true) + 5 > w) {
                    x = w - 5 - $tc.outerWidth(true);
                }

                return x;
            };

            var calcY = function(e){
                var y = e.pageY + 20;

                if(m == 'right' || m == 'left') {
                    y = e.pageY - ($tc.outerHeight(true) / 2);
                }

                if(m == 'top') {
                    y = e.pageY - ($tc.outerHeight(true) + 20);
                }

                if(y - 5 < 0) {
                    y = 5;
                } else if(y + $tc.outerHeight(true) + 5 > h) {
                    y = h - 5 - $tc.outerHeight(true);
                }

                return y;
            };
        });
    };

    $.fn.jTooltipp.defaults = {
        direction: null
    };

})(jQuery);