$.widget("hg.filePicker", {
    options: {},
    _create: function () {
        var thiz = this;
        var $nav = $("<nav>");
        thiz.anchors = [];
        var $page = $("<ul>").addClass("pagination");
        this.element.find(".tab-content > *").each(function (i, e) {
            thiz.anchors[i] = "#" + $(this).attr("id");
            var filename = $(e).find("textarea").data("name");
            var anchor = $("<a>").addClass("page-link").attr("href", "#").text(filename);
            var li = $("<li>").addClass("page-item");
            li.attr('id', $(this).attr("id") + "_link");
            $page.append(li.append(anchor));
            anchor.click((e) => {
                e.preventDefault();
                thiz.activate(i);
            })
        });
        $nav.append($page);
        this.element.append($nav);
        this.activate(0);
    },

    activate: function (i) {
        this.element.find(".page-item").removeClass("active");
        this.element.find(this.anchors[i] + "_link").addClass("active");
        this.element.find(".file-pane").removeClass("active");
        this.element.find(this.anchors[i]).addClass("active");
        this.element.find(".CodeMirror").each(function(i, e) {e.CodeMirror.refresh();});
    }
});