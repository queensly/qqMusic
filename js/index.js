/**
 * Created by Administrator on 2017/1/11.
 */
//对rem的设置处理
(function () {
    var winW = $(window).width(),
        desW = 640,
        htmlFont = null;
    htmlFont = winW / desW * 100
    window.htmlFont = htmlFont
    document.documentElement.style.fontSize = htmlFont + 'px'
})();
//给中间main设置高度
(function () {
    var $header = $('.header')
    var $footer = $('.footer')
    var $main = $('.main')
    var $winH = $(window).height()
    $main.css('height', $winH - $header.height() - $footer.height() - .8 * htmlFont)
})();
var musicUtils = (function () {
    var $callbacks = $.Callbacks();
    var $lyric = $('.lyric');
    var audio = $('audio')[0];
    var $current = $('.current');
    var $duration = $('.duration');
    var $btn = $('.btn');
    var $play = $('.play');
    var $pause = $('.pause');
    var $timeProgress = $('.timeProgress')
    var timer = null;

    function formatDate(s) {
        var m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        m >= 0 && m < 10 ? m = '0' + m : null;
        s >= 0 && s < 10 ? s = '0' + s : null;
        return m + ':' + s
    }

    $callbacks.add(function (data) {
        var str = '';
        for (var i = 0; i < data.length; i++) {
            str += '<p data-minute="' + data[i].minute + '" data-second="' + data[i].second + '" >' + data[i].content + '</p>';
        }
        $lyric.html(str)
    });
    $callbacks.add(function () {
        audio.addEventListener('canplay', function () {
            this.play()
            $pause.show()
            $play.hide()
            $duration.html(formatDate(this.duration))
            $btn.on('tap', function () {
                if (audio.paused) {
                    audio.play()
                    $pause.show()
                    $play.hide()
                } else {
                    audio.pause()
                    $pause.hide()
                    $play.show()
                }
            });
        });
    });
    $callbacks.add(function(){
        timer = setInterval(function () {
            var currentTime = formatDate(audio.currentTime)
            var minute = currentTime.split(':')[0]
            var second = currentTime.split(':')[1]
            $current.html(currentTime)
            $timeProgress.css('width',audio.currentTime/audio.duration*100+'%')
            var $tar = $lyric.find('p').filter('[data-minute="'+minute+'"]').filter('[data-second="'+second+'"]')
            $tar.addClass('on').siblings('p').removeClass('on')
            var n = $tar.index()
            if(audio.ended){
                clearInterval(timer)
                console.log('wanle')
                $pause.hide()
                $play.show()
                return
            }
            if(n>=3){
                $lyric.animate({top:(n-2)* -.84+'rem'},1000)
            }
        },1000)
    });
    return {
        init: function () {
            $.ajax({
                url: 'lyric.json',
                type: 'GET',
                dataType: 'json',
                cache: false,
                success: function (result) {
                    result = result.lyric || '';
                    result = result.replace(/&#(\d{2});/g, function ($0, $1) {
                        var val = $0;
                        switch (Number($1)) {
                            case 32:
                                val = ' ';
                                break;
                            case 40:
                                val = '(';
                                break;
                            case 41:
                                val = ')';
                                break;
                            case 45:
                                val = '-';
                        }
                        return val
                    });
                    var aryData = [];//最终拿到的数据
                    var reg = /\[(\d+)&#58;(\d+)&#46;(?:\d+)\]([^&#]+)(?:&#\d+;)/g;
                    result.replace(reg, function () {
                        aryData.push({
                            minute: arguments[1],
                            second: arguments[2],
                            content: arguments[3]
                        })
                    });
                    $callbacks.fire(aryData)
                }
            })
        }
    }
})();
musicUtils.init();