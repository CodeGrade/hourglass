function initCodeMirror(element) {
    const editor = CodeMirror.fromTextArea(element, {
        lineNumbers : true
    });
}

$(document).ready(function(){
    console.log("ready!");
    const code = $(".codemirror-textarea").toArray();
    console.log(code);
    code.forEach(initCodeMirror);
});
