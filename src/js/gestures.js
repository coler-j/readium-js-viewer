//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification, 
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this 
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice, 
//  this list of conditions and the following disclaimer in the documentation and/or 
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be 
//  used to endorse or promote products derived from this software without specific 
//  prior written permission.

define(['readium_shared_js/globals', 'jquery','jquery_hammer','hammerjs'], function(Globals, $,jqueryHammer,Hammer) {

    var gesturesHandler = function(reader, viewport){
      
        var onSwipeLeft = function(){
            reader.openPageRight();
        };

        var onSwipeRight = function(){
            reader.openPageLeft();
        };

        var isGestureHandled = function() {
            var viewType = reader.getCurrentViewType();

            return viewType === reader.VIEW_TYPE_FIXED || viewType == reader.VIEW_TYPE_COLUMNIZED;
        };

        this.initialize = function(){
          
            var swipingOptions = {
              prevent_mouseevents: true,
              inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput,
              recognizers: [
                [Hammer.Pan, { enable: false }],
                [Hammer.Swipe, {
                  direction: Hammer.DIRECTION_HORIZONTAL
                }]
              ]
            };

            reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function(iframe, spineItem) {
                Globals.logEvent("CONTENT_DOCUMENT_LOADED", "ON", "gestures.js [ " + spineItem.href + " ]");
                
                var iframe_document_selector = iframe[0].contentWindow.document.body
                
                Hammer.DOCUMENT = iframe[0].contentWindow.document.body;
                
                $(iframe_document_selector).hammer(swipingOptions).on("swipeleft", function() {
                    onSwipeLeft();
                });
                $(iframe_document_selector).hammer(swipingOptions).on("swiperight", function() {
                    onSwipeRight();
                });
                
                //remove stupid ipad safari elastic scrolling
                //TODO: test this with reader ScrollView and FixedView
                $(Hammer.DOCUMENT).on(
                    'touchmove',
                    function(e) {
                        //hack: check if we are not dealing with a scrollview
                        if(isGestureHandled()){
                          console.debug('in isGestureHandled function with true')
                          e.preventDefault();
                        }
                    }
                );
            });

            //remove stupid ipad safari elastic scrolling (improves UX for gestures)
            //TODO: test this with reader ScrollView and FixedView
            $(viewport).on(
                'touchmove',
                function(e) {
                    if(isGestureHandled()) {
                        console.debug('in isGestureHandled function with true')
                        e.preventDefault();
                    }
                }
            );

            //handlers on viewport
            $(viewport).hammer(swipingOptions).on("swipeleft", function() {
                onSwipeLeft();
            });
            $(viewport).hammer(swipingOptions).on("swiperight", function() {
                onSwipeRight();
            });
        };

    };
    return gesturesHandler;
});