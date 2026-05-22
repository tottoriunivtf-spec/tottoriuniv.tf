const text = `/*O_o*/
google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"112453241","table":{"cols":[{"id":"A","label":"","type":"string"},{"id":"B","label":"","type":"string"},{"id":"C","label":"","type":"string"},{"id":"D","label":"","type":"string"}],"rows":[{"c":[{"v":"種目"},{"v":"記録"},{"v":"氏名"},{"v":"樹立年"}]},{"c":[{"v":"800m"},{"v":"1'54\\"84"},{"v":"小林優真"},{"v":"2025年"}]}],"parsedNumHeaders":0}});`;
const jsonString = text.substring(text.indexOf("(") + 1, text.lastIndexOf(")"));
console.log(JSON.parse(jsonString));
