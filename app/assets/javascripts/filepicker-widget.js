$.widget("hg.filePicker", {
    options: {
        // vertical: true,
        // editable: false
    },
    _create: function () {
        this.element.find(".file-pane").removeClass("active");
        var thiz = this;
        var files = this.element.find(".files");
        files.treeview({
            // TODO glyphicons -> octicons
            expandIcon: 'glyphicon glyphicon-chevron-down', // deliberately the same
            collapseIcon: 'glyphicon glyphicon-chevron-down', // always expanded
            enableLinks: true,
            onNodeSelected: function (e, data) {
                e.preventDefault();
                e.stopPropagation();
                if (data.href !== undefined && data.href !== "#") {
                    thiz.activeHref = data.href;
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
        this.treeView = files.treeview(true);
        this.treeView.expandAll({silent: true});
        this.element.find(".file-pane").first().addClass("active");

        this._delay(function() {
            thiz.fileMap = {};
            thiz.treeView.findNodes('', 'href').forEach(function(n, i) {
                thiz.fileMap[n.href] = n;
                thiz.fileMap[i] = n;
                if (n.state.selected) {
                    thiz.activeHref = n.href;
                }
            });
        }, 500);
    },

    activateByHref: function(href) {
        if (this.fileMap[href]) {
            this.treeView.selectNode(this.fileMap[href]);
        }
    },

    activateByIndex: function(index) {
        if (this.fileMap[index]) {
            this.treeView.selectNode(this.fileMap[index]);
        }
    },

    getSelectedHref: function() {
        return this.activeHref;
    },

    refresh: function() {
        this.element.find(".CodeMirror").each(function(index, cm) {
            cm.CodeMirror.refresh();
        });
    }
});