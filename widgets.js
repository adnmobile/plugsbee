var Widget = {
  parser : new DOMParser(),
  parse: function(aStr) {
    return this.parser.parseFromString(aStr, "application/xhtml+xml").documentElement;
  }
};
