function parseData(str) {
  if (typeof str == 'string') {
    if (str == 'true') return true;
    if (str == 'false') return false;
    let num = Number(str);
    if (!isNaN(num)) return num;
  }
  return str;
}

function stringHandler() {
  const strChar = str.at(i);
  if (strChar === '"' || strChar === "'") {
    let string = '';
    while (str.at(++i) != strChar) {
      if (str.at(i) == '\\') i++;
      string += str.at(i);
    }
    i++;
    return string;
  }
  return '';
}

function parser() {
  if (str.at(i) == '[') {
    let array = [];

    while (str.at(++i) != ']') {
      if (str.at(i) == '[' || str.at(i) == '{') array.push(parser());

      let value = stringHandler();
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
    let param = stringHandler();
    while (str.at(i) != ':') {
      param += str.at(i++);
    }

    ++i;
    let value: any = stringHandler();
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

export default function (s: string) {
  i = 0;
  str = s;
  return parser();
}
