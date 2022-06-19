function parseData(str) {
  if (typeof str == 'string') {
    if (str == 'true') return true;
    if (str == 'false') return false;
    let num = Number(str);
    if (!isNaN(num)) str = num;
    if (typeof str == 'string' && str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1).replaceAll('\\"', '"').replaceAll('\\\\', '\\');
    }
  }
  return str;
}

function parser() {
  if (str.at(i) == '[') {
    let array = [];

    while (str.at(++i) != ']') {
      if (str.at(i) == '[' || str.at(i) == '{') array.push(parser());

      let value = '';
      while (str.at(i) != ',' && str.at(i) != ']') {
        value += str.at(i++);
      }

      if (value) array.push(parseData(value));

      if (str.at(i) == ']') break;
    }

    i += 1;
    return array;
  }

  let object = {};

  while (str.at(++i) != '}') {
    let param = '';
    while (str.at(i) != ':') {
      param += str.at(i++);
    }

    ++i;
    let value = '';
    if (str.at(i) == '[' || str.at(i) == '{') value = parser();
    while (str.at(i) && str.at(i) != ',' && str.at(i) != '}') {
      value += str.at(i++);
    }

    object[parseData(param)] = parseData(value);

    if (str.at(i) == '}') break;
  }

  ++i;
  return object;
}

var i = 0;
var str = '';

module.exports = function (s) {
  i = 0;
  str = s;
  return parser();
};
