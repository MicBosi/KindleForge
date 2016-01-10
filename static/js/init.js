(function() {
'use strict';

window.XS = window.XS == undefined ? {} : window.XS;

XS.APP_NAME = 'Kindle Forge 1.0';
XS.EBOOK_DIR = '../ebooks';
XS.REST_API_URL = 'http://localhost:3000/api';
XS.UPLOAD_URL = 'http://localhost:3001/upload';

XS.PICTURE_TEMPLATE = '<div id="pic-id-%s" style="margin: 15px; width: 350px; display: inline-block; position: relative; vertical-align: top;"><div style="position: absolute; left: 5px; top: 5px; margin: 5px;"><a style="background-color: white; padding: 3px; border: 1px solid lightgray;" class="glyphicon glyphicon-remove-circle" href="#" onclick="XS.delete_picture(\'%s\'); return false;"></a></div><img src="'+XS.EBOOK_DIR+'/%s/%s?%s" style="width: 300px; height: auto; border: 1px solid lightgray; padding: 2px;"><br>%s<br><i>%sx%s&nbsp;&nbsp;&nbsp;%s</i></div>';

XS.server = new XS.Server();

XS.project_name = null;
XS.project_wiki = null;
XS.project_css = null;
XS.project_html = null;
XS.project_pics = [];

function initialize()
{
    document.title = XS.APP_NAME;

    O('render').srcdoc = '- hi there! :) -';

    $(window).bind('keydown', function(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (String.fromCharCode(event.which).toLowerCase()) {
            case 's':
                event.preventDefault();
                XS.needs_save = true;
                XS.needs_compile = true;
                XS.save_project();
                break;
            case 'r':
                event.preventDefault();
                XS.open_project(XS.project_name);
                break;
            }
        }
    });

    XS.populate_project_list();

    // XS.initialize_image_form();

    XS.needs_compile = true;

    XS.needs_save = false;

    O('save-icon').setAttribute('class', 'glyphicon glyphicon-floppy-saved');

    O('project-wiki').oninput = function() {
        XS.needs_compile = true;
        XS.needs_save = true;
        O('save-icon').setAttribute('class', 'glyphicon glyphicon-floppy-save');
    }

    O('project-css').oninput = function() {
        XS.needs_compile = true;
        XS.needs_save = true;
        O('save-icon').setAttribute('class', 'glyphicon glyphicon-floppy-save');
    }

    // O('file-form').action = XS.REST_API_URL;
}

XS.populate_project_list = function() {
    var ok_callback = function(xhr) {
        var projects = safe_json_parse(xhr.responseText).data.sort();
        var html = '<a href="#" onclick="XS.new_project(); return false;"><i class="glyphicon glyphicon-book"></i> New book</a><br /><br />';
        html += '<span style="color: gray;">Open:</span><br />';
        for(var i=0; i<projects.length; ++i) {
            html += F('&nbsp; &bull; <a href="#" onclick="XS.open_project(\'%s\');">%s</a><br />', projects[i], projects[i]);
        }
        html += '<br /><a href="#" onclick="XS.open_project(\'template\');"><i class="glyphicon glyphicon-cog"></i> Edit template</a><br />';
        O('project-list').innerHTML = html;
    }

    XS.server.api_list_projects(ok_callback, err_callback);
}

document.onready = initialize;
})();