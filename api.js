'use strict';
const EBOOK_DIR = './ebooks';
const REST_API_PORT = 3000;
const UPLOAD_PORT = 3001;
const REST_API_BASE_DIR = '/api';
const UPLOAD_BASE_DIR = '/upload';
const MAX_UPLOAD_SIZE = '10mb';

const express = require('express');
const bodyParser = require('body-parser');
const archiver = require('archiver');
const fs = require('fs');
const os = require('os');
const path = require('path');
const image_size = require('image-size');
const multiparty = require('multiparty');
const http = require('http');
const util = require('util');

const api = express();

// to support JSON-encoded bodies
api.use(bodyParser.json({
    limit: MAX_UPLOAD_SIZE
}));

// to support URL-encoded bodies
api.use(bodyParser.urlencoded({
    limit: MAX_UPLOAD_SIZE,
    extended: true
}));

function list_pics(project, include_dims) 
{
    let paths = fs.readdirSync(`${EBOOK_DIR}/${project}`);
    paths = paths.filter(function(path) {
        return /(\.png|\.jpg|\.jpeg)$/i.test(path);
    });
    paths = paths.map(function(path) {
        if (include_dims) {
            let full_path = `${EBOOK_DIR}/${project}/${path}`;
            let dimensions = image_size(full_path);
            let width = dimensions.width;
            let height = dimensions.height;
            let file_size = fs.statSync(full_path).size;
            return [path, width, height, file_size].join(':');
        } else {
            return path;
        }
    });
    return paths;
}

http.createServer(function(req, res) {
    if (req.url === UPLOAD_BASE_DIR && req.method === 'POST') {
        // parse a file upload 
        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {
            var project_name = fields.project_name[0];
            // var cmd = fields.cmd[0];

            var old_path = files.file[0].path;
            var new_path = `${EBOOK_DIR}/${project_name}/${files.file[0].originalFilename}`;
            // console.log(old_path + ' -> ' + new_path);
            fs.renameSync(old_path, new_path);

            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('Upload received.');
            res.end(util.inspect({fields: fields, files: files}));
        });
        return;
    }
}).listen(UPLOAD_PORT);

api.get(REST_API_BASE_DIR, function(req, res) {
    if (req.query.cmd == 'list-projects') {
        let paths = fs.readdirSync(`${EBOOK_DIR}`);
        paths = paths.filter(function(x) { return x != 'template'; } );
        let output = { 
            code:'OK', 
            data:paths 
        };
        res.send(JSON.stringify(output));
    } else if (req.query.cmd == 'open-project') {
        let project_name = req.query.project_name;
        let output = { 
            code:'OK', 
            data: {
                name: project_name,
                wiki: fs.readFileSync(`${EBOOK_DIR}/${project_name}/main.wiki`, 'utf8'),
                css: fs.readFileSync(`${EBOOK_DIR}/${project_name}/style.css`, 'utf8'),
                pics: list_pics(project_name, true)
            }
        };
        res.send(JSON.stringify(output));
    } else if (req.query.cmd == 'check-project-status') {
        let filemtime = function (path) {
            if (fs.existsSync(path)) {
                return fs.statSync(path).mtime.getTime();
            } else {
                return 0;
            }
        };
        let project_name = req.query.project_name;
        let wiki_date = filemtime(EBOOK_DIR+'/'+project_name+'/main.wiki');
        let html_date = filemtime(EBOOK_DIR+'/'+project_name+'/ebook.html');
        let output = { 
            code:'OK', 
            html_up_to_date: html_date >= wiki_date
        };
        res.send(JSON.stringify(output));
    } else if (req.query.cmd == 'download-zip') {
        let project_name = req.query.project_name;
        if (project_name == 'template') {
            let output = { code: 'ERROR', message: 'Operation not permitted on "template" project.'};
            res.send(JSON.stringify(output));
        } else {
            let zip_file_path = `${EBOOK_DIR}/${project_name}/${project_name}.zip`;
            let zip_file_name = path.basename(zip_file_path);

            if (fs.existsSync(zip_file_path)) {
                fs.unlinkSync(zip_file_path);
            }

            let archive = archiver('zip');

            archive.on('error', function(err) {
                throw err;
            });
 
            res.attachment(zip_file_name);

            archive.pipe(res);

            archive.append(fs.createReadStream(`${EBOOK_DIR}/${project_name}/ebook.html`), {name:'ebook.html'});
            let pics = list_pics(project_name);
            pics.forEach(function(pic) {
                archive.append(fs.createReadStream(`${EBOOK_DIR}/${project_name}/${pic}`), {name:pic});
            });
            archive.finalize();
        }
    } else {
        res.send('Unknown API command: ' + req.query.cmd);
    }
});

api.post(REST_API_BASE_DIR, function(req, res) {
    if (req.body.cmd == 'new-project') {
        // to be implemented
        let project_name = req.query.project_name;
        let output = { 
            code:'OK', 
            data: {}
        };
        res.send(JSON.stringify(output));
    } else if (req.body.cmd == 'rename-project') {
        // to be implemented
        let project_name = req.query.project_name;
        let output = { 
            code:'OK', 
            data: {
            }
        };
        res.send(JSON.stringify(output));
    } else if (req.body.cmd == 'save-project') {
        console.log(req.body);
        let project_name = req.body.project_name;
        let project_wiki = req.body.project_wiki;
        let project_css = req.body.project_css;
        let project_html = req.body.project_html;

        fs.writeFile(`${EBOOK_DIR}/${project_name}/main.wiki`, project_wiki, 'utf8');
        fs.writeFile(`${EBOOK_DIR}/${project_name}/style.css`, project_css, 'utf8');
        fs.writeFile(`${EBOOK_DIR}/${project_name}/ebook.html`, project_html, 'utf8'); // should convert to Latin-1 instead using node-iconv

        let output = { 
            code:'OK'
        };
        res.send(JSON.stringify(output));
    } else if (req.body.cmd == 'delete-picture') {
        console.log('delete-picture')
        // to be implemented
        let project_name = req.body.project_name;
        let pic_name = req.body.pic_name;
        fs.unlinkSync(`${EBOOK_DIR}/${project_name}/${pic_name}`);
        let output = { 
            code:'OK', 
            data: {
            }
        };
        res.send(JSON.stringify(output));
    } else {
        res.statusCode = 404;
        res.send('Unknown API command.');
    }
});

var server = api.listen(REST_API_PORT, function () {
    // var host = server.address().address;
    // var port = server.address().port;
});
