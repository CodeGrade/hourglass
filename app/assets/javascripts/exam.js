function extractMarks(text) {
    var lines = text.split(/\r\n?|\n/);
    if (/^\s*$/.test(lines[0])) { lines.shift(); }
    if (/^\s*$/.test(lines[lines.length - 1])) { lines.pop(); }
    var marks = {byLine: [], byNum: Object.create(null)};
    var count = 0;
    for (var lineNo = 0; lineNo < lines.length; lineNo++) {
        marks.byLine[lineNo] = [];
        var idx = undefined;
        while ((idx = lines[lineNo].search(/~ro:\d+:[se]~/)) >= 0) {
            var m = lines[lineNo].match(/~ro:(\d+):([se])~/);
            lines[lineNo] = lines[lineNo].replace(m[0], "");
            if (m[2] === "s") {
                count++;
                marks.byNum[m[1]] = {startLine: lineNo, startCol: idx, number: m[1],
                    lockBefore: (lineNo == 0 && idx == 0)};
                if (marks.byLine[lineNo][idx] === undefined)
                    marks.byLine[lineNo][idx] = {open: [], close: []};
                marks.byLine[lineNo][idx].open.push(marks.byNum[m[1]]);
            }
            else if (marks.byNum[m[1]] !== undefined) {
                marks.byNum[m[1]].endLine = lineNo;
                marks.byNum[m[1]].endCol = idx;
                marks.byNum[m[1]].lockAfter = (lineNo == lines.length - 1) && (idx == lines[lineNo].length);
                if (marks.byLine[lineNo][idx] === undefined)
                    marks.byLine[lineNo][idx] = {open: [], close: []};
                marks.byLine[lineNo][idx].close.unshift(marks.byNum[m[1]]);
            } else {
                console.error("No information found for mark [" + m.join(", ") + "]")
            }
        }
    }
    return {count: count, lines: lines, text: lines.join("\n"), marks: marks};
}

function applyMarks(cm, allMarks) {
    var curCol = 0;
    var curLine = 0;
    var openMarks = " ";
    allMarks.byLine.forEach(function(lineMarks) {
        lineMarks.forEach(function(colMarks) {
            colMarks.open.forEach(function(mark) {
                cm.markText({line: mark.startLine, ch: mark.startCol},
                    {line: mark.endLine, ch: mark.endCol},
                    {inclusiveLeft: mark.lockBefore, inclusiveRight: mark.lockAfter,
                        readOnly: true, className: "readOnly"});
            });
        });
    });
}

function activateCode(index, code) {
    if ($(code).data("lang")) {
        const readOnly = $(code).data("readonly");
        var cm = CodeMirror.fromTextArea(code, {
            readOnly: readOnly, indentUnit: 2,
            mode: $(code).data("lang"),
            viewportMargin: Infinity,
            lineNumbers: true, lineWrapping: false,
            styleActiveLine: true,
            extraKeys: CodeMirror.normalizeKeyMap({
                'Enter': "newlineAndIndent",
                'Tab': "indentAuto"
            })
        });
        const text = $(code).text();
        var markedText = extractMarks(text);
        cm.setValue(markedText.text);
        if (markedText.count > 0 && !readOnly) applyMarks(cm, markedText.marks);
        for (var i = 0; i < markedText.lines.length; i++)
            cm.indentLine(i, "smart", true);
        cm.setCursor(0, 0);
        cm.clearHistory();
    }
    $(code).addClass("cm-s-mdn-like cm-s-default");
}
function displayCode(index, code) {
  if ($(code).data("lang")) {
    var markedText = extractMarks($(code).text());
    CodeMirror.runMode(markedText.text, $(code).data("lang"), code);
    if (markedText.count > 0) applyMarks(code, markedText.marks);
    $(code).addClass("cm-s-default");
  }
}
