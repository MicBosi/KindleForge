(function() {
'use strict';

window.XS = window.XS == undefined ? {} : window.XS;

XS.Server = function() {

};

XS.Server.prototype.api_list_projects = function(user_ok_callback, user_err_callback) {

    $.ajax({
        type: 'GET',
        url: XS.REST_API_URL,
        data: {
            cmd: 'list-projects'
        },
        success: function(result,status,xhr) { user_ok_callback(xhr); },
        error: function(xhr,status,error) { user_err_callback(xhr); }  
    });
};

XS.Server.prototype.api_open_project = function(project_name, user_ok_callback, user_err_callback) {

    $.ajax({
        type: 'GET',
        url: XS.REST_API_URL,
        data: {
            cmd: 'open-project',
            project_name: project_name
        },
        success: function(result,status,xhr) { user_ok_callback(xhr); },
        error: function(xhr,status,error) { user_err_callback(xhr); }  
    });

};

XS.Server.prototype.api_save_project = function(user_ok_callback, user_err_callback) {

    $.ajax({
        type: 'POST',
        url: XS.REST_API_URL,
        data: {
            cmd: 'save-project',
            project_name: XS.project_name,
            project_wiki: XS.project_wiki,
            project_css : XS.project_css,
            project_html: XS.project_html
        },
        success: function(result,status,xhr) { user_ok_callback(xhr); },
        error: function(xhr,status,error) { user_err_callback(xhr); }  
    });

};

XS.Server.prototype.api_delete_picture = function(pic_name, user_ok_callback, user_err_callback) {

    $.ajax({
        type: 'POST',
        url: XS.REST_API_URL,
        data: {
            cmd: 'delete-picture',
            project_name: XS.project_name,
            pic_name: pic_name,
        },
        success: function(result,status,xhr) { user_ok_callback(xhr); },
        error: function(xhr,status,error) { user_err_callback(xhr); }  
    });

};

XS.Server.prototype.api_new_project = function(project_name, user_ok_callback, user_err_callback) {

    $.ajax({
        type: 'POST',
        url: XS.REST_API_URL,
        data: {
            cmd: 'new-project',
            project_name: project_name,
        },
        success: function(result,status,xhr) { user_ok_callback(xhr); },
        error: function(xhr,status,error) { user_err_callback(xhr); }  
    });

};

XS.Server.prototype.api_rename_project = function(new_project_name, user_ok_callback, user_err_callback) {
    var ok_callback = function(xhr) {
        XS.project_name = new_project_name;
        O('project-name').innerHTML = XS.project_name;
        O('external-preview').href = XS.EBOOK_DIR + '/' + XS.project_name + '/ebook.html';
        user_ok_callback(xhr);
    }

    $.ajax({
        type: 'POST',
        url: XS.REST_API_URL,
        data: {
            cmd: 'rename-project',
            project_name: XS.project_name,
            new_project_name: new_project_name
        },
        onsuccess: ok_callback,
        error: function(xhr,status,error) { user_err_callback(xhr); }  
    });

};

XS.Server.prototype.api_check_project_status = function(project_name, user_ok_callback, user_err_callback) {
    $.ajax({
        type: 'GET',
        url: XS.REST_API_URL,
        data: {
            cmd: 'check-project-status',
            project_name: project_name
        },
        success: function(result,status,xhr) { user_ok_callback(xhr); },
        error: function(xhr,status,error) { user_err_callback(xhr); }  
    });

    ajax.get();
};
})();