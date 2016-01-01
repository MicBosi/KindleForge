'use strict';

window.XS = window.XS == undefined ? {} : window.XS;

let title_list = [];

function log_compile_warning(msg) {
    O('project-warnings').innerHTML += '<div>'+msg+'</div>\n';
    console.log(msg);
}

XS.wikify = function(text) {
    // trim spaces at the end of lines
    text = text.replace(/[\t ]*$/mg, '');
    
    // removes double empty lines
    // text = text.replace(/^\n+$/mg, '');

    // build paragraphs
    var lines = text.split('\n');
    var in_par = false;
    var new_text = [];
    var blank_count = 0;
    var blind_copy = false;
    for(var i=0; i<lines.length; ++i) {
        var line = lines[i];

        if (line == '-html-'){
            blind_copy = true;
            continue;
        } else 
        if (line == '-/html-'){
            blind_copy = false;
            continue;
        }

        if (blind_copy) {
            new_text.push(line);
            continue;
        }

        var should_be_in_par = false;
        if (line.match(/^\[break\]$/) != null || line.match(/^\[toc\]$/) != null || line.match(/^={1,6} /) != null || line.match(/^\+{1,6} /) != null || line.indexOf('[img ') == 0 || line.length == 0) {
            should_be_in_par = false;
        } else {
            should_be_in_par = true;
        }

        if (should_be_in_par != in_par) {
            if (should_be_in_par) {
                line = '<p>' + line;
                
                in_par = true;
            } else {
                if (new_text.length) {
                    new_text[new_text.length - 1] += '</p>';
                }
                in_par = false;
            }
        }

        if (line.match(/^={1,6} /) != null) {

            // ===
            var h_rank = line.replace(/^(={1,6})\s(.*)/, '$1').length;
            
            var chapnumb = title_list.length + 1;
            var chaprefr = 'chap' + chapnumb;
            // note how this skips 0 or ore directives
            var chapname = line.replace(/^={1,6}\s+(\[.+\])*(.+)$/g, '$2');
            if (chapname.indexOf('|') != -1) {
                var chap_full_name = chapname.split('|')[0].trim();
                var chap_toc_name  = chapname.split('|')[1].trim();
            } else {
                var chap_full_name = chapname.trim();
                var chap_toc_name  = chapname.trim();
            }
            // directive to be reinjected for later processing
            var directive = line.replace(/^={1,6}\s+(\[.+\])*(.+)$/g, '$1');
            title_list.push(chap_toc_name+'@'+chaprefr+'@'+h_rank);
            line = F('<h%s><a name="%s"></a>%s%s</h%s>', h_rank, chaprefr, directive, chap_full_name, h_rank);

            // page break before chapter
            if (h_rank == 1 && chapnumb > 1) {
                line = '<mbp:pagebreak />\n' + line;
            }
        }

        if (in_par && line.indexOf(' ') == 0) {
            line = line.replace(/^\s+/, '&nbsp;&nbsp;');
        }

        if (in_par == false && line.length == 0) {
            blank_count ++;
            if (blank_count > 1) {
                line = '<p>&nbsp;</p>';
            }
        } else {
            blank_count = 0;
        }

        if (in_par && line.match(/<\/div>$/) == null) {
            line += '<br />';
        }

        new_text.push(line);
    }

    text = new_text.join('\n');
    text = text.replace(/<br \/><\/p>/g,'</p>');

    // unlinked headers
    text = text.replace(/^\+\+\+\+\+\+ (.+)/mg, '<h6>$1</h6>');
    text = text.replace(/^\+\+\+\+\+ (.+)/mg, '<h5>$1</h5>');
    text = text.replace(/^\+\+\+\+ (.+)/mg, '<h4>$1</h4>');
    text = text.replace(/^\+\+\+ (.+)/mg, '<h3>$1</h3>');
    text = text.replace(/^\+\+ (.+)/mg, '<h2>$1</h2>');
    text = text.replace(/^\+ (.+)/mg, '<h1>$1</h1>');

    var replace_callback = function(match, heading, link, directives, reminder) {
        var style = '';
        directives = directives.split(',');
        for(var i=0; i<directives.length; ++i) {
            var directive = directives[i];
            switch(directive) {
                case 'center': 
                case 'left': 
                case 'right': 
                case 'justify':
                    style += 'text-align: ' + directive + '; '; 
                    break;
                case 'bold':
                    style += 'font-weight: bold;';
                    break;
                case 'italic':
                    style += 'font-style: italic;';
                    break;
                case 'underline':
                    style += 'text-decoration: underline;';
                    break;
                case 'strike':
                    style += 'text-decoration: line-through;';
                    break;
                case 'small':
                    style += 'font-size: 90%;';
                    break;
                case 'serif':
                case 'sans-serif':
                case 'cursive':
                case 'fantasy':
                case 'monospace':
                    style += 'font-family: ' + directive + '; ';
                    break;
                default:
                    if (directive.indexOf('#') == 0) {
                        style += 'color: ' + directive + '; ';
                    } else {
                        log_compile_warning('unknown directive: \'' + directive + '\'');
                    }
                    break;
            }
        }
        var result = F('<%s style="%s">%s%s', heading, style, link, reminder);
        return result;
    }

    // [...] directives
    text = text.replace(/^<(\w+)>[\t ]*([^\[\n\r]*)[\t ]*\[(.+?)\]([^\n\r]+)$/mg, replace_callback);

    // manual page break
    text = text.replace(/^\[break\]$/mg, '<mbp:pagebreak />');

    // blank spaces
    // text = text.replace(/^\n$/g, '<mbp:pagebreak />');

    // bold
    text = text.replace(/'''(.*?)'''/mg, '<b>$1</b>');

    // italic
    text = text.replace(/''(.*?)''/mg, '<i>$1</i>');

    // pictures
    text = text.replace(/^\[img\s+([\w\-\/_]+\.\w+)\]$/mg, '<div><center><img src="$1"></center></div>');

    return text;
}

XS.try_compile = function() {
    if (XS.needs_compile == false) {
        return;
    } else {
        XS.needs_compile = false;
    }

    O('project-warnings').innerHTML = '';

    title_list = [];
    var text = XS.wikify(O('project-wiki').value);

    // toc page
    var toc_page = '<mbp:pagebreak \/><a name="TOC"></a><h1 class="toc-title">Table of Contents</h1>\n';
    toc_page += '<div class="toc">\n';
    var last_rank = 0;
    for(var i=0; i<title_list.length; ++i) {
        var title_name = title_list[i].split('@')[0];
        var title_id   = title_list[i].split('@')[1];
        var title_rank = title_list[i].split('@')[2] * 1;

        if (title_rank > last_rank) {
            toc_page += '\n' + Array(title_rank).join('  ') + '<ul>\n';
            last_rank = title_rank;
        } else
        if (title_rank < last_rank) {
            // close current element
            toc_page += '</li>';
            for(var j=0; j<last_rank-title_rank; ++j) {
                // close current list
                toc_page += '</ul>';
                // close current element
                toc_page += '</li>';
            }
            toc_page += '\n';

            last_rank = title_rank;
        } else {
            // close current element
            toc_page += '</li>\n';
        }

        var entry = title_name;
        switch(title_rank) {
            case 1: entry = F('<b>%s</b>', entry); break;
            case 2: break;
            default: entry = F('<i>%s</i>', entry); break;
        }
        
        entry = F('%s<li><a href="#%s">%s</a>', Array(title_rank+1).join('  '), title_id, entry);

        toc_page += entry;
    }
    toc_page += '</li>\n';
    toc_page += '</ul>\n';
    toc_page += '</div>\n';

    text = text.replace('[toc]', toc_page);

    // var style = 'p { margin: 0; margin-bottom: 1em; text-indent: 0; text-align: left; }\nh1 { text-align: left; }\nh2 { text-align: left; }\nh3 { text-align: left; }\ndiv { text-align: left; }\nimg { margin-bottom: 1em; }\n';
    var style = O('project-css').value;
    // var style = 'p { margin: 0; text-indent: 1em; }\n';
    // var style = 'p { margin: 0; }\n'; // let the indentation use Kindle's default

    var book_title = text.match(/<h1.*?>([\w ]+?)<\/h1>/);
    book_title = book_title != null ? book_title[1].trim() : null;
    if (book_title == null || book_title.length < 3) {
        log_compile_warning('Invalid book title: ' + book_title);
    }
    text = F('<!DOCTYPE html>\n<html>\n<head>\n<meta charset="iso-8859-1">\n<title>%s</title>\n<style>\n%s\n</style>\n</head>\n<body>\n%s</body>\n</html>\n', book_title, style, text);

    XS.project_html = text;

    O('project-html').innerHTML = escape_html(XS.project_html);

    var iframe_scroll = window.frames[0].document.body.scrollTop;
    O('render').srcdoc = text.replace(/<mbp:pagebreak \/>/g, '<hr style="border: none; border-top: 2px dashed orange;">').replace(/<img src="(.+?)"/g, '<img src="'+XS.EBOOK_DIR+'/'+XS.project_name+'/$1?v='+new Date().getTime()+'"');
    setTimeout(function() { window.frames[0].document.body.scrollTop = iframe_scroll; }, 1000);
}

XS.compile = function() {
    try {
        XS.try_compile();
    }
    catch(err) {
        var msg = 'Compilation failed:\n' + err.message;
        alert(msg);
        log_compile_warning(msg);
        throw msg;
    }
    finally {
        O('warning-count').innerHTML = O('project-warnings').children.length;
    }
}
