(function(){
    var script = {
 "mouseWheelEnabled": true,
 "scripts": {
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "existsKey": function(key){  return key in window; },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "registerKey": function(key, value){  window[key] = value; },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "getKey": function(key){  return window[key]; },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "unregisterKey": function(key){  delete window[key]; },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; }
 },
 "horizontalAlign": "left",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.MainViewer",
  "this.Image_BEE6FED8_AC35_2F20_41D8_34B6B91DA709",
  "this.Container_806973DA_ADB0_EB72_41E1_4BBDAAEB91FF",
  "this.Container_BC8D06B7_B143_E72C_41CA_E1C4F81682F0",
  "this.HTMLText_B3A95BF7_AD90_5B11_41E1_AC9050095132",
  "this.Container_A797E343_B17D_3EDA_41AB_2CDE4A57AE7C"
 ],
 "id": "rootPlayer",
 "defaultVRPointer": "laser",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "absolute",
 "start": "this.init(); this.syncPlaylists([this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist,this.ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856_playlist,this.mainPlayList]); this.playList_84FDF019_8B1C_39F4_41D7_A9760BB602C8.set('selectedIndex', 0); if(!this.get('fullscreenAvailable')) { [this.IconButton_BD225E9E_B273_D96C_41A9_C0F962709F6A].forEach(function(component) { component.set('visible', false); }) }",
 "width": "100%",
 "scrollBarMargin": 2,
 "downloadEnabled": false,
 "gap": 10,
 "class": "Player",
 "scrollBarWidth": 10,
 "overflow": "visible",
 "paddingRight": 0,
 "borderSize": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "height": "100%",
 "definitions": [{
 "class": "MapPlayer",
 "buttonZoomIn": "this.IconButton_A797F343_B17D_3EDA_41E1_5446CB5EC525",
 "buttonZoomOut": "this.IconButton_A7973343_B17D_3EDA_41E5_A3FC6227C5CE",
 "id": "MapViewerMapPlayer",
 "viewerArea": "this.MapViewer",
 "movementMode": "constrained"
},
{
 "label": "Entrance (2)",
 "id": "panorama_802004A0_8A1A_0DDE_41CD_39D980509897",
 "vfov": 180,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_t.jpg",
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/f/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/f/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/u/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/u/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/r/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/r/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_t.jpg",
   "back": {
    "levels": [
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/b/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/b/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/d/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/d/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/l/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/l/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "overlays": [
  "this.overlay_A326877F_8A21_5D40_417E_DD26C838459D",
  "this.overlay_A0D465BA_8A20_FDCE_41D1_7A8E85E2F073"
 ],
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "backwardYaw": -64.39,
   "panorama": "this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5",
   "yaw": -85.49,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "backwardYaw": 92.87,
   "panorama": "this.panorama_8148C872_8A1A_0523_41DF_8658E34FCA66",
   "yaw": 175.78,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "mapLocations": [
  {
   "map": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "x": 1497.78,
   "angle": -86.55,
   "y": 998.3,
   "class": "PanoramaMapLocation"
  }
 ],
 "hfov": 360,
 "partial": false,
 "hfovMin": "120%"
},
{
 "label": "Floor Plan 3D",
 "id": "map_98550360_8A21_57EC_41DA_DFA17C291EC7",
 "fieldOfViewOverlayOutsideOpacity": 0,
 "width": 2599,
 "fieldOfViewOverlayRadiusScale": 0.3,
 "maximumZoomFactor": 1.2,
 "image": {
  "levels": [
   {
    "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7.jpeg",
    "width": 2599,
    "height": 2147,
    "class": "ImageResourceLevel"
   },
   {
    "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_lq.jpeg",
    "width": 281,
    "tags": "preload",
    "height": 233,
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "thumbnailUrl": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_t.jpg",
 "initialZoomFactor": 1,
 "overlays": [
  "this.overlay_998B9664_8A23_51F5_41DB_5AA09CBC457C",
  "this.overlay_99AE7FB0_8A21_2F6D_41B2_254E149A6BE8",
  "this.overlay_9887C6B9_8A21_715F_419A_A83F8C9EB8B6",
  "this.overlay_98CAA389_8A21_373C_41D3_CE79521A4146",
  "this.overlay_991CBDB7_8A20_D354_41DB_8683E9F42DF0",
  "this.overlay_9841BA09_8A2F_513F_41D3_BE1C53A9E38E",
  "this.overlay_9C148ECC_8A27_513B_41DB_5F52A49DBB72"
 ],
 "fieldOfViewOverlayInsideOpacity": 0.4,
 "scaleMode": "fit_inside",
 "class": "Map",
 "fieldOfViewOverlayInsideColor": "#FFFFFF",
 "minimumZoomFactor": 0.5,
 "fieldOfViewOverlayOutsideColor": "#000000",
 "height": 2147
},
{
 "label": "Female Toilet",
 "id": "panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5",
 "vfov": 180,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_t.jpg",
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/f/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/f/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/u/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/u/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/r/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/r/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_t.jpg",
   "back": {
    "levels": [
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/b/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/b/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/d/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/d/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/l/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/l/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "overlays": [
  "this.overlay_A1FF017D_8A20_F545_41AE_02E5FF4FBB84",
  "this.overlay_A379406A_8A27_334F_41D6_DA18DA8C5699"
 ],
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "backwardYaw": 178.37,
   "panorama": "this.panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B",
   "yaw": 89.61,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "backwardYaw": -85.49,
   "panorama": "this.panorama_802004A0_8A1A_0DDE_41CD_39D980509897",
   "yaw": -64.39,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "mapLocations": [
  {
   "map": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "x": 1499.47,
   "angle": 90.83,
   "y": 1396.7,
   "class": "PanoramaMapLocation"
  },
  {
   "map": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "x": 1499.47,
   "angle": 0,
   "y": 1396.7,
   "class": "PanoramaMapLocation"
  }
 ],
 "hfov": 360,
 "partial": false,
 "hfovMin": "120%"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_camera",
 "initialPosition": {
  "yaw": 92.7,
  "pitch": -4.77,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "label": "Female Toilet Zone",
 "id": "panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75",
 "vfov": 180,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_t.jpg",
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/f/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/f/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/u/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/u/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/r/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/r/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_t.jpg",
   "back": {
    "levels": [
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/b/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/b/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/d/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/d/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/l/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/l/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "overlays": [
  "this.overlay_A08A63F2_8A21_555E_41C0_182FA97C6AE4",
  "this.overlay_A0941362_8A20_F57E_41D9_863713D8EA2E"
 ],
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "backwardYaw": 110.58,
   "panorama": "this.panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B",
   "yaw": -60.12,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "backwardYaw": 17.88,
   "panorama": "this.panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971",
   "yaw": 86.34,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "mapLocations": [
  {
   "map": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "x": 1169.7,
   "angle": 179.05,
   "y": 1662.42,
   "class": "PanoramaMapLocation"
  }
 ],
 "hfov": 360,
 "partial": false,
 "hfovMin": "120%"
},
{
 "buttonPlayRight": "this.IconButton_A7979343_B17D_3EDA_41BB_92702E290118",
 "displayPlaybackBar": true,
 "buttonPlayLeft": "this.IconButton_A7971343_B17D_3EDA_41E1_D4B648D50BFF",
 "buttonZoomOut": "this.IconButton_A7973343_B17D_3EDA_41E5_A3FC6227C5CE",
 "id": "MainViewerPanoramaPlayer",
 "viewerArea": "this.MainViewer",
 "touchControlMode": "drag_rotation",
 "mouseControlMode": "drag_acceleration",
 "buttonMoveDown": "this.IconButton_A797B343_B17D_3EDA_41CA_0171986F3D96",
 "gyroscopeVerticalDraggingEnabled": true,
 "buttonZoomIn": "this.IconButton_A797F343_B17D_3EDA_41E1_5446CB5EC525",
 "buttonMoveRight": "this.IconButton_A797A343_B17D_3EDA_41B1_10FF9F1B46EE",
 "buttonMoveUp": "this.IconButton_A7975343_B17D_3EDA_41BF_8955CDC2EDAB",
 "buttonMoveLeft": "this.IconButton_A7970343_B17D_3EDA_41DF_8CEDA653A935",
 "buttonPause": "this.IconButton_A7974343_B17D_3EDA_41D5_38B6E5F68E61",
 "class": "PanoramaPlayer"
},
{
 "class": "SlideOutEffect",
 "easing": "linear",
 "id": "effect_F210C674_E554_F572_41E1_4BD5DFC260E8",
 "to": "right",
 "duration": 0
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85E65121_8B1C_3BD4_41D6_1F0EA3315727",
 "initialPosition": {
  "yaw": -93.66,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_camera",
 "initialPosition": {
  "yaw": 92.7,
  "pitch": -6.78,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "items": [
  {
   "media": "this.panorama_8148C872_8A1A_0523_41DF_8658E34FCA66",
   "begin": "this.setEndToItemIndex(this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_camera",
   "class": "PanoramaPlayListItem"
  },
  {
   "media": "this.panorama_802004A0_8A1A_0DDE_41CD_39D980509897",
   "begin": "this.setEndToItemIndex(this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_802004A0_8A1A_0DDE_41CD_39D980509897_camera",
   "class": "PanoramaPlayListItem"
  },
  {
   "media": "this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5",
   "begin": "this.setEndToItemIndex(this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_camera",
   "class": "PanoramaPlayListItem"
  },
  {
   "media": "this.panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B",
   "begin": "this.setEndToItemIndex(this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_camera",
   "class": "PanoramaPlayListItem"
  },
  {
   "media": "this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75",
   "begin": "this.setEndToItemIndex(this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_camera",
   "class": "PanoramaPlayListItem"
  },
  {
   "media": "this.panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971",
   "begin": "this.setEndToItemIndex(this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist, 5, 6)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_camera",
   "class": "PanoramaPlayListItem"
  },
  {
   "media": "this.panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B",
   "begin": "this.setEndToItemIndex(this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist, 6, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_camera",
   "class": "PanoramaPlayListItem"
  }
 ],
 "id": "DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist",
 "class": "PlayList"
},
{
 "class": "SlideOutEffect",
 "easing": "linear",
 "id": "effect_2745FDF7_ACED_1161_41D1_B5EC4D857875",
 "to": "right",
 "duration": 0
},
{
 "class": "SlideInEffect",
 "easing": "linear",
 "id": "effect_2745EDF7_ACED_1161_41CE_8D7449621D35",
 "from": "right",
 "duration": 0
},
{
 "label": "Female Toilet Zone",
 "id": "panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B",
 "vfov": 180,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_t.jpg",
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/f/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/f/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/u/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/u/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/r/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/r/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_t.jpg",
   "back": {
    "levels": [
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/b/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/b/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/d/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/d/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/l/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/l/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "overlays": [
  "this.overlay_A602BAD6_8A20_F746_41E0_2EED14BD4F00",
  "this.overlay_A00C17B5_8A21_3DDA_41D7_68C4216935BD"
 ],
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "backwardYaw": 89.61,
   "panorama": "this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5",
   "yaw": 178.37,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "backwardYaw": -60.12,
   "panorama": "this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75",
   "yaw": 110.58,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "mapLocations": [
  {
   "map": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "x": 1497.78,
   "angle": -178.55,
   "y": 1755.66,
   "class": "PanoramaMapLocation"
  }
 ],
 "hfov": 360,
 "partial": false,
 "hfovMin": "120%"
},
{
 "label": "Female Toilet Zone",
 "id": "panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B",
 "vfov": 180,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_t.jpg",
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/f/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/f/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/u/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/u/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/r/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/r/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_t.jpg",
   "back": {
    "levels": [
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/b/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/b/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/d/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/d/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/l/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/l/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "overlays": [
  "this.overlay_A0793F8D_8A23_2DCA_41C8_A9102157C3E0"
 ],
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "backwardYaw": -96.8,
   "panorama": "this.panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971",
   "yaw": -89.26,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "mapLocations": [
  {
   "map": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "x": 610.15,
   "angle": -90.87,
   "y": 1437.47,
   "class": "PanoramaMapLocation"
  }
 ],
 "hfov": 360,
 "partial": false,
 "hfovMin": "120%"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85AEB0B6_8B1C_3A3C_41CC_2C1FC0E67DE6",
 "initialPosition": {
  "yaw": -4.22,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "items": [
  {
   "media": "this.panorama_8148C872_8A1A_0523_41DF_8658E34FCA66",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856_playlist, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_camera",
   "class": "PanoramaPlayListItem"
  },
  {
   "media": "this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856_playlist, 1, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_camera",
   "class": "PanoramaPlayListItem"
  }
 ],
 "id": "ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856_playlist",
 "class": "PlayList"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85DC1104_8B1C_3BDD_41D6_3FC964E9FD76",
 "initialPosition": {
  "yaw": -87.13,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85A5F0C5_8B1C_3A5C_41CA_9CF7D0EBF82E",
 "initialPosition": {
  "yaw": 83.2,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85C960E6_8B1C_3A5C_41DD_AF036CC03C11",
 "initialPosition": {
  "yaw": 119.88,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85E96113_8B1C_3BF4_41DD_10D279FF103D",
 "initialPosition": {
  "yaw": 90.74,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85FC1130_8B1C_3A34_41B2_E22AD8C77EFF",
 "initialPosition": {
  "yaw": -93.66,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "items": [
  "this.PanoramaPlayListItem_84F2201E_8B1C_39EC_41D8_CBC4737F2275",
  "this.PanoramaPlayListItem_84F65022_8B1C_39D4_41BC_7B1B15D6B03E",
  "this.PanoramaPlayListItem_84F53022_8B1C_39D4_41D9_8B6CCA15FA55",
  "this.PanoramaPlayListItem_84F48023_8B1C_39D4_41D9_45EF7B218560",
  "this.PanoramaPlayListItem_84F41023_8B1C_39D4_41D4_0A1858DA0F74",
  "this.PanoramaPlayListItem_9B0BE029_8B1C_39D4_41E1_001F1494104D",
  "this.PanoramaPlayListItem_9B0B7029_8B1C_39D4_41B6_99E08213A2F5"
 ],
 "id": "mainPlayList",
 "class": "PlayList"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_9B22D064_8B1C_3A53_41D2_122D091D00A7",
 "initialPosition": {
  "yaw": 94.51,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "class": "SlideInEffect",
 "easing": "linear",
 "id": "effect_F2103674_E554_F572_41B1_203ED4CE50E6",
 "from": "right",
 "duration": 0
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_camera",
 "initialPosition": {
  "yaw": 93.45,
  "pitch": -3.27,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_camera",
 "initialPosition": {
  "yaw": 88.43,
  "pitch": -5.28,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_camera",
 "initialPosition": {
  "yaw": 89.43,
  "pitch": -7.03,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "items": [
  {
   "begin": "this.MapViewerMapPlayer.set('movementMode', 'constrained')",
   "media": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "player": "this.MapViewerMapPlayer",
   "class": "MapPlayListItem"
  }
 ],
 "id": "playList_84FDD019_8B1C_39F4_41D5_5DCB6C9775C8",
 "class": "PlayList"
},
{
 "label": "Entrance",
 "id": "panorama_8148C872_8A1A_0523_41DF_8658E34FCA66",
 "vfov": 180,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_t.jpg",
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/f/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/f/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/u/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/u/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/r/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/r/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_t.jpg",
   "back": {
    "levels": [
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/b/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/b/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/d/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/d/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/l/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/l/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "overlays": [
  "this.overlay_A36E7799_8AE7_5DF8_41A3_7C70A3253333"
 ],
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "backwardYaw": 175.78,
   "panorama": "this.panorama_802004A0_8A1A_0DDE_41CD_39D980509897",
   "yaw": 92.87,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "mapLocations": [
  {
   "map": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "x": 2137.05,
   "angle": 167.92,
   "y": 994.56,
   "class": "PanoramaMapLocation"
  }
 ],
 "hfov": 360,
 "partial": false,
 "hfovMin": "120%"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85B2E0D4_8B1C_3A7C_41DF_93AB7F58004D",
 "initialPosition": {
  "yaw": -90.39,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_9B179053_8B1C_3A75_41DD_A4E3B46AC8FC",
 "initialPosition": {
  "yaw": -1.63,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "panorama_802004A0_8A1A_0DDE_41CD_39D980509897_camera",
 "initialPosition": {
  "yaw": 0,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_9B337074_8B1C_3A33_41E0_24C8BF7153DE",
 "initialPosition": {
  "yaw": -69.42,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_camera",
 "initialPosition": {
  "yaw": 90.19,
  "pitch": -5.28,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_859020A7_8B1C_3ADC_41DC_8E633CC004ED",
 "initialPosition": {
  "yaw": -162.12,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "automaticRotationSpeed": 12,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "easing": "cubic_in",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "linear",
    "yawDelta": 323,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   },
   {
    "easing": "cubic_out",
    "yawDelta": 18.5,
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement"
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "automaticZoomSpeed": 0,
 "id": "camera_85C670F6_8B1C_3A3C_41CA_38F7D14D6C13",
 "initialPosition": {
  "yaw": 115.61,
  "pitch": 0,
  "class": "PanoramaCameraPosition"
 },
 "manualZoomSpeed": 0,
 "class": "PanoramaCamera"
},
{
 "items": [
  {
   "begin": "this.MapViewerMapPlayer.set('movementMode', 'constrained')",
   "media": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "player": "this.MapViewerMapPlayer",
   "class": "MapPlayListItem"
  }
 ],
 "id": "playList_84FDF019_8B1C_39F4_41D7_A9760BB602C8",
 "class": "PlayList"
},
{
 "label": "Female Toilet Zone",
 "id": "panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971",
 "vfov": 180,
 "hfovMax": 130,
 "pitch": 0,
 "thumbnailUrl": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_t.jpg",
 "frames": [
  {
   "front": {
    "levels": [
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/f/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/f/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/f/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/f/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "top": {
    "levels": [
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/u/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/u/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/u/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/u/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/r/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/r/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/r/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/r/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_t.jpg",
   "back": {
    "levels": [
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/b/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/b/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/b/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/b/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/d/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/d/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/d/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/d/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/l/0/{row}_{column}.jpg",
      "rowCount": 6,
      "tags": "ondemand",
      "colCount": 6,
      "width": 3072,
      "height": 3072,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/l/1/{row}_{column}.jpg",
      "rowCount": 3,
      "tags": "ondemand",
      "colCount": 3,
      "width": 1536,
      "height": 1536,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/l/2/{row}_{column}.jpg",
      "rowCount": 2,
      "tags": "ondemand",
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "class": "TiledImageResourceLevel"
     },
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0/l/3/{row}_{column}.jpg",
      "rowCount": 1,
      "tags": [
       "ondemand",
       "preload"
      ],
      "colCount": 1,
      "width": 512,
      "height": 512,
      "class": "TiledImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "class": "CubicPanoramaFrame"
  }
 ],
 "overlays": [
  "this.overlay_A37715AD_8A23_3DC5_41A9_1D6556DD107B",
  "this.overlay_A06C69BD_8A23_55CA_41A6_B28F6A077CB4"
 ],
 "class": "Panorama",
 "adjacentPanoramas": [
  {
   "backwardYaw": -89.26,
   "panorama": "this.panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B",
   "yaw": -96.8,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "backwardYaw": 86.34,
   "panorama": "this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75",
   "yaw": 17.88,
   "distance": 1,
   "class": "AdjacentPanorama"
  },
  {
   "backwardYaw": 86.34,
   "panorama": "this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75",
   "yaw": -96.8,
   "distance": 1,
   "class": "AdjacentPanorama"
  }
 ],
 "mapLocations": [
  {
   "map": "this.map_98550360_8A21_57EC_41DA_DFA17C291EC7",
   "x": 694.58,
   "angle": 88.64,
   "y": 1647.1,
   "class": "PanoramaMapLocation"
  }
 ],
 "hfov": 360,
 "partial": false,
 "hfovMin": "120%"
},
{
 "toolTipPaddingBottom": 4,
 "toolTipTextShadowBlurRadius": 3,
 "id": "MainViewer",
 "toolTipShadowColor": "#333333",
 "paddingBottom": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipFontWeight": "normal",
 "playbackBarHeight": 10,
 "playbackBarBackgroundColorDirection": "vertical",
 "playbackBarHeadWidth": 6,
 "width": "100%",
 "class": "ViewerArea",
 "progressBarBorderSize": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "playbackBarRight": 0,
 "transitionDuration": 0,
 "progressBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "playbackBarBorderRadius": 0,
 "paddingLeft": 0,
 "toolTipFontFamily": "Arial",
 "height": "100%",
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadBorderColor": "#000000",
 "toolTipTextShadowOpacity": 0,
 "minHeight": 50,
 "progressLeft": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarBorderSize": 0,
 "propagateClick": true,
 "toolTipShadowVerticalLength": 0,
 "minWidth": 100,
 "toolTipFontColor": "#606060",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipBackgroundColor": "#F6F6F6",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "progressBarBackgroundColorDirection": "vertical",
 "progressBottom": 0,
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "toolTipPaddingRight": 6,
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "toolTipBorderSize": 1,
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "vrPointerColor": "#FFFFFF",
 "toolTipDisplayTime": 600,
 "progressBarOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingRight": 0,
 "borderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderSize": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarHeadHeight": 15,
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipShadowBlurRadius": 3,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarBorderColor": "#000000",
 "toolTipBorderColor": "#767676",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "toolTipShadowSpread": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 5,
 "toolTipOpacity": 1,
 "data": {
  "name": "Main Viewer"
 },
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipFontSize": "0.6vw",
 "toolTipTextShadowColor": "#000000",
 "progressBorderColor": "#000000",
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "paddingTop": 0
},
{
 "horizontalAlign": "center",
 "id": "Image_BEE6FED8_AC35_2F20_41D8_34B6B91DA709",
 "left": "3%",
 "paddingBottom": 0,
 "shadow": false,
 "right": "91.27%",
 "class": "Image",
 "url": "skin/Image_BEE6FED8_AC35_2F20_41D8_34B6B91DA709.png",
 "maxWidth": 214,
 "maxHeight": 85,
 "backgroundOpacity": 0,
 "top": "86.71%",
 "paddingRight": 0,
 "borderSize": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "bottom": "4%",
 "minHeight": 1,
 "propagateClick": false,
 "minWidth": 1,
 "verticalAlign": "middle",
 "data": {
  "name": "DD"
 },
 "scaleMode": "fit_inside",
 "paddingTop": 0
},
{
 "gap": 10,
 "horizontalAlign": "left",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.Container_F59EA3FC_AC15_152A_41D3_A68AE3523ABE",
  "this.Container_8F88A174_B17F_DAF3_41E3_9385916D5A3E",
  "this.Container_8E56560D_B147_6613_41E3_B9F30B1AF2C2"
 ],
 "id": "Container_806973DA_ADB0_EB72_41E1_4BBDAAEB91FF",
 "left": "79.38%",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "vertical",
 "right": "1.2%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "top": "0%",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "100%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "verticalAlign": "top",
 "data": {
  "name": "Right Side Container"
 },
 "scrollBarColor": "#000000",
 "contentOpaque": false,
 "paddingTop": 0
},
{
 "gap": 10,
 "horizontalAlign": "left",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856"
 ],
 "id": "Container_BC8D06B7_B143_E72C_41CA_E1C4F81682F0",
 "left": "0%",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "absolute",
 "right": "84.23%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "top": "0%",
 "paddingRight": 0,
 "borderSize": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "bottom": "0%",
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "verticalAlign": "top",
 "data": {
  "name": "Left Side Container"
 },
 "minWidth": 1,
 "contentOpaque": false,
 "paddingTop": 0
},
{
 "scrollBarVisible": "rollOver",
 "id": "HTMLText_B3A95BF7_AD90_5B11_41E1_AC9050095132",
 "left": "0.05%",
 "paddingBottom": 20,
 "shadow": false,
 "right": "49.95%",
 "scrollBarMargin": 2,
 "class": "HTMLText",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "top": "0%",
 "paddingRight": 20,
 "borderSize": 0,
 "borderRadius": 0,
 "paddingLeft": 20,
 "bottom": "87.72%",
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "minWidth": 1,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:1.93vw;\"><B>Public Toilet</B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#003366;font-size:1.69vw;\"><B><I>Core Service</I></B></SPAN></SPAN></DIV></div>",
 "data": {
  "name": "HTMLText53815"
 },
 "scrollBarColor": "#000000",
 "paddingTop": 20
},
{
 "gap": 4,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.IconButton_A7973343_B17D_3EDA_41E5_A3FC6227C5CE",
  "this.IconButton_A7971343_B17D_3EDA_41E1_D4B648D50BFF",
  "this.IconButton_A7970343_B17D_3EDA_41DF_8CEDA653A935",
  "this.Container_A7977343_B17D_3EDA_41C0_F47328C07981",
  "this.IconButton_A797A343_B17D_3EDA_41B1_10FF9F1B46EE",
  "this.IconButton_A7979343_B17D_3EDA_41BB_92702E290118",
  "this.IconButton_BD225E9E_B273_D96C_41A9_C0F962709F6A",
  "this.IconButton_A797F343_B17D_3EDA_41E1_5446CB5EC525"
 ],
 "id": "Container_A797E343_B17D_3EDA_41AB_2CDE4A57AE7C",
 "left": "40%",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "horizontal",
 "right": "38.77%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "hidden",
 "top": "85.03%",
 "paddingRight": 0,
 "borderSize": 0,
 "borderRadius": 0,
 "paddingLeft": 0,
 "bottom": "0%",
 "minHeight": 20,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "minWidth": 20,
 "verticalAlign": "middle",
 "data": {
  "name": "Middle Control"
 },
 "scrollBarColor": "#000000",
 "contentOpaque": false,
 "paddingTop": 0
},
{
 "horizontalAlign": "center",
 "toolTipTextShadowBlurRadius": 3,
 "id": "IconButton_BD225E9E_B273_D96C_41A9_C0F962709F6A",
 "toolTipShadowColor": "#333333",
 "paddingBottom": 0,
 "shadow": false,
 "toolTipFontWeight": "normal",
 "width": "15.34%",
 "toolTipPaddingRight": 6,
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_BD225E9E_B273_D96C_41A9_C0F962709F6A_pressed.png",
 "maxWidth": 128,
 "toolTipBorderSize": 1,
 "maxHeight": 128,
 "toolTipPaddingTop": 4,
 "toolTipShadowHorizontalLength": 0,
 "backgroundOpacity": 0,
 "toolTipDisplayTime": 600,
 "toolTipPaddingLeft": 6,
 "rollOverIconURL": "skin/IconButton_BD225E9E_B273_D96C_41A9_C0F962709F6A_rollover.png",
 "paddingRight": 0,
 "toolTipShadowOpacity": 1,
 "borderSize": 0,
 "height": "27.74%",
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "paddingLeft": 0,
 "toolTipFontFamily": "Arial",
 "toolTipFontStyle": "normal",
 "mode": "toggle",
 "minHeight": 1,
 "toolTip": "Fullscreen",
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowBlurRadius": 3,
 "transparencyActive": true,
 "iconURL": "skin/IconButton_BD225E9E_B273_D96C_41A9_C0F962709F6A.png",
 "toolTipBorderColor": "#767676",
 "minWidth": 1,
 "toolTipFontColor": "#606060",
 "verticalAlign": "middle",
 "toolTipShadowSpread": 0,
 "data": {
  "name": "IconButton1493"
 },
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 1,
 "toolTipFontSize": 12,
 "cursor": "hand",
 "toolTipPaddingBottom": 4,
 "paddingTop": 0
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A797F343_B17D_3EDA_41E1_5446CB5EC525",
 "paddingBottom": 0,
 "shadow": false,
 "width": "8.91%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A797F343_B17D_3EDA_41E1_5446CB5EC525_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A797F343_B17D_3EDA_41E1_5446CB5EC525_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "23.36%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "propagateClick": false,
 "iconURL": "skin/IconButton_A797F343_B17D_3EDA_41E1_5446CB5EC525.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27673"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A7973343_B17D_3EDA_41E5_A3FC6227C5CE",
 "paddingBottom": 0,
 "shadow": false,
 "width": "9.07%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A7973343_B17D_3EDA_41E5_A3FC6227C5CE_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A7973343_B17D_3EDA_41E5_A3FC6227C5CE_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "23.36%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "propagateClick": false,
 "iconURL": "skin/IconButton_A7973343_B17D_3EDA_41E5_A3FC6227C5CE.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27662"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "toolTipPaddingBottom": 4,
 "toolTipTextShadowBlurRadius": 3,
 "id": "MapViewer",
 "toolTipShadowColor": "#333333",
 "paddingBottom": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipFontWeight": "normal",
 "playbackBarHeight": 10,
 "playbackBarBackgroundColorDirection": "vertical",
 "playbackBarHeadWidth": 6,
 "width": "100%",
 "class": "ViewerArea",
 "progressBarBorderSize": 0,
 "playbackBarProgressBorderSize": 0,
 "playbackBarProgressBorderRadius": 0,
 "playbackBarRight": 0,
 "transitionDuration": 500,
 "progressBarBorderRadius": 0,
 "toolTipShadowOpacity": 1,
 "playbackBarBorderRadius": 0,
 "paddingLeft": 0,
 "toolTipFontFamily": "Arial",
 "height": "90%",
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadBorderColor": "#000000",
 "toolTipTextShadowOpacity": 0,
 "minHeight": 1,
 "progressLeft": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadShadowHorizontalLength": 0,
 "playbackBarBorderSize": 0,
 "propagateClick": false,
 "toolTipShadowVerticalLength": 0,
 "minWidth": 1,
 "toolTipFontColor": "#606060",
 "toolTipShadowHorizontalLength": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipBackgroundColor": "#F6F6F6",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "progressBarBackgroundColorDirection": "vertical",
 "progressBottom": 2,
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "toolTipPaddingRight": 6,
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "toolTipBorderSize": 1,
 "toolTipPaddingLeft": 6,
 "toolTipPaddingTop": 4,
 "vrPointerColor": "#FFFFFF",
 "toolTipDisplayTime": 600,
 "progressBarOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "paddingRight": 0,
 "borderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderSize": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "progressBorderRadius": 0,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarHeadHeight": 15,
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipShadowBlurRadius": 3,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarBorderColor": "#000000",
 "toolTipBorderColor": "#767676",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "toolTipShadowSpread": 0,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 0,
 "toolTipOpacity": 1,
 "data": {
  "name": "Floor Plan"
 },
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipFontSize": "1.11vmin",
 "toolTipTextShadowColor": "#000000",
 "progressBorderColor": "#000000",
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "paddingTop": 0
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c"
 },
 "maps": [
  {
   "hfov": 23.51,
   "yaw": 175.78,
   "image": {
    "levels": [
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0_HS_6_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -35.11,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_B3BFE8C0_8A23_53AC_41D1_78E9D9717A8D",
   "yaw": 175.78,
   "hfov": 23.51,
   "pitch": -35.11,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A326877F_8A21_5D40_417E_DD26C838459D",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_8148C872_8A1A_0523_41DF_8658E34FCA66, this.camera_85DC1104_8B1C_3BDD_41D6_3FC964E9FD76); this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c"
 },
 "maps": [
  {
   "hfov": 13.19,
   "yaw": -85.49,
   "image": {
    "levels": [
     {
      "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0_HS_10_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -35.36,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_A179B7F4_8A21_DD5B_41C1_3AF0736FC21B",
   "yaw": -85.49,
   "hfov": 13.19,
   "pitch": -35.36,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A0D465BA_8A20_FDCE_41D1_7A8E85E2F073",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5, this.camera_85C670F6_8B1C_3A3C_41CA_38F7D14D6C13); this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "map": {
  "width": 100,
  "x": 2087.47,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_0_map.gif",
     "width": 16,
     "height": 16,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "offsetX": 0,
  "offsetY": 0,
  "height": 100,
  "y": 944.82,
  "class": "HotspotMapOverlayMap"
 },
 "data": {
  "label": "Image"
 },
 "image": {
  "x": 2087.05,
  "y": 944.56,
  "width": 100,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_0.png",
     "width": 99,
     "height": 99,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "height": 100,
  "class": "HotspotMapOverlayImage"
 },
 "useHandCursor": true,
 "id": "overlay_998B9664_8A23_51F5_41DB_5AA09CBC457C",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000",
   "class": "HotspotMapOverlayArea"
  }
 ],
 "class": "AreaHotspotMapOverlay"
},
{
 "map": {
  "width": 100,
  "x": 1448.26,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_1_map.gif",
     "width": 16,
     "height": 16,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "offsetX": 0,
  "offsetY": 0,
  "height": 100,
  "y": 948.77,
  "class": "HotspotMapOverlayMap"
 },
 "data": {
  "label": "Image"
 },
 "image": {
  "x": 1447.78,
  "y": 948.3,
  "width": 100,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_1.png",
     "width": 99,
     "height": 99,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "height": 100,
  "class": "HotspotMapOverlayImage"
 },
 "useHandCursor": true,
 "id": "overlay_99AE7FB0_8A21_2F6D_41B2_254E149A6BE8",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000",
   "class": "HotspotMapOverlayArea"
  }
 ],
 "class": "AreaHotspotMapOverlay"
},
{
 "map": {
  "width": 100,
  "x": 1448.26,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_2_map.gif",
     "width": 16,
     "height": 16,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "offsetX": 0,
  "offsetY": 0,
  "height": 100,
  "y": 1706.09,
  "class": "HotspotMapOverlayMap"
 },
 "data": {
  "label": "Image"
 },
 "image": {
  "x": 1447.78,
  "y": 1705.66,
  "width": 100,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_2.png",
     "width": 99,
     "height": 99,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "height": 100,
  "class": "HotspotMapOverlayImage"
 },
 "useHandCursor": true,
 "id": "overlay_9887C6B9_8A21_715F_419A_A83F8C9EB8B6",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000",
   "class": "HotspotMapOverlayArea"
  }
 ],
 "class": "AreaHotspotMapOverlay"
},
{
 "map": {
  "width": 100,
  "x": 1119.9,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_3_map.gif",
     "width": 16,
     "height": 16,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "offsetX": 0,
  "offsetY": 0,
  "height": 100,
  "y": 1612.62,
  "class": "HotspotMapOverlayMap"
 },
 "data": {
  "label": "Image"
 },
 "image": {
  "x": 1119.7,
  "y": 1612.42,
  "width": 100,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_3.png",
     "width": 99,
     "height": 99,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "height": 100,
  "class": "HotspotMapOverlayImage"
 },
 "useHandCursor": true,
 "id": "overlay_98CAA389_8A21_373C_41D3_CE79521A4146",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 4)",
   "mapColor": "#FF0000",
   "class": "HotspotMapOverlayArea"
  }
 ],
 "class": "AreaHotspotMapOverlay"
},
{
 "map": {
  "width": 100,
  "x": 644.86,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_4_map.gif",
     "width": 16,
     "height": 16,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "offsetX": 0,
  "offsetY": 0,
  "height": 100,
  "y": 1597.58,
  "class": "HotspotMapOverlayMap"
 },
 "data": {
  "label": "Image"
 },
 "image": {
  "x": 644.58,
  "y": 1597.1,
  "width": 100,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_4.png",
     "width": 99,
     "height": 99,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "height": 100,
  "class": "HotspotMapOverlayImage"
 },
 "useHandCursor": true,
 "id": "overlay_991CBDB7_8A20_D354_41DB_8683E9F42DF0",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000",
   "class": "HotspotMapOverlayArea"
  }
 ],
 "class": "AreaHotspotMapOverlay"
},
{
 "map": {
  "width": 100,
  "x": 560.42,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_6_map.gif",
     "width": 16,
     "height": 16,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "offsetX": 0,
  "offsetY": 0,
  "height": 100,
  "y": 1387.7,
  "class": "HotspotMapOverlayMap"
 },
 "data": {
  "label": "Image"
 },
 "image": {
  "x": 560.15,
  "y": 1387.47,
  "width": 100,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_6.png",
     "width": 99,
     "height": 99,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "height": 100,
  "class": "HotspotMapOverlayImage"
 },
 "useHandCursor": true,
 "id": "overlay_9841BA09_8A2F_513F_41D3_BE1C53A9E38E",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 6)",
   "mapColor": "#FF0000",
   "class": "HotspotMapOverlayArea"
  }
 ],
 "class": "AreaHotspotMapOverlay"
},
{
 "map": {
  "width": 100,
  "x": 1449.95,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_10_map.gif",
     "width": 16,
     "height": 16,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "offsetX": 0,
  "offsetY": 0,
  "height": 100,
  "y": 1346.89,
  "class": "HotspotMapOverlayMap"
 },
 "data": {
  "label": "Image"
 },
 "image": {
  "x": 1449.47,
  "y": 1346.7,
  "width": 100,
  "image": {
   "levels": [
    {
     "url": "media/map_98550360_8A21_57EC_41DA_DFA17C291EC7_HS_10.png",
     "width": 99,
     "height": 99,
     "class": "ImageResourceLevel"
    }
   ],
   "class": "ImageResource"
  },
  "height": 100,
  "class": "HotspotMapOverlayImage"
 },
 "useHandCursor": true,
 "id": "overlay_9C148ECC_8A27_513B_41DB_5F52A49DBB72",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000",
   "class": "HotspotMapOverlayArea"
  }
 ],
 "class": "AreaHotspotMapOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c"
 },
 "maps": [
  {
   "hfov": 9.49,
   "yaw": 89.61,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0_HS_3_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -41.39,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_BE32874F_8A21_5EB4_41CD_C15BB922163F",
   "yaw": 89.61,
   "hfov": 9.49,
   "pitch": -41.39,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A1FF017D_8A20_F545_41AE_02E5FF4FBB84",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B, this.camera_9B179053_8B1C_3A75_41DD_A4E3B46AC8FC); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c Right-Up"
 },
 "maps": [
  {
   "hfov": 16.65,
   "yaw": -64.39,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0_HS_4_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -39.88,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_B3BEC8C0_8A23_53AC_41D9_0C31A4237B17",
   "yaw": -64.39,
   "hfov": 16.65,
   "pitch": -39.88,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A379406A_8A27_334F_41D6_DA18DA8C5699",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_802004A0_8A1A_0DDE_41CD_39D980509897, this.camera_9B22D064_8B1C_3A53_41D2_122D091D00A7); this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c"
 },
 "maps": [
  {
   "hfov": 11.67,
   "yaw": 86.34,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0_HS_2_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -31.34,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_B3A048C2_8A23_53AC_41A3_4E93A6B8C976",
   "yaw": 86.34,
   "hfov": 11.67,
   "pitch": -31.34,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A08A63F2_8A21_555E_41C0_182FA97C6AE4",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971, this.camera_859020A7_8B1C_3ADC_41DC_8E633CC004ED); this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c Left-Up"
 },
 "maps": [
  {
   "hfov": 9.51,
   "yaw": -60.12,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0_HS_3_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -49.55,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_A17FF7F5_8A21_DD45_41C2_8892C6571B24",
   "yaw": -60.12,
   "hfov": 9.51,
   "pitch": -49.55,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A0941362_8A20_F57E_41D9_863713D8EA2E",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B, this.camera_9B337074_8B1C_3A33_41E0_24C8BF7153DE); this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A7979343_B17D_3EDA_41BB_92702E290118",
 "paddingBottom": 0,
 "shadow": false,
 "width": "11.17%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A7979343_B17D_3EDA_41BB_92702E290118_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A7979343_B17D_3EDA_41BB_92702E290118_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "29.2%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "pressedRollOverIconURL": "skin/IconButton_A7979343_B17D_3EDA_41BB_92702E290118_pressed_rollover.png",
 "propagateClick": false,
 "iconURL": "skin/IconButton_A7979343_B17D_3EDA_41BB_92702E290118.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27671"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A7971343_B17D_3EDA_41E1_D4B648D50BFF",
 "paddingBottom": 0,
 "shadow": false,
 "width": "11.27%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A7971343_B17D_3EDA_41E1_D4B648D50BFF_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A7971343_B17D_3EDA_41E1_D4B648D50BFF_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "29.2%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "propagateClick": false,
 "iconURL": "skin/IconButton_A7971343_B17D_3EDA_41E1_D4B648D50BFF.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27664"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A797B343_B17D_3EDA_41CA_0171986F3D96",
 "paddingBottom": 0,
 "shadow": false,
 "width": "80%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A797B343_B17D_3EDA_41CA_0171986F3D96_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A797B343_B17D_3EDA_41CA_0171986F3D96_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "23.36%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "propagateClick": false,
 "iconURL": "skin/IconButton_A797B343_B17D_3EDA_41CA_0171986F3D96.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27669"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A797A343_B17D_3EDA_41B1_10FF9F1B46EE",
 "paddingBottom": 0,
 "shadow": false,
 "width": "8.96%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A797A343_B17D_3EDA_41B1_10FF9F1B46EE_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A797A343_B17D_3EDA_41B1_10FF9F1B46EE_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "23.36%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "propagateClick": false,
 "iconURL": "skin/IconButton_A797A343_B17D_3EDA_41B1_10FF9F1B46EE.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27670"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A7975343_B17D_3EDA_41BF_8955CDC2EDAB",
 "paddingBottom": 0,
 "shadow": false,
 "width": "80%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A7975343_B17D_3EDA_41BF_8955CDC2EDAB_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A7975343_B17D_3EDA_41BF_8955CDC2EDAB_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "23.36%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "propagateClick": false,
 "iconURL": "skin/IconButton_A7975343_B17D_3EDA_41BF_8955CDC2EDAB.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27667"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A7970343_B17D_3EDA_41DF_8CEDA653A935",
 "paddingBottom": 0,
 "shadow": false,
 "width": "8.99%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A7970343_B17D_3EDA_41DF_8CEDA653A935_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A7970343_B17D_3EDA_41DF_8CEDA653A935_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "23.36%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "propagateClick": false,
 "iconURL": "skin/IconButton_A7970343_B17D_3EDA_41DF_8CEDA653A935.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27665"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_A7974343_B17D_3EDA_41D5_38B6E5F68E61",
 "paddingBottom": 0,
 "shadow": false,
 "width": "100%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_A7974343_B17D_3EDA_41D5_38B6E5F68E61_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_A7974343_B17D_3EDA_41D5_38B6E5F68E61_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "29.2%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "toggle",
 "minHeight": 0,
 "pressedRollOverIconURL": "skin/IconButton_A7974343_B17D_3EDA_41D5_38B6E5F68E61_pressed_rollover.png",
 "propagateClick": false,
 "iconURL": "skin/IconButton_A7974343_B17D_3EDA_41D5_38B6E5F68E61.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27668"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c"
 },
 "maps": [
  {
   "hfov": 9.47,
   "yaw": 110.58,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0_HS_2_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -37.24,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_B54F95EC_8A20_DD7B_41C8_3E1FCF495D13",
   "yaw": 110.58,
   "hfov": 9.47,
   "pitch": -37.24,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A602BAD6_8A20_F746_41E0_2EED14BD4F00",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75, this.camera_85C960E6_8B1C_3A5C_41DD_AF036CC03C11); this.mainPlayList.set('selectedIndex', 4)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01b Right-Up"
 },
 "maps": [
  {
   "hfov": 10.85,
   "yaw": 178.37,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0_HS_3_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -40.76,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_B54FE5EC_8A20_DD7B_41A0_D56DDB4D76E6",
   "yaw": 178.37,
   "hfov": 10.85,
   "pitch": -40.76,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A00C17B5_8A21_3DDA_41D7_68C4216935BD",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5, this.camera_85B2E0D4_8B1C_3A7C_41DF_93AB7F58004D); this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c"
 },
 "maps": [
  {
   "hfov": 17.81,
   "yaw": -89.26,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0_HS_1_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -51.69,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_B3A308C3_8A23_53AC_41D2_A74DF83B35CB",
   "yaw": -89.26,
   "hfov": 17.81,
   "pitch": -51.69,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A0793F8D_8A23_2DCA_41C8_A9102157C3E0",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971, this.camera_85A5F0C5_8B1C_3A5C_41CA_9CF7D0EBF82E); this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "media": "this.panorama_8148C872_8A1A_0523_41DF_8658E34FCA66",
 "begin": "this.setMapLocation(this.PanoramaPlayListItem_84F2201E_8B1C_39EC_41D8_CBC4737F2275, this.MapViewerMapPlayer); this.setEndToItemIndex(this.mainPlayList, 0, 1)",
 "player": "this.MainViewerPanoramaPlayer",
 "id": "PanoramaPlayListItem_84F2201E_8B1C_39EC_41D8_CBC4737F2275",
 "camera": "this.panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_camera",
 "class": "PanoramaPlayListItem"
},
{
 "media": "this.panorama_802004A0_8A1A_0DDE_41CD_39D980509897",
 "begin": "this.setMapLocation(this.PanoramaPlayListItem_84F65022_8B1C_39D4_41BC_7B1B15D6B03E, this.MapViewerMapPlayer); this.setEndToItemIndex(this.mainPlayList, 1, 2)",
 "player": "this.MainViewerPanoramaPlayer",
 "id": "PanoramaPlayListItem_84F65022_8B1C_39D4_41BC_7B1B15D6B03E",
 "camera": "this.panorama_802004A0_8A1A_0DDE_41CD_39D980509897_camera",
 "class": "PanoramaPlayListItem"
},
{
 "media": "this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5",
 "begin": "this.setMapLocation(this.PanoramaPlayListItem_84F53022_8B1C_39D4_41D9_8B6CCA15FA55, this.MapViewerMapPlayer); this.setEndToItemIndex(this.mainPlayList, 2, 3)",
 "player": "this.MainViewerPanoramaPlayer",
 "id": "PanoramaPlayListItem_84F53022_8B1C_39D4_41D9_8B6CCA15FA55",
 "camera": "this.panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_camera",
 "class": "PanoramaPlayListItem"
},
{
 "media": "this.panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B",
 "begin": "this.setMapLocation(this.PanoramaPlayListItem_84F48023_8B1C_39D4_41D9_45EF7B218560, this.MapViewerMapPlayer); this.setEndToItemIndex(this.mainPlayList, 3, 4)",
 "player": "this.MainViewerPanoramaPlayer",
 "id": "PanoramaPlayListItem_84F48023_8B1C_39D4_41D9_45EF7B218560",
 "camera": "this.panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_camera",
 "class": "PanoramaPlayListItem"
},
{
 "media": "this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75",
 "begin": "this.setMapLocation(this.PanoramaPlayListItem_84F41023_8B1C_39D4_41D4_0A1858DA0F74, this.MapViewerMapPlayer); this.setEndToItemIndex(this.mainPlayList, 4, 5)",
 "player": "this.MainViewerPanoramaPlayer",
 "id": "PanoramaPlayListItem_84F41023_8B1C_39D4_41D4_0A1858DA0F74",
 "camera": "this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_camera",
 "class": "PanoramaPlayListItem"
},
{
 "media": "this.panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971",
 "begin": "this.setMapLocation(this.PanoramaPlayListItem_9B0BE029_8B1C_39D4_41E1_001F1494104D, this.MapViewerMapPlayer); this.setEndToItemIndex(this.mainPlayList, 5, 6)",
 "player": "this.MainViewerPanoramaPlayer",
 "id": "PanoramaPlayListItem_9B0BE029_8B1C_39D4_41E1_001F1494104D",
 "camera": "this.panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_camera",
 "class": "PanoramaPlayListItem"
},
{
 "media": "this.panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B",
 "end": "this.trigger('tourEnded')",
 "begin": "this.setMapLocation(this.PanoramaPlayListItem_9B0B7029_8B1C_39D4_41B6_99E08213A2F5, this.MapViewerMapPlayer); this.setEndToItemIndex(this.mainPlayList, 6, 0)",
 "player": "this.MainViewerPanoramaPlayer",
 "id": "PanoramaPlayListItem_9B0B7029_8B1C_39D4_41B6_99E08213A2F5",
 "camera": "this.panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_camera",
 "class": "PanoramaPlayListItem"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01b"
 },
 "maps": [
  {
   "hfov": 13.01,
   "yaw": 92.87,
   "image": {
    "levels": [
     {
      "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0_HS_2_0_0_map.gif",
      "width": 28,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -42.64,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_A5D8C083_8AE1_D3C8_418F_C182F35850FD",
   "yaw": 92.87,
   "hfov": 13.01,
   "pitch": -42.64,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A36E7799_8AE7_5DF8_41A3_7C70A3253333",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_802004A0_8A1A_0DDE_41CD_39D980509897, this.camera_85AEB0B6_8B1C_3A3C_41CC_2C1FC0E67DE6); this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c"
 },
 "maps": [
  {
   "hfov": 9,
   "yaw": 17.88,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0_HS_2_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -34.35,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_B3A0D8C2_8A23_53AC_41DC_A933CE6104A3",
   "yaw": 17.88,
   "hfov": 9,
   "pitch": -34.35,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A37715AD_8A23_3DC5_41A9_1D6556DD107B",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75, this.camera_85E65121_8B1C_3BD4_41D6_1F0EA3315727); this.mainPlayList.set('selectedIndex', 4)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "enabledInCardboard": true,
 "data": {
  "label": "Circle Arrow 01c"
 },
 "maps": [
  {
   "hfov": 15.44,
   "yaw": -96.8,
   "image": {
    "levels": [
     {
      "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0_HS_3_0_0_map.gif",
      "width": 39,
      "height": 16,
      "class": "ImageResourceLevel"
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -54.7,
   "class": "HotspotPanoramaOverlayMap"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_B3A098C3_8A23_53AC_41A5_69C35E1AC75A",
   "yaw": -96.8,
   "hfov": 15.44,
   "pitch": -54.7,
   "class": "HotspotPanoramaOverlayImage",
   "distance": 100
  }
 ],
 "id": "overlay_A06C69BD_8A23_55CA_41A6_B28F6A077CB4",
 "rollOverDisplay": false,
 "areas": [
  {
   "click": "this.startPanoramaWithCamera(this.panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75, this.camera_85FC1130_8B1C_3A34_41B2_E22AD8C77EFF); this.mainPlayList.set('selectedIndex', 4); this.mainPlayList.set('selectedIndex', 6)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "class": "HotspotPanoramaOverlay"
},
{
 "gap": 15,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.Container_FDD61685_E553_9592_41C0_A2A83A363C32"
 ],
 "id": "Container_F59EA3FC_AC15_152A_41D3_A68AE3523ABE",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "vertical",
 "width": "100%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "borderColor": "#000000",
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 2,
 "height": "69.727%",
 "borderRadius": 50,
 "paddingLeft": 0,
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "verticalAlign": "middle",
 "data": {
  "name": "Floor Plan Container"
 },
 "minWidth": 1,
 "contentOpaque": true,
 "paddingTop": 0
},
{
 "gap": 10,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.Container_26D3DDC5_AC15_11AC_41E2_6BB5E3BD07D9"
 ],
 "id": "Container_8F88A174_B17F_DAF3_41E3_9385916D5A3E",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "vertical",
 "width": "100%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "19.78%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "verticalAlign": "middle",
 "data": {
  "name": "Middle"
 },
 "minWidth": 1,
 "contentOpaque": false,
 "paddingTop": 0
},
{
 "gap": 10,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.Container_8886944C_AC33_7318_41AB_EB089F4691B5"
 ],
 "id": "Container_8E56560D_B147_6613_41E3_B9F30B1AF2C2",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "vertical",
 "width": "100%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "5.25%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "verticalAlign": "middle",
 "data": {
  "name": "Bottom"
 },
 "minWidth": 1,
 "contentOpaque": false,
 "paddingTop": 0
},
{
 "horizontalAlign": "left",
 "id": "ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856",
 "left": "10%",
 "paddingBottom": 10,
 "itemMode": "normal",
 "right": "25%",
 "gap": 5,
 "itemLabelHorizontalAlign": "center",
 "scrollBarMargin": 2,
 "itemOpacity": 1,
 "class": "ThumbnailList",
 "itemLabelPosition": "bottom",
 "itemLabelFontFamily": "Arial",
 "itemLabelFontStyle": "normal",
 "itemVerticalAlign": "middle",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "itemThumbnailBorderRadius": 50,
 "itemBorderRadius": 0,
 "paddingLeft": 20,
 "itemPaddingLeft": 3,
 "itemThumbnailShadowOpacity": 0.54,
 "minHeight": 20,
 "playList": "this.ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856_playlist",
 "propagateClick": false,
 "itemThumbnailShadowVerticalLength": 3,
 "itemThumbnailOpacity": 1,
 "itemThumbnailShadowSpread": 1,
 "scrollBarOpacity": 0.5,
 "minWidth": 20,
 "itemPaddingRight": 3,
 "verticalAlign": "top",
 "itemPaddingTop": 3,
 "scrollBarColor": "#FFFFFF",
 "itemBackgroundColor": [],
 "itemBackgroundOpacity": 0,
 "selectedItemLabelFontColor": "#FFCC00",
 "itemLabelGap": 9,
 "rollOverItemBackgroundOpacity": 0,
 "scrollBarVisible": "rollOver",
 "rollOverItemLabelFontWeight": "normal",
 "itemBackgroundColorRatios": [],
 "shadow": false,
 "layout": "vertical",
 "itemLabelTextDecoration": "none",
 "selectedItemLabelFontSize": "0.72vw",
 "itemLabelFontWeight": "normal",
 "itemThumbnailShadowBlurRadius": 8,
 "itemThumbnailHeight": 60,
 "top": "12%",
 "paddingRight": 20,
 "borderSize": 0,
 "itemLabelFontSize": "0.84vw",
 "borderRadius": 5,
 "itemThumbnailShadow": true,
 "bottom": "10%",
 "selectedItemLabelFontWeight": "bold",
 "itemThumbnailScaleMode": "fit_outside",
 "itemLabelFontColor": "#FFFFFF",
 "itemBackgroundColorDirection": "vertical",
 "itemHorizontalAlign": "center",
 "itemThumbnailShadowHorizontalLength": 3,
 "data": {
  "name": "ThumbnailList35762"
 },
 "rollOverItemLabelFontSize": "0.78vw",
 "itemPaddingBottom": 3,
 "itemThumbnailShadowColor": "#000000",
 "paddingTop": 10
},
{
 "gap": 4,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.IconButton_A7975343_B17D_3EDA_41BF_8955CDC2EDAB",
  "this.IconButton_A7974343_B17D_3EDA_41D5_38B6E5F68E61",
  "this.IconButton_A797B343_B17D_3EDA_41CA_0171986F3D96"
 ],
 "id": "Container_A7977343_B17D_3EDA_41C0_F47328C07981",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "vertical",
 "width": "11.36%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "hidden",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "100%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 20,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "verticalAlign": "middle",
 "data": {
  "name": "Container27666"
 },
 "minWidth": 20,
 "contentOpaque": false,
 "paddingTop": 0
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0_HS_6_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B3BFE8C0_8A23_53AC_41D1_78E9D9717A8D",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_802004A0_8A1A_0DDE_41CD_39D980509897_0_HS_10_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_A179B7F4_8A21_DD5B_41C1_3AF0736FC21B",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0_HS_3_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_BE32874F_8A21_5EB4_41CD_C15BB922163F",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805A73F7_8A1A_0B21_41DA_355B7BF0FDF5_0_HS_4_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B3BEC8C0_8A23_53AC_41D9_0C31A4237B17",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0_HS_2_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B3A048C2_8A23_53AC_41A3_4E93A6B8C976",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805A9CD6_8A1A_7D62_41D8_A879A30DCA75_0_HS_3_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_A17FF7F5_8A21_DD45_41C2_8892C6571B24",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0_HS_2_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B54F95EC_8A20_DD7B_41C8_3E1FCF495D13",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805A3E4C_8A1A_1D67_41DE_CEF1D835985B_0_HS_3_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B54FE5EC_8A20_DD7B_41A0_D56DDB4D76E6",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805FE521_8A1A_0CDE_41B4_D12F5F7A735B_0_HS_1_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B3A308C3_8A23_53AC_41D2_A74DF83B35CB",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_8148C872_8A1A_0523_41DF_8658E34FCA66_0_HS_2_0.png",
   "width": 1080,
   "height": 900,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_A5D8C083_8AE1_D3C8_418F_C182F35850FD",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0_HS_2_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B3A0D8C2_8A23_53AC_41DC_A933CE6104A3",
 "class": "AnimatedImageResource"
},
{
 "rowCount": 6,
 "frameDuration": 41,
 "levels": [
  {
   "url": "media/panorama_805FA71C_8A1A_0CE0_41D4_0BB9F3887971_0_HS_3_0.png",
   "width": 1080,
   "height": 660,
   "class": "ImageResourceLevel"
  }
 ],
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B3A098C3_8A23_53AC_41A5_69C35E1AC75A",
 "class": "AnimatedImageResource"
},
{
 "gap": 15,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990",
  "this.MapViewer"
 ],
 "id": "Container_FDD61685_E553_9592_41C0_A2A83A363C32",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "vertical",
 "width": "100%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "borderColor": "#000000",
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 2,
 "height": "80%",
 "borderRadius": 50,
 "paddingLeft": 0,
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "verticalAlign": "middle",
 "creationPolicy": "inAdvance",
 "data": {
  "name": "Floor Plan Con 01"
 },
 "minWidth": 1,
 "contentOpaque": true,
 "paddingTop": 0,
 "visible": false
},
{
 "gap": 3,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.IconButton_217F3EB5_ACF5_33E4_41E2_608DADB8CC7E",
  "this.Container_23BF7E02_AC1D_72AA_41DA_22E1695AF185"
 ],
 "id": "Container_26D3DDC5_AC15_11AC_41E2_6BB5E3BD07D9",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "horizontal",
 "width": "100%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "100%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "verticalAlign": "middle",
 "creationPolicy": "inAdvance",
 "data": {
  "name": "Contact Us Compo"
 },
 "minWidth": 1,
 "contentOpaque": false,
 "paddingTop": 0,
 "visible": false
},
{
 "gap": 5,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.IconButton_91D696C6_B1C5_2631_41D0_5016C4C73829",
  "this.Button_B5551DB1_A8AE_1192_41E0_9815EC3E8FD9",
  "this.Button_BAFF9AB7_AC6D_3778_41DD_EF9D1C21D15E"
 ],
 "id": "Container_8886944C_AC33_7318_41AB_EB089F4691B5",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "horizontal",
 "width": "100%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "100%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0,
 "scrollBarColor": "#000000",
 "verticalAlign": "middle",
 "data": {
  "name": "Button CU and FP"
 },
 "minWidth": 1,
 "contentOpaque": false,
 "paddingTop": 0
},
{
 "textDecoration": "none",
 "fontFamily": "Arial",
 "popUpShadowColor": "#000000",
 "backgroundColorDirection": "vertical",
 "id": "DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990",
 "rollOverPopUpFontColor": "#FFFFFF",
 "paddingBottom": 0,
 "shadow": false,
 "fontColor": "#FFFFFF",
 "gap": 0,
 "pressedRollOverBackgroundColorRatios": [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "selectedPopUpBackgroundColor": "#003366",
 "popUpBackgroundColor": "#FFFFFF",
 "width": "100%",
 "popUpGap": 0,
 "pressedRollOverBackgroundColor": [
  "#003366",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#003366"
 ],
 "class": "DropDown",
 "popUpBackgroundOpacity": 0.2,
 "borderColor": "#FFFFFF",
 "backgroundOpacity": 0.2,
 "popUpShadow": false,
 "paddingRight": 15,
 "borderSize": 2,
 "backgroundColor": [
  "#000000"
 ],
 "popUpFontColor": "#000000",
 "borderRadius": 4,
 "paddingLeft": 15,
 "height": "8%",
 "rollOverPopUpBackgroundColor": "#003366",
 "fontSize": "1vw",
 "arrowColor": "#FFFFFF",
 "minHeight": 20,
 "backgroundColorRatios": [
  0
 ],
 "selectedPopUpFontColor": "#FFFFFF",
 "popUpShadowBlurRadius": 6,
 "popUpShadowSpread": 1,
 "propagateClick": false,
 "fontStyle": "normal",
 "minWidth": 200,
 "playList": "this.DropDown_EAAD8681_E54D_95D1_41D7_9D484A259990_playlist",
 "popUpShadowOpacity": 0,
 "pressedBackgroundColorRatios": [
  0
 ],
 "arrowBeforeLabel": false,
 "popUpBorderRadius": 0,
 "data": {
  "name": "DropDown1204"
 },
 "fontWeight": "bold",
 "rollOverBackgroundColor": [
  "#003366"
 ],
 "pressedBackgroundColor": [
  "#003366"
 ],
 "paddingTop": 0
},
{
 "horizontalAlign": "center",
 "id": "IconButton_217F3EB5_ACF5_33E4_41E2_608DADB8CC7E",
 "paddingBottom": 0,
 "shadow": false,
 "width": "81.529%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_217F3EB5_ACF5_33E4_41E2_608DADB8CC7E_pressed.png",
 "maxWidth": 900,
 "maxHeight": 616,
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_217F3EB5_ACF5_33E4_41E2_608DADB8CC7E_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "100%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 1,
 "propagateClick": false,
 "click": "if(!this.Container_26D3DDC5_AC15_11AC_41E2_6BB5E3BD07D9.get('visible')){ this.setComponentVisibility(this.Container_26D3DDC5_AC15_11AC_41E2_6BB5E3BD07D9, true, 0, null, null, false) } else { this.setComponentVisibility(this.Container_26D3DDC5_AC15_11AC_41E2_6BB5E3BD07D9, false, 0, null, null, false) }",
 "iconURL": "skin/IconButton_217F3EB5_ACF5_33E4_41E2_608DADB8CC7E.png",
 "minWidth": 1,
 "verticalAlign": "middle",
 "data": {
  "name": "Contact"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "gap": 12,
 "horizontalAlign": "center",
 "scrollBarVisible": "rollOver",
 "children": [
  "this.IconButton_D5B1805E_AC13_0F42_41D2_CC3FD0439B48",
  "this.IconButton_D64C3B69_AC13_714E_41C2_32E6C6ABE2F2",
  "this.IconButton_DEE538D8_AC15_3F47_41B7_DF462598A300"
 ],
 "id": "Container_23BF7E02_AC1D_72AA_41DA_22E1695AF185",
 "paddingBottom": 0,
 "shadow": false,
 "layout": "vertical",
 "width": "20%",
 "scrollBarMargin": 2,
 "class": "Container",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "100%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "propagateClick": false,
 "scrollBarOpacity": 0.5,
 "scrollBarColor": "#000000",
 "verticalAlign": "middle",
 "data": {
  "name": "Left Contact Us"
 },
 "minWidth": 1,
 "contentOpaque": false,
 "paddingTop": 0
},
{
 "horizontalAlign": "center",
 "id": "IconButton_91D696C6_B1C5_2631_41D0_5016C4C73829",
 "paddingBottom": 0,
 "shadow": false,
 "width": "13%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_91D696C6_B1C5_2631_41D0_5016C4C73829_pressed.png",
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_91D696C6_B1C5_2631_41D0_5016C4C73829_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "height": "100%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 0,
 "pressedRollOverIconURL": "skin/IconButton_91D696C6_B1C5_2631_41D0_5016C4C73829_pressed_rollover.png",
 "propagateClick": false,
 "click": "if(!this.ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856.get('visible')){ this.setComponentVisibility(this.ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856, true, 0, null, null, false) } else { this.setComponentVisibility(this.ThumbnailList_B7480756_AD90_6B13_41A9_86B89E4AD856, false, 0, null, null, false) }",
 "transparencyActive": false,
 "iconURL": "skin/IconButton_91D696C6_B1C5_2631_41D0_5016C4C73829.png",
 "minWidth": 0,
 "verticalAlign": "middle",
 "data": {
  "name": "Button27669"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "textDecoration": "none",
 "fontColor": "#FFFFFF",
 "horizontalAlign": "center",
 "iconBeforeLabel": true,
 "backgroundColorDirection": "vertical",
 "id": "Button_B5551DB1_A8AE_1192_41E0_9815EC3E8FD9",
 "paddingBottom": 0,
 "shadow": false,
 "shadowColor": "#000000",
 "fontFamily": "Montserrat",
 "pressedRollOverBackgroundColorRatios": [
  0
 ],
 "rollOverBackgroundColorRatios": [
  0
 ],
 "shadowSpread": 1,
 "layout": "horizontal",
 "iconWidth": 0,
 "gap": 15,
 "pressedRollOverBackgroundColor": [
  "#003366"
 ],
 "class": "Button",
 "pressedFontSize": "1vw",
 "borderColor": "#FFFFFF",
 "backgroundOpacity": 0.15,
 "width": "44.1%",
 "pressedBackgroundOpacity": 1,
 "paddingRight": 0,
 "borderSize": 2,
 "backgroundColor": [
  "#000000"
 ],
 "borderRadius": 5,
 "paddingLeft": 0,
 "fontSize": "1vw",
 "iconHeight": 0,
 "mode": "push",
 "minHeight": 1,
 "height": "85.65%",
 "backgroundColorRatios": [
  0
 ],
 "pressedBackgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "label": "CONTACT US",
 "fontStyle": "normal",
 "shadowBlurRadius": 15,
 "click": "if(!this.Container_26D3DDC5_AC15_11AC_41E2_6BB5E3BD07D9.get('visible')){ this.setComponentVisibility(this.Container_26D3DDC5_AC15_11AC_41E2_6BB5E3BD07D9, true, 0, this.effect_2745EDF7_ACED_1161_41CE_8D7449621D35, 'showEffect', false) } else { this.setComponentVisibility(this.Container_26D3DDC5_AC15_11AC_41E2_6BB5E3BD07D9, false, 0, this.effect_2745FDF7_ACED_1161_41D1_B5EC4D857875, 'hideEffect', false) }",
 "minWidth": 1,
 "verticalAlign": "middle",
 "rollOverBackgroundOpacity": 0.8,
 "rollOverShadow": false,
 "data": {
  "name": "Button Contact Info info"
 },
 "fontWeight": "bold",
 "rollOverBackgroundColor": [
  "#003366"
 ],
 "cursor": "hand",
 "pressedBackgroundColor": [
  "#003366"
 ],
 "paddingTop": 0
},
{
 "textDecoration": "none",
 "fontColor": "#FFFFFF",
 "horizontalAlign": "center",
 "iconBeforeLabel": true,
 "backgroundColorDirection": "vertical",
 "id": "Button_BAFF9AB7_AC6D_3778_41DD_EF9D1C21D15E",
 "paddingBottom": 0,
 "shadow": false,
 "shadowColor": "#000000",
 "fontFamily": "Montserrat",
 "width": "44.1%",
 "rollOverBackgroundColorRatios": [
  0
 ],
 "shadowSpread": 1,
 "layout": "horizontal",
 "iconWidth": 0,
 "gap": 5,
 "class": "Button",
 "borderColor": "#FFFFFF",
 "backgroundOpacity": 0.15,
 "pressedBackgroundOpacity": 1,
 "paddingRight": 0,
 "borderSize": 2,
 "backgroundColor": [
  "#000000"
 ],
 "borderRadius": 5,
 "paddingLeft": 0,
 "fontSize": "1vw",
 "iconHeight": 0,
 "mode": "push",
 "minHeight": 1,
 "pressedRollOverFontSize": "1vw",
 "backgroundColorRatios": [
  0
 ],
 "pressedBackgroundColorRatios": [
  0
 ],
 "height": "85.65%",
 "propagateClick": false,
 "label": "FLOOR PLAN",
 "fontStyle": "normal",
 "shadowBlurRadius": 15,
 "click": "if(!this.Container_FDD61685_E553_9592_41C0_A2A83A363C32.get('visible')){ this.setComponentVisibility(this.Container_FDD61685_E553_9592_41C0_A2A83A363C32, true, 0, this.effect_F2103674_E554_F572_41B1_203ED4CE50E6, 'showEffect', false) } else { this.setComponentVisibility(this.Container_FDD61685_E553_9592_41C0_A2A83A363C32, false, 0, this.effect_F210C674_E554_F572_41E1_4BD5DFC260E8, 'hideEffect', false) }",
 "minWidth": 1,
 "verticalAlign": "middle",
 "rollOverBackgroundOpacity": 0.8,
 "rollOverShadow": false,
 "data": {
  "name": "Button Floor Plan"
 },
 "fontWeight": "bold",
 "rollOverBackgroundColor": [
  "#003366"
 ],
 "cursor": "hand",
 "pressedBackgroundColor": [
  "#003366"
 ],
 "paddingTop": 0
},
{
 "horizontalAlign": "center",
 "id": "IconButton_D5B1805E_AC13_0F42_41D2_CC3FD0439B48",
 "paddingBottom": 0,
 "shadow": false,
 "width": "100%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_D5B1805E_AC13_0F42_41D2_CC3FD0439B48_pressed.png",
 "maxWidth": 50,
 "maxHeight": 50,
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_D5B1805E_AC13_0F42_41D2_CC3FD0439B48_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "25%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 1,
 "pressedRollOverIconURL": "skin/IconButton_D5B1805E_AC13_0F42_41D2_CC3FD0439B48_pressed_rollover.png",
 "propagateClick": false,
 "click": "this.openLink('https://www.pinterest.com/dany_rith/_created/', '_blank')",
 "iconURL": "skin/IconButton_D5B1805E_AC13_0F42_41D2_CC3FD0439B48.png",
 "minWidth": 1,
 "verticalAlign": "middle",
 "data": {
  "name": "Website"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_D64C3B69_AC13_714E_41C2_32E6C6ABE2F2",
 "paddingBottom": 0,
 "shadow": false,
 "width": "100%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_D64C3B69_AC13_714E_41C2_32E6C6ABE2F2_pressed.png",
 "maxWidth": 50,
 "maxHeight": 50,
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_D64C3B69_AC13_714E_41C2_32E6C6ABE2F2_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "25%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 1,
 "propagateClick": false,
 "iconURL": "skin/IconButton_D64C3B69_AC13_714E_41C2_32E6C6ABE2F2.png",
 "minWidth": 1,
 "verticalAlign": "middle",
 "data": {
  "name": "Map"
 },
 "paddingTop": 0,
 "cursor": "hand"
},
{
 "horizontalAlign": "center",
 "id": "IconButton_DEE538D8_AC15_3F47_41B7_DF462598A300",
 "paddingBottom": 0,
 "shadow": false,
 "width": "100%",
 "class": "IconButton",
 "pressedIconURL": "skin/IconButton_DEE538D8_AC15_3F47_41B7_DF462598A300_pressed.png",
 "maxWidth": 50,
 "maxHeight": 50,
 "backgroundOpacity": 0,
 "rollOverIconURL": "skin/IconButton_DEE538D8_AC15_3F47_41B7_DF462598A300_rollover.png",
 "paddingRight": 0,
 "borderSize": 0,
 "transparencyActive": false,
 "height": "25%",
 "borderRadius": 0,
 "paddingLeft": 0,
 "mode": "push",
 "minHeight": 1,
 "propagateClick": false,
 "click": "this.openLink('https://www.linkedin.com/in/dany-rith-06549017a/', '_blank')",
 "iconURL": "skin/IconButton_DEE538D8_AC15_3F47_41B7_DF462598A300.png",
 "minWidth": 1,
 "verticalAlign": "middle",
 "data": {
  "name": "Linkin"
 },
 "paddingTop": 0,
 "cursor": "hand"
}],
 "minHeight": 20,
 "mobileMipmappingEnabled": false,
 "propagateClick": false,
 "desktopMipmappingEnabled": false,
 "vrPolyfillScale": 0.5,
 "scrollBarOpacity": 0.5,
 "minWidth": 20,
 "verticalAlign": "top",
 "data": {
  "name": "Player3105"
 },
 "scrollBarColor": "#000000",
 "contentOpaque": false,
 "backgroundPreloadEnabled": true,
 "buttonToggleFullscreen": "this.IconButton_BD225E9E_B273_D96C_41A9_C0F962709F6A",
 "paddingTop": 0
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
