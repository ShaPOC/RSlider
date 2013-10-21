/* *
 * Ricardoismy.name
 * 
 * @author Ricardo Snoek
 * @copyright Copyright (c) 2011-2012, Ricardoismy.name (http://www.ricardoismy.name)
 *
 * Jquery, JqueryUI is required for this error handler to work!
 * The Jquery, JqueryUI library needs to be included before this file!
 * 
 */

(function($, window, document, undefined) {

    var mobile = navigator.userAgent.match(/Android|webOS|IEMobile|iPhone|iPad|iPod|BlackBerry|Windows Phone|ZuneWP7/i);

    var slides = new Array();
    var titles = new Array();
    var autocenter = new Array();

    var interval = new Number();
    var current = new Number();

    var slideanimation = new Object();
    var titleanimation = new Object();

    var jdocument = $(document);
    var jwindow = $(window);

    var slider = {
        init: function(element, options) {
            var self = this;
            self.options = $.extend({}, $.fn.rslider.defaultOptions, options);

            if ((self.options.slider.animation) && (self.options.title.animation))
                slider.animations(self.options);
            if (self.options.timing !== 0)
                slider.timer(self.options);

            for (var i = 0; i < self.options.slides.length; i++) {
                if ((self.options.slides[i].type === "video") && ((!mobile) || (screen.width > 800))) {
                    slides.push(slider.video(element, self.options.slides[i], self.options));
                    if (self.options.slides[i].title)
                        titles.push(slider.title(element, self.options.slides[i], self.options));
                } else if (self.options.slides[i].type === "image") {
                    slides.push(slider.image(element, self.options.slides[i], self.options));
                    if (self.options.slides[i].title)
                        titles.push(slider.title(element, self.options.slides[i], self.options));
                }
            }

            if (slides.length !== 0)
                slider.create(element, self.options);
            if (autocenter.length !== 0)
                slider.center(self.options);
            jwindow.on("resize", function() {
                slider.center(self.options, true);
            });
        },
        create: function(element, options) {
            for (var i = 0; i < slides.length; i++) {
                slides[i].prependTo(element);

                if (typeof titles[i] === "object")
                    titles[i].appendTo(slides[i]);
            }
        },
        center: function(options, resize) {
            for (var i = 0; i < autocenter.length; i++) {
                var element = $(autocenter[i]);

                if ((element.is("video")) && (!resize))
                    element.on("play", position);
                else
                    element.load(position);

                function position() {
                    if (element.innerWidth() > jwindow.innerWidth())
                        element.css({marginLeft: Math.floor(((jwindow.innerWidth() - element.outerWidth())) / 2)});

                    if (element.innerHeight() > jwindow.innerHeight())
                        element.css({marginTop: Math.floor(((jwindow.innerHeight() - element.innerHeight()) / 2))});
                }
            }
        },
        animations: function(options) {
            switch (options.slider.animation) {
                case "slide-up":
                    slideanimation = animations.slider.slideup;
                    break;
                case "slide-down":
                    slideanimation = animations.slider.slidedown;
                    break;
                case "slide-left":
                    slideanimation = animations.slider.slideleft;
                    break;
                case "slide-right":
                    slideanimation = animations.slider.slideright;
                    break;
                case "fade":
                    slideanimation = animations.slider.fade;
                    break;
            }

            switch (options.title.animation) {
                case "slide-up":
                    titleanimation = animations.title.slideup;
                    break;
                case "slide-down":
                    titleanimation = animations.title.slidedown;
                    break;
                case "slide-left":
                    titleanimation = animations.title.slideleft;
                    break;
                case "fade":
                    titleanimation = animations.title.fade;
                    break;
            }
        },
        play: function(options) {
            slideanimation.current(slides[current], options, function(options) {
                if(titles.length > 1)
                    titleanimation.current(titles[current], options);
                
                slider.callback(options);
                slideanimation.next(slides[current], options, function(options) {
                    if(titles.length > 1)
                        titleanimation.next(titles[current], options);
                });
            });
        },
        callback: function(options) {
            if (((current + 1) <= (slides.length - 1)) && (options.repeat))
                current = current + 1;
            else if ((current >= (slides.length - 1)) && (options.repeat))
                current = new Number();
            else if (!options.repeat)
                interval = window.clearInterval(interval);

            if (slides[current].children("video").is("video"))
                slides[current].children("video")[0].play();
            if (slides[current].children("video").data("videotimer"))
                slider.videotimer(slides[current].children("video"), options);
        },
        timer: function(options) {
            interval = window.setInterval(function() {
                slider.play(options);
            }, options.timing);
        },
        title: function(element, slide, options) {
            var title = $(slide.title);

            if (titles.length >= 1)
                titleanimation.current(title, options);

            return title;
        },
        image: function(element, slide, options) {
            var image = $(document.createElement("img"));
            image.addClass(options.classes.image);
            image.attr("src", slide.url);

            var imageholder = $(document.createElement("div"));
            imageholder.addClass(options.classes.content);
            imageholder.append(image);

            if (slide.center)
                autocenter.push(image);

            return imageholder;
        },
        video: function(element, slide, options) {
            var video = $(document.createElement("video"));
            video.addClass(options.classes.video);
            video.prop("autoplay", slide.autoplay);
            video.attr("poster", slide.poster);

            var videoholder = $(document.createElement("div"));
            videoholder.addClass(options.classes.content);
            videoholder.append(video);

            for (var i = 0; i < options.video.length; i++) {
                var source = $(document.createElement("source"));
                source.attr("src", slide.url.replace(slide.url.split(".")[1], "") + options.video[i]);
                source.attr("type", "video/" + options.video[i]);
                source.appendTo(video);
            }

            if (slide.center)
                autocenter.push(video);
            if (slide.videotimer)
                slider.videotimer(video, options);

            return videoholder;
        },
        videotimer: function(video, options) {
            interval = window.clearInterval(interval);

            if (video.is("video")) {
                video.data("videotimer", true);
                video.unbind("ended").bind("ended", function() {
                    slider.play(options);
                    slider.timer(options);
                });
            }
        }
    };

    var animations = {
        slider: {
            slideup: {
                current: function(element, options, callback) {
                    element.animate({
                        top: "-100%"
                    }, options.slider.speed, options.slider.easing);

                    if (typeof callback === "function")
                        callback(options);
                },
                next: function(element, options, callback) {
                    element.css({
                        top: "100%"
                    }).animate({
                        top: "0%"
                    }, options.slider.speed, options.slider.easing, function() {
                        if (typeof callback === "function")
                            callback(options);
                    });
                }
            },
            slidedown: {
                current: function(element, options, callback) {
                    element.animate({
                        bottom: "-100%"
                    }, options.slider.speed, options.slider.easing);

                    if (typeof callback === "function")
                        callback(options);
                },
                next: function(element, options, callback) {
                    element.css({
                        bottom: "100%"
                    }).animate({
                        bottom: "0%"
                    }, options.slider.speed, options.slider.easing, function() {
                        if (typeof callback === "function")
                            callback(options);
                    });
                }
            },
            slideleft: {
                current: function(element, options, callback) {
                    element.animate({
                        left: "-100%"
                    }, options.slider.speed, options.slider.easing);

                    if (typeof callback === "function")
                        callback(options);
                },
                next: function(element, options, callback) {
                    element.css({
                        left: "100%"
                    }).animate({
                        left: "0%"
                    }, options.slider.speed, options.slider.easing, function() {
                        if (typeof callback === "function")
                            callback(options);
                    });
                }
            },
            slideright: {
                current: function(element, options, callback) {
                    element.animate({
                        right: "-100%"
                    }, options.slider.speed, options.slider.easing);

                    if (typeof callback === "function")
                        callback(options);
                },
                next: function(element, options, callback) {
                    element.css({
                        right: "100%"
                    }).animate({
                        right: "0%"
                    }, options.slider.speed, options.slider.easing, function() {
                        if (typeof callback === "function")
                            callback(options);
                    });
                }
            },
            fade: {
                current: function(element, options, callback) {
                    element.fadeOut(options.slider.speed);

                    if (typeof callback === "function")
                        callback(options);
                },
                next: function(element, options, callback) {
                    element.fadeIn(options.slider.speed, function() {
                        if (typeof callback === "function")
                            callback(options);
                    });
                }
            }
        },
        title: {
            slideup: {
                current: function(element, options, calback) {
                    element.children().each(function(i) {
                        $(this).fadeOut(options.title.speed, function() {
                            $(this).css({
                                marginTop: "-115%"
                            });
                        });
                    });
                },
                next: function(element, options, callback) {
                    element.children().each(function(i) {
                        var title = $(this);
                        setTimeout(function() {
                            title.fadeIn(options.title.speed);
                            title.animate({
                                marginTop: "0%"
                            }, options.title.speed, options.title.easing);
                        }, i * options.title.speed);
                    });

                    if (typeof callback === "function")
                        callback(options);
                }
            },
            slidedown: {
                current: function(element, options, calback) {
                    element.children().each(function(i) {
                        $(this).fadeOut(options.title.speed, function() {
                            $(this).css({
                                marginBottom: "115%"
                            });
                        });
                    });
                },
                next: function(element, options, callback) {
                    element.children().each(function(i) {
                        var title = $(this);
                        setTimeout(function() {
                            title.fadeIn(options.title.speed);
                            title.animate({
                                marginBottom: "0%"
                            }, options.title.speed, options.title.easing);
                        }, i * options.title.speed);
                    });

                    if (typeof callback === "function")
                        callback(options);
                }
            },
            slideleft: {
                current: function(element, options, calback) {
                    element.children().each(function(i) {
                        $(this).fadeOut(options.title.speed, function() {
                            $(this).css({
                                marginLeft: "-115%"
                            });
                        });
                    });
                },
                next: function(element, options, callback) {
                    element.children().each(function(i) {
                        var title = $(this);
                        setTimeout(function() {
                            title.fadeIn(options.title.speed);
                            title.animate({
                                marginLeft: "0%"
                            }, options.title.speed, options.title.easing);
                        }, i * options.title.speed);
                    });

                    if (typeof callback === "function")
                        callback(options);
                }
            },
            fade: {
                current: function(element, options, calback) {
                    element.children().each(function(i) {
                        $(this).fadeOut(options.title.speed);
                    });
                },
                next: function(element, options, callback) {
                    element.children().each(function(i) {
                        var title = $(this);
                        setTimeout(function() {
                            title.fadeIn(options.title.speed);
                        }, i * options.title.speed);
                    });

                    if (typeof callback === "function")
                        callback(options);
                }
            }
        }
    };

    $.fn.rslider = function(options, callback) {
        return this.each(function() {
            slider.init($(this), options);
        });
    };

    $.fn.rslider.defaultOptions = {
        classes: {
            holder: "slider-container",
            content: "slider-content",
            video: "slider-video",
            image: "slider-image",
            title: "slider-title"
        },
        slider: {
            animation: "slide-up",
            easing: "easeInOutExpo",
            speed: 2000
        },
        title: {
            animation: "slide-left",
            easing: "easeInOutExpo",
            speed: 300
        },
        timing: 12000,
        repeat: true,
        slides: [],
        video: [
            "mp4",
            "webm",
            "ogv"
        ]
    };

})(jQuery, window, document);