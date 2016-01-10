(function() {
'use strict';

window.XS = window.XS == undefined ? {} : window.XS;

XS.open_project = function(project_name) {
    O('project-list').innerHTML = 'Loading ebook: '+project_name;
    $('#filelist').html('');
    XS.project_name = project_name;
    O('project-reload').style.color = 'orange';

    // init pluploader
    if (XS.uploader) {
        XS.uploader.destroy();
    }
    XS.uploader = new plupload.Uploader({
        browse_button: 'browse', // this can be an id of a DOM element or the DOM element itself
        url: XS.UPLOAD_URL,
        multipart_params: {
            cmd: 'upload-picture',
            project_name: XS.project_name
        }
    });
     
    XS.uploader.init();

    XS.uploader.bind('FilesAdded', function(up, files) {
        var html = '';
        plupload.each(files, function(file) {
            html += '<li id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></li>';
        });
        document.getElementById('filelist').innerHTML += html;
    });
     
    XS.uploader.bind('UploadProgress', function(up, file) {
        document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
    });
     
    XS.uploader.bind('Error', function(up, err) {
        document.getElementById('console').innerHTML += "\nError #" + err.code + ": " + err.message;
    });
     
    document.getElementById('start-upload').onclick = function() {
        XS.uploader.start();
    };


    var ok_callback = function(xhr) {
        document.title = XS.project_name;

        XS.needs_compile = true;
        XS.needs_save = false;
        O('save-icon').setAttribute('class', 'glyphicon glyphicon-floppy-saved');

        var data = safe_json_parse(xhr.responseText).data;
        var project_name = data['name'];
        O('project-name').innerHTML = project_name;
        O('project-wiki').value = data['wiki'];
        O('project-css').value = data['css'];

        if (project_name == 'template') {
            O('project-name').style.cursor = 'normal';
            O('project-name').onclick = null;

            O('download-zip').style.display = 'none';
            O('download-zip').onclick = function(event) { return false; }
        } else {
            O('project-name').style.cursor = 'pointer';
            O('project-name').onclick = function() {
                var new_project_name = prompt('Rename project', XS.project_name);
                if (new_project_name != null) {
                    var ok_callback = function() {}
                    XS.server.api_rename_project(new_project_name, ok_callback, err_callback);
                }
            }

            O('download-zip').style.display = 'inline';
            O('download-zip').onclick = function(event) {
                if (XS.project_name == null) {
                    // silently ignore
                } else
                if (XS.needs_save == true) {
                    alert('Please save or discard your changes before exporting the zip file.');
                } else {
                    var ok_callback = function(xhr) {
                        var data = safe_json_parse(xhr.responseText);
                        if (data.html_up_to_date === true) {
                            XS.download_zip();
                        } else {
                            alert('main.wiki updated externally.\nPlease reload and save the project.');
                        }
                    }
                    XS.server.api_check_project_status(XS.project_name, ok_callback, err_callback);
                }
                return false;
            }
        }
        O('external-preview').href = XS.EBOOK_DIR+'/' + XS.project_name + '/ebook.html';

        var pics_list = O('pics-list');
        pics_list.innerHTML = '';
        XS.project_pics = [];
        for(var i=0; i<data['pics'].length; ++i) {
            var picture = data['pics'][i].split(':')[0];
            var w = data['pics'][i].split(':')[1];
            var h = data['pics'][i].split(':')[2];
            var fs = human_readable_file_size(data['pics'][i].split(':')[3]);
            pics_list.innerHTML += F(XS.PICTURE_TEMPLATE, picture, picture, XS.project_name, picture, new Date().getTime(), picture, w, h, fs);
            XS.project_pics.push(picture);
        }
        O('project-list').style.display = 'none';
        O('project-desk').style.display = 'block';
        node_fadein(O('project-desk'));
        XS.compile();
        O('project-reload').style.color = '';

    }
    var err_callback = function(xhr) {
        var data = safe_json_parse(xhr.responseText);
        alert(data.message + '\n\nDefaulting to html file.');
        document.location = XS.EBOOK_DIR+'/'+project_name+'/'+project_name+'.html';
    }
    XS.server.api_open_project(project_name, ok_callback, err_callback);
}

XS.save_project = function(project_name, generate_zip) {
    if (XS.project_name == null) {
        console.log('Skipping project save.');
        return;
    }
    O('save-icon').setAttribute('class', 'glyphicon glyphicon-transfer');
    setTimeout(function() {
        var ok_callback = function(xhr) {
            var response = safe_json_parse(xhr.responseText);
            if (response.code != 'OK') {
                alert(xhr.responseText);
            } else {
                XS.needs_save = false;
                O('save-icon').setAttribute('class', 'glyphicon glyphicon-floppy-saved');
            }
        }
        // convert UTF chars > 127 to HTML entities
        XS.sanitize_wiki();
        // make sure it's compiled
        XS.compile();
        // XS.project_name = 
        XS.project_wiki = O('project-wiki').value;
        XS.project_css  = O('project-css').value;
        // XS.project_html = 
        XS.server.api_save_project(ok_callback, err_callback);
    }, 10);
}

XS.sanitize_wiki = function(s) {
    var s = O('project-wiki').value;

    for(var i=s.length-1; i>=0; --i) {
        if (s.charCodeAt(i) > 127) {
            if (s.charCodeAt(i) == 8212) {
                s = s.substr(0, i) + '&mdash;' + s.substr(i+1);
            } else {
                s = s.substr(0, i) + '&#' + s.charCodeAt(i) + ';' + s.substr(i+1);
            }
        }
    }
    O('project-wiki').value = s;
}

XS.delete_picture = function(pic_name) {
    var ok_callback = function(xhr) {
        delete_node(O('pic-id-'+pic_name));
        assert(XS.project_pics.indexOf(pic_name) != -1, 'XS.project_pics.indexOf(pic_name) != -1');
        XS.project_pics.remove(XS.project_pics.indexOf(pic_name));
        XS.needs_compile = true;
    }
    XS.server.api_delete_picture(pic_name, ok_callback, err_callback);
}

XS.new_project = function() {
    var project_name = prompt('Name of the new project:');
    if (project_name == null) {
        return;
    }
    var ok_callback = function(xhr) {
        XS.open_project(project_name);
    }

    XS.server.api_new_project(project_name, ok_callback, err_callback);
}

XS.close_project = function() {
    if (XS.needs_save == true && confirm('Project not saved, do you still wish to close it?') == false) {
        return;
    }

    node_fadeout(O('project-desk'), function() {
        // reload app
        window.location = '';
    });
}

XS.download_zip = function() {
    var sUrl = XS.REST_API_URL+'?cmd=download-zip&project_name='+XS.project_name;

    // Creating new link node.
    var link = document.createElement('a');
    link.href = sUrl;

    if (link.download !== undefined){
        // Set HTML5 download attribute. This will prevent file from opening if supported.
        var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
        link.download = fileName;
    }

    // Dispatching click event.
    var e = document.createEvent('MouseEvents');
    e.initEvent('click' ,true ,true);
    link.dispatchEvent(e);
}
})();