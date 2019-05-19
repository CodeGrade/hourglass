function initCodeMirror(element) {
    const editor = CodeMirror.fromTextArea(element, {
        lineNumbers : true,
        mode: 'text/x-java',
        lineWrapping: true,
    });
    if (element.hasAttribute("file")) {
        codeMirrorLoad(editor, element.getAttribute("file"));
    }
}

function codeMirrorLoad(editor, file) {
    fetch(file).then(res => {
        res.text().then((str) => {
            editor.setValue(str);
        });
    });
}

$(document).ready(function(){
    const code = $(".codemirror-textarea").toArray();
    code.forEach(initCodeMirror);
});
