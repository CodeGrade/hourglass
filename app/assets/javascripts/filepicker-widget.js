$.widget("hg.filePicker", {
    options: {
        // vertical: true,
        // editable: false
    },
    _create: function () {
        this.activateTreeView();
        this.element.find(".file-pane").removeClass("active");
    },

    activateTreeView: function() {
        var thiz = this;
        this.element.find(".files").treeview({
            expandIcon: 'glyphicon glyphicon-chevron-down', // deliberately the same
            collapseIcon: 'glyphicon glyphicon-chevron-down', // always expanded
            enableLinks: true,
            onNodeSelected: function(e, data) {
                e.preventDefault();
                e.stopPropagation();
                if (data.href !== undefined && data.href !== "#") {
                    let id = "#" + thiz.options.root + "_" + data.href;
                    thiz.element.find(".file-pane").removeClass("active");
                    let foundPane = thiz.element.find(id);
                    foundPane.addClass("active");
                    // make sure any comments are visible
                    foundPane.find(".CodeMirror").each(function (i, e) {
                        e.CodeMirror.refresh();
                    });
                }
            },
            data: thiz.options.dirs
        });
        var filesTreeview = this.element.find(".files").treeview(true);
        filesTreeview.expandAll({ silent: true });
    }
});