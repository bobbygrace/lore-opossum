// Generated by CoffeeScript 1.8.0
(function() {
  var LoremModel, LoremView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ZeroClipboard.config({
    swfPath: "bower_components/zeroclipboard/dist/ZeroClipboard.swf"
  });

  window.terms = {
    "Trello": ["card", "board", "at a glance", "Trello", "Taco", "lists", "list of lists", "checklists", "Chorizo", "Pete", "Trello Gold", "Business Class", "visual", "free", "attachment", "drag and drop", "members", "organization"],
    "Hodor": ["hodor", "hodor", "hodor", "hodor", "hodor", "hodor", "HODOR", "Hodor"],
    "Escape": ["<p>", "<B>YESIR</B>", "<script>alert('good times')</script>", "</p>", "</html>", "Hey", "<img src='/' width='500' height='300'>"]
  };

  window.templates = {
    "ipsumText": "{{#paragraphs}}<p>{{.}}</p><br>{{/paragraphs}}",
    "ipsumJSON": "{{json}}",
    "optionType": "<li><a href='#' data-type='{{term}}'>{{term}}</a></li>"
  };

  LoremModel = (function(_super) {
    __extends(LoremModel, _super);

    function LoremModel() {
      return LoremModel.__super__.constructor.apply(this, arguments);
    }

    LoremModel.prototype.defaults = function() {
      var ls, _ref, _ref1, _ref2;
      ls = JSON.parse(localStorage.getItem('settings'));
      return {
        type: (_ref = ls != null ? ls["type"] : void 0) != null ? _ref : "Trello",
        paragraphs: (_ref1 = ls != null ? ls["paragraphs"] : void 0) != null ? _ref1 : 3,
        format: (_ref2 = ls != null ? ls["format"] : void 0) != null ? _ref2 : "text"
      };
    };

    LoremModel.prototype.set = function() {
      LoremModel.__super__.set.apply(this, arguments);
      return localStorage.setItem("settings", JSON.stringify(this.attributes));
    };

    LoremModel.prototype.setType = function(value) {
      return this.set({
        type: value
      });
    };

    LoremModel.prototype.setParagraphs = function(value) {
      return this.set({
        paragraphs: value
      });
    };

    LoremModel.prototype.setFormat = function(value) {
      return this.set({
        format: value
      });
    };

    return LoremModel;

  })(Backbone.Model);

  LoremView = (function(_super) {
    __extends(LoremView, _super);

    function LoremView() {
      return LoremView.__super__.constructor.apply(this, arguments);
    }

    LoremView.prototype.initialize = function() {
      this.listenTo(this.model, "change", this.renderIpsum);
      return this.render();
    };

    LoremView.prototype.events = {
      "click .js-select-type a": "selectType",
      "click .js-select-paragraphs a": "selectNumParagraphs",
      "click .js-select-format a": "selectFormat",
      "click .js-copy-to-clipbard": "copyToClipboard"
    };

    LoremView.prototype.render = function() {
      this.setElement($(".js-app"));
      this.renderTypes();
      this.renderNumParagraphs();
      this.renderFormat();
      this.renderIpsum();
      this.clipboardClient = new ZeroClipboard(this.$(".js-copy-to-clipboard"));
      this.clipboardClient.on("error", (function(_this) {
        return function(e) {
          return _this.$(".js-copy-to-clipboard").addClass("hidden");
        };
      })(this));
      this.clipboardClient.on("ready", (function(_this) {
        return function(e) {
          return _this.$(".js-copy-to-clipboard").removeClass("hidden");
        };
      })(this));
      this.clipboardClient.on("aftercopy", (function(_this) {
        return function(e) {
          var originalText;
          originalText = _this.$(".js-copy-to-clipboard")[0].innerText;
          _this.$(".js-copy-to-clipboard")[0].innerText = "Copied!";
          return setTimeout(function() {
            return _this.$(".js-copy-to-clipboard")[0].innerText = originalText;
          }, 1000);
        };
      })(this));
      return this;
    };

    LoremView.prototype.renderTypes = function() {
      var $types, template, term;
      $types = $(".js-list-types");
      template = templates.optionType;
      $types.html((function() {
        var _results;
        _results = [];
        for (term in terms) {
          _results.push(Mustache.render(template, {
            term: term
          }));
        }
        return _results;
      })());
      return this;
    };

    LoremView.prototype.renderNumParagraphs = function() {
      return this;
    };

    LoremView.prototype.renderFormat = function() {
      return this;
    };

    LoremView.prototype.renderIpsum = function() {
      var $ipsum, format, json, numParagraphs, p, paragraphs, string;
      $ipsum = $(".js-render-ipsum");
      format = this.model.get("format");
      numParagraphs = this.model.get("paragraphs");
      switch (format) {
        case "html":
          paragraphs = (function() {
            var _i, _results;
            _results = [];
            for (p = _i = 1; 1 <= numParagraphs ? _i <= numParagraphs : _i >= numParagraphs; p = 1 <= numParagraphs ? ++_i : --_i) {
              _results.push("<p>" + (this.generateParagraph()) + "</p>");
            }
            return _results;
          }).call(this);
          $ipsum.html(Mustache.render(templates.ipsumText, {
            paragraphs: paragraphs
          }));
          break;
        case "json":
          paragraphs = (function() {
            var _i, _results;
            _results = [];
            for (p = _i = 1; 1 <= numParagraphs ? _i <= numParagraphs : _i >= numParagraphs; p = 1 <= numParagraphs ? ++_i : --_i) {
              _results.push("\"" + (this.generateParagraph()) + "\"");
            }
            return _results;
          }).call(this);
          string = paragraphs.join(",");
          json = "[" + string + "]";
          $ipsum.html(Mustache.render(templates.ipsumJSON, {
            json: json
          }));
          break;
        default:
          paragraphs = (function() {
            var _i, _results;
            _results = [];
            for (p = _i = 1; 1 <= numParagraphs ? _i <= numParagraphs : _i >= numParagraphs; p = 1 <= numParagraphs ? ++_i : --_i) {
              _results.push(this.generateParagraph());
            }
            return _results;
          }).call(this);
          $ipsum.html(Mustache.render(templates.ipsumText, {
            paragraphs: paragraphs
          }));
      }
      return this;
    };

    LoremView.prototype.generateSentence = function() {
      var length, lengthRange, rawSentence, sentence, type, wordArray;
      lengthRange = [6, 7, 8, 9, 10];
      length = _.sample(lengthRange);
      type = this.model.get("type");
      wordArray = _.sample(terms[type], length);
      rawSentence = wordArray.join(" ");
      return sentence = rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1) + ".";
    };

    LoremView.prototype.generateParagraph = function() {
      var length, lengthRange, paragraph, s;
      lengthRange = [4, 5, 6, 7, 8, 9, 10];
      length = _.sample(lengthRange);
      return paragraph = ((function() {
        var _i, _results;
        _results = [];
        for (s = _i = 0; 0 <= length ? _i <= length : _i >= length; s = 0 <= length ? ++_i : --_i) {
          _results.push(this.generateSentence());
        }
        return _results;
      }).call(this)).join(" ");
    };

    LoremView.prototype.selectType = function(e) {
      var value;
      e.preventDefault();
      value = $(e.target).attr("data-type");
      this.model.setType(value);
      return false;
    };

    LoremView.prototype.selectNumParagraphs = function(e) {
      var value;
      e.preventDefault();
      value = $(e.target).attr("data-paragraphs");
      this.model.setParagraphs(value);
      return false;
    };

    LoremView.prototype.selectFormat = function(e) {
      var value;
      e.preventDefault();
      value = $(e.target).attr("data-format");
      this.model.setFormat(value);
      return false;
    };

    return LoremView;

  })(Backbone.View);

  new LoremView({
    model: new LoremModel
  });

}).call(this);
