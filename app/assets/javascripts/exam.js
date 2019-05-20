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

$(window).on('load', function(){
    console.log("window loaded");
    const code = $(".codemirror-textarea").toArray();
    code.forEach(initCodeMirror);
});
