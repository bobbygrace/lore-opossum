$ = require 'jquery'
_ = require 'underscore'

isVisibleInput = (elem) ->
  elem = $(elem)
  return !!(elem.width() || elem.height()) && elem.css("display") != "none"

class LoremClipboard
  constructor: ->
    @value = ""

    $(document).keydown (e) =>

      # Only do this if there's something to be put on the clipboard, and it
      # looks like they're starting a copy shortcut
      if !@value || !(e.ctrlKey || e.metaKey)
        return

      # dum copy pasta non-DRY way to do AppView::flashCopiedState
      if e.keyCode == 67
        $copyBtn = $(".js-copy-to-clipboard")
        originalHtml = $copyBtn.html()
        $copyBtn
        .text "Copied!"
        .addClass("is-focus")
        setTimeout =>
          $copyBtn
          .html originalHtml
          .removeClass("is-focus")
        , 2000

      elem = $(e.target)
      if elem.is("input,textarea")
        if isVisibleInput(elem)
          return

      # Abort if it looks like they've selected some text (maybe they're trying
      # to copy out a bit of the description or something)
      if window.getSelection?()?.toString()
        return

      if document.selection?.createRange().text
        return

      _.defer =>
        $clipboardContainer = $(".js-lorem-clipboard")
        $clipboardContainer.empty().show()
        @$clipboardInput = $("<textarea class='lorem-clipboard-input js-lorem-clipboard-input'></textarea>")
        .val(@value)
        .appendTo($clipboardContainer)
        .focus()
        # no select() in zepto. ¯\_(ツ)_/¯
        @$clipboardInput[0].select()


    $(document).keyup (e) ->

      if $(e.target).is(".js-lorem-clipboard-input")
        $(".js-lorem-clipboard").empty().hide()

  set: (@value) ->

module.exports = LoremClipboard
