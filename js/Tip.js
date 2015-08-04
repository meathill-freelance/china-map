/**
 * Created by meathill on 15/8/4.
 */

function Tip() {
  this.$el = $('<div class="meat-map-tip"></div>');
}

Tip.prototype = {
  remove: function () {
    this.$el.remove();
  },
  setContent: function (content) {
    this.$el.html(content);
    return this;
  },
  setPosition: function (event) {
    this.$el.css({
      left: event.clientX - this.$el.outerWidth() / 2,
      top: event.clientY - this.$el.outerHeight() - 5
    });
    return this;
  },
  show: function (event) {
    this.$el.appendTo('body');
    return this.setPosition(event);
  }
};