'use strict';

window.XS = window.XS == undefined ? {} : window.XS;

require('./Ajax');
require('./Server');
require('./project');
require('./wikify');

XS.APP_NAME = 'Kindle Forge 1.0';
XS.EBOOK_DIR = '../ebooks';
XS.REST_API_URL = 'http://localhost:3000/api';

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

    XS.initialize_image_form();

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

    O('file-form').action = XS.REST_API_URL;
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

XS.initialize_image_form = function() {
    var form = O('file-form');
    var fileSelect = O('file-select');
    var uploadButton = O('upload-button');

    form.onsubmit = function(event) {
        if (XS.project_name == null) {
            alert('Please create or open a project first.');
            return;
        }
        event.preventDefault();

        // Update button text.
        uploadButton.innerHTML = 'Uploading...';

        // Get the selected files from the input.
        var files = fileSelect.files;

        // Create a new FormData object.
        var formData = new FormData();

        // if pictures are too big this sometimes does not work
        formData.append('cmd', 'upload-picture');
        formData.append('project_name', XS.project_name);

        var new_pictures = [];
        // Loop through each of the selected files.
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // Check the file type.
            if (!file.type.match('image.*')) {
                alert('Ignoring file "' + file.name + '"');
                continue;
            }

            if (XS.project_pics.indexOf(file.name) != -1) {
                console.log('overwriting picture: ' + file.name);
            }

            new_pictures.push(file.name);

            // Add the file to the request.
            formData.append('photos[]', file, file.name);
        }

        if (new_pictures.length == 0) {
            O('file-select').value = '';
            uploadButton.innerHTML = 'Upload';
            return;
        }

        var xhr = new XMLHttpRequest();

        xhr.open('POST', 'api', true);

        // Set up a handler for when the request finishes.
        xhr.onload = function () {
            if (xhr.status === 200) {
                // File(s) uploaded.
                uploadButton.innerHTML = 'Upload';
                var response = safe_json_parse(xhr.responseText);
                if (response.code != "OK") {
                    alert('Error uploading file(s):\n' + response.message);
                } else {
                    // repopulate list of pictures

                    // delete old pictures
                    for(var i=0; i<new_pictures.length; ++i) {
                        var pic_name = new_pictures[i];
                        var obj = document.getElementById('pic-id-'+pic_name);
                        if (obj != null) {
                            delete_node(obj);
                        } else {
                            XS.project_pics.push(pic_name);
                        }
                    }

                    // add new pictures
                    var pics_list = O('pics-list');
                    var html = '';
                    for(var i=0; i<new_pictures.length; ++i) {
                        var picture = new_pictures[i];
                        var dims = response['files'][picture];
                        html += F(XS.PICTURE_TEMPLATE, picture, picture, XS.project_name, picture, new Date().getTime(), picture, dims.w, dims.h, human_readable_file_size(dims.size));
                    }
                    pics_list.innerHTML = html + pics_list.innerHTML;

                    O('file-select').value = '';

                    XS.needs_compile = true;
                }
            } else {
                alert('An error occurred!');
            }
        };

        xhr.send(formData);
    }
}

document.onready = initialize;