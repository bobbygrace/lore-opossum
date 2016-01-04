# Google Analytics event tracking

module.exports = (category, action, label, value) ->
  window.ga? 'send', 'event', category, action, label, value
