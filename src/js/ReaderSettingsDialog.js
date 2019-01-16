define(['./ModuleConfig', 'hgn!readium_js_viewer_html_templates/settings-dialog.html', './ReaderSettingsDialog_Keyboard', 'i18nStrings', './Dialogs', 'Settings', './Keyboard'], function(moduleConfig, SettingsDialog, KeyboardSettings, Strings, Dialogs, Settings, Keyboard){

    // change these values to affec the default state of the application's preferences at first-run.
    var defaultSettings = {
        fontSize: 100,
        fontSelection: 0, //0 is the index of default for our purposes.
        syntheticSpread: "auto",
        scroll: "auto",
        columnGap: 60,
        columnMaxWidth: 550,
        columnMinWidth: 400
    }

    var getBookStyles = function(theme){
        var isAuthorTheme = theme === "author-theme";
        var $previewText = $('.preview-text');
        setPreviewTheme($previewText, theme);
        var previewStyle = window.getComputedStyle($previewText[0]);
        var bookStyles = [{
            selector: ':not(a):not(hypothesis-highlight)', // or "html", or "*", or "", or undefined (styles applied to whole document)
            declarations: {
            backgroundColor: isAuthorTheme ? "" : previewStyle.backgroundColor,
            color: isAuthorTheme ? "" : previewStyle.color
        }},
        {
            selector: 'a', // so that hyperlinks stand out (otherwise they are invisible, and we do not have a configured colour scheme for each theme (TODO? add hyperlinks colours in addition to basic 2x params backgroundColor and color?).
            declarations: {
            backgroundColor: isAuthorTheme ? "" : previewStyle.color,
            color: isAuthorTheme ? "" : previewStyle.backgroundColor
        }}];
        return bookStyles;
    }
    var setPreviewTheme = function($previewText, newTheme){
        var previewTheme = $previewText.attr('data-theme');
        $previewText.removeClass(previewTheme);
        $previewText.addClass(newTheme);
        $previewText.attr('data-theme', newTheme);
    }

    var updateReader = function(reader, readerSettings){
        reader.updateSettings(readerSettings); // triggers on pagination changed

        if (readerSettings.theme){
            //$("html").addClass("_" + readerSettings.theme);
            $("html").attr("data-theme", readerSettings.theme);

            var bookStyles = getBookStyles(readerSettings.theme);
            reader.setBookStyles(bookStyles);
            $('body').css(bookStyles[0].declarations);
            $('#app-navbar').css(bookStyles[0].declarations);
            $('#reading-area').css(bookStyles[0].declarations);
        }
    }

    var updateSliderLabels = function($slider, val, txt, label) {
        $slider.val(val);

        $slider.attr("aria-valuenow", val+"");
        $slider.attr("aria-value-now", val+"");

        $slider.attr("aria-valuetext", txt+"");
        $slider.attr("aria-value-text", txt+"");

        $slider.attr("title", label + " " + txt);
        $slider.attr("aria-label", label + " " + txt);
    };

    var initDialog = function(reader){
        $('#app-container').append(SettingsDialog({imagePathPrefix: moduleConfig.imagePathPrefix, strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));

        $previewText = $('.preview-text');
        $('.theme-option').on('click', function(){
            var newTheme = $(this).attr('data-theme');
            setPreviewTheme($previewText, newTheme);
        });

        var $fontSizeSlider = $("#font-size-input");
        $fontSizeSlider.on('change', function(){
            var fontSize = $fontSizeSlider.val();

            $previewText.css({fontSize: (fontSize/100) + 'em'});

            updateSliderLabels($fontSizeSlider, fontSize, fontSize + '%', Strings.i18n_font_size);
        });

        var updateFontSize = function(value) {
            var fontSize = $fontSizeSlider.val();

            if (fontSize >= 60 && fontSize <= 170) {
                fontSize = Number(fontSize) + (value * 10);
            }

            if (fontSize === 60) {
                $('#font-size-input--minus').addClass('icon--disabled');
            } else {
                $('#font-size-input--minus').removeClass('icon--disabled');
            }

            if (fontSize === 170) {
                $('#font-size-input--plus').addClass('icon--disabled');
            } else {
                $('#font-size-input--plus').removeClass('icon--disabled');
            }

            $previewText.css({fontSize: (fontSize/100) + 'em'});

            updateSliderLabels($fontSizeSlider, fontSize, fontSize + '%', Strings.i18n_font_size);
        }

        $('#font-size-input--minus').on('click', function(){
            updateFontSize(-1);
        });

        $('#font-size-input--plus').on('click', function(){
            updateFontSize(1);
        });

        $('#settings-dialog').on('hide.bs.modal', function(){ // IMPORTANT: not "hidden.bs.modal"!! (because .off() in

            // Safety: "save" button click
            setTimeout(function(){
                $("#keyboard-list").empty();
            }, 500);
        });

        $('#settings-dialog').on('show.bs.modal', function(){ // IMPORTANT: not "shown.bs.modal"!! (because .off() in library vs. reader context)

            $('#tab-butt-main').trigger("click");
            KeyboardSettings.initKeyboardList();

            Settings.get('reader', function(readerSettings){
                readerSettings = readerSettings || defaultSettings;
                for (prop in defaultSettings)
                {
                    if (defaultSettings.hasOwnProperty(prop) && (!readerSettings.hasOwnProperty(prop) || (typeof readerSettings[prop] == "undefined")))
                    {
                        readerSettings[prop] = defaultSettings[prop];
                    }
                }

                $fontSizeSlider.val(readerSettings.fontSize);
                updateSliderLabels($fontSizeSlider, readerSettings.fontSize, readerSettings.fontSize + '%', Strings.i18n_font_size);

                // reset column gap top default, as page width control is now used (see readerSettings.columnMaxWidth)
                readerSettings.columnGap = defaultSettings.columnGap;
                //

                if (readerSettings.theme){
                    setPreviewTheme($previewText, readerSettings.theme);
                }

                $previewText.css({fontSize: (readerSettings.fontSize/100) + 'em'});
            });
        });

        var save = function(){
            var readerSettings = {
                fontSize: Number($fontSizeSlider.val()),
                fontSelection: defaultSettings.fontSelection,
                syntheticSpread: "auto",
                columnGap: defaultSettings.columnGap,
                columnMaxWidth: defaultSettings.columnMaxWidth,
                scroll: "auto"
            };

            readerSettings.theme = $previewText.attr('data-theme');
            if (reader){
               updateReader(reader, readerSettings);
            }


            var keys = KeyboardSettings.saveKeys();

            Settings.get('reader', function(json)
            {
                if (!json)
                {
                    json = {};
                }

                for (prop in readerSettings)
                {
                    if (readerSettings.hasOwnProperty(prop))
                    {
                        json[prop] = readerSettings[prop];
                    }
                }

                json.keyboard = keys;

                // Note: automatically JSON.stringify's the passed value!
                Settings.put('reader', json);

                setTimeout(function()
                {
                    Keyboard.applySettings(json);
                }, 100);
            });
        };

        Keyboard.on(Keyboard.NightTheme, 'settings', function(){

                Settings.get('reader', function(json)
                {
                    if (!json)
                    {
                        json = {};
                    }

                    var isNight = json.theme === "night-theme";
                    json.theme = isNight ? "author-theme" : "night-theme";

                    // Note: automatically JSON.stringify's the passed value!
                    Settings.put('reader', json);

                    if (reader) updateReader(reader, json);
                });
        });

        Keyboard.on(Keyboard.SettingsModalSave, 'settings', function() {
            save();
            $('#settings-dialog').modal('hide');
        });

        Keyboard.on(Keyboard.SettingsModalClose, 'settings', function() {
            $('#settings-dialog').modal('hide');
        });

        $('#settings-dialog #buttSave').on('click', save);
    }

    return {
        initDialog : initDialog,
        updateReader : updateReader,
        defaultSettings : defaultSettings
    }
});
