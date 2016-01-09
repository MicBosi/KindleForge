// ----------------------------------------------------------------------------
// Various Utility Functions
// ----------------------------------------------------------------------------

function assert(condition, message) {
    if (!condition) {
        var msg = message || "Assertion failed"; 
        alert(msg);
        throw msg;
    }
}

function O(id)
{
    var element = document.getElementById(id);
    if (element == null) {
        console.log('O("'+id+'") = ' + element);
        assert(false);
    }
    return element;
}

function nbspfy(str)
{
    return str.replace(/ /g, "&nbsp;")
}

// ----------------------------------------------------------------------------
// Object
// ----------------------------------------------------------------------------

function isEmptyObject(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }
    return true;
};

// ----------------------------------------------------------------------------
// Number test
// ----------------------------------------------------------------------------

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// ----------------------------------------------------------------------------
// String extensions
// ----------------------------------------------------------------------------

// Replace all functionality
String.prototype.replace_all = function(find, replace) {
  return this.replace(new RegExp(find, 'g'), replace);
}

// Trimming functions.
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
    return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
    return this.replace(/\s+$/,"");
}

// ----------------------------------------------------------------------------
// Array extensions
// ----------------------------------------------------------------------------

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Removes first occurrence of given value
Array.prototype.remove_val = function(val) {
    var i = this.indexOf(val);
    if (i != -1)
        this.remove(i);
}

// Adds element to array only if unique
Array.prototype.push_unique_val = function(val) {
    if (this.indexOf(val) == -1)
        this.push(val);
}

// Adds element to array only if unique
Array.prototype.push_unique_obj = function(obj) {
    if (this.has_object_with(obj) == false)
        this.push(obj);
}

// Adds element to array only if unique
Array.prototype.push_unique_obj_with = function(obj, parms) {
    if (this.has_object_with(parms) == false)
        this.push(obj);
}

Array.prototype.get_object_index_with = function(dict) {
    for(var i=0; i<this.length; ++i) {
        var ok = true;
        for(var k in dict) {
            // don't allow matching of undefined fields
            assert(dict[k]);
            // also fail if this list does not have the required field
            if (!(k in this[i]) || dict[k] != this[i][k]) {
                ok = false;
                break;
            }
        }
        if (ok)
            return i;
    }
    return -1;
}

Array.prototype.has_object_with = function(dict) {
    return this.get_object_index_with(dict) != -1;
}

Array.prototype.get_object_with = function(dict) {
    var i = this.get_object_index_with(dict);
    if(i != -1)
        return this[i];
    else
        return null;
}

Array.prototype.remove_object_with = function(dict) {
    var i = this.get_object_index_with(dict);
    if(i != -1)
        return this.splice(i, 1)[0];
    else
        return null;
}

// ----------------------------------------------------------------------------
// Function binding
// ----------------------------------------------------------------------------

// http://stackoverflow.com/questions/373157/how-can-i-pass-a-reference-to-a-function-with-parameters
function partial(func /*, 0..n args */) {
  var args = Array.prototype.slice.call(arguments).splice(1);
  return function() {
    var allArguments = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArguments);
  };
}

// Android 2.3 does not support it!!!
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// ----------------------------------------------------------------------------
// UID
// ----------------------------------------------------------------------------

// File and URL safe base64
var Base64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzAB';
// Generates a 72 bits uid represented as a string of 12 base62 chars
// 12 bits = rightmost utc-milliseconds | 60 bits = random
function generate_uid()
{
    var str = '';
    var u = (new Date()).getTime()  & 0xFFF; // = 4096 == 64*64
    str += Base64[u & 0x3f];
    str += Base64[(u >> 6) & 0x3f];
    for(var i=0; i<10; ++i) {
        str += Base64[Math.floor(Math.random()*0xFFFF) & 0x3f];
    }
    return str;
}

function generate_node_uid() {
    return generate_uid();
}

// ----------------------------------------------------------------------------
// Time utils
// ----------------------------------------------------------------------------

function get_epoc_time()
{
    return (new Date()).getTime();
}

function get_today_string() { 
    var d = new Date(); 
    return F("%04d%02d%02d", d.getFullYear(), d.getMonth()+1, d.getDate()); 
};

// date: "20141225"
function date_string_to_time(date) {
    var year = date.substr(0,4);
    var month = date.substr(4,2);
    var day = date.substr(6,2);
    var date_obj = new Date(year, month-1, day);
    return date_obj.getTime();
}

function friendly_time_date_string(date) {
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();

    return F("%s %d, %04d", XS.Lang.MONTHS_LONG[month], day, year);
}

function get_timestamp(time)
{
    time = time ? time : 0;
    var currentdate = new Date(time); 
    return F("%04d/%02d/%02d %02d:%02d:%02d",
        currentdate.getFullYear(),  
        (currentdate.getMonth()+1),
        currentdate.getDate(),
        currentdate.getHours(),
        currentdate.getMinutes(), 
        currentdate.getSeconds()
    )
}

function get_simple_timestamp(time)
{
    time = time ? time : 0;
    var currentdate = new Date(time); 
    return F("%d/%s/%d %02d:%02d:%02d",
        currentdate.getDate(),
        XS.Lang.MONTHS_SHORT[currentdate.getMonth()],
        currentdate.getFullYear(),  
        currentdate.getHours(),
        currentdate.getMinutes(),
        currentdate.getSeconds()
        );
}

function get_friendly_timestamp(time)
{
    assert(isNumber(time));

    var date = new Date(time); 
    var now = new Date();

    var now_day_time = Math.floor(now.getTime() / (24*60*60*1000));
    var day_time = Math.floor(time / (24*60*60*1000));

    if ((now >= date) && (now - date < 60*1000))
        return local_str('TIME_Just_now');
    else
    if ((now >= date) && (now - date < 4*60*60*1000)) {
        var hour_date = new Date(now - date);
        var hours = hour_date.getHours();
        var minutes = hour_date.getMinutes();
        var str = '';
        if (hours)
            str += hours == 1 ? F(local_str('TIME_hour'), hours) : F(local_str('TIME_hours'), hours);
        if (minutes) {
            if (str)
                str += ' ';
            str += minutes == 1 ? F(local_str('TIME_minute'), minutes) : F(local_str('TIME_minutes'), minutes);
        }
        return str + ' ' + local_str('TIME_ago');
    }
    else
    // Today
    if (day_time == now_day_time) {
        return F("%s %s %02d:%02d",
            local_str('TIME_Today'),
            local_str('TIME_at'),
            date.getHours(),
            date.getMinutes()
        );
    } 
    else
    // Yesterday
    if (day_time == now_day_time-1) {
        return F("%s %s %02d:%02d",
            local_str('TIME_Yesterday'),
            local_str('TIME_at'),
            date.getHours(),
            date.getMinutes()
        );
    } 
    else {    
        return F("%s %s %s %s%s %02d:%02d", 
            XS.Lang.DAYS_LONG[date.getDay()],
            date.getDate(),
            XS.Lang.MONTHS_LONG[date.getMonth()],
            (date.getFullYear() == (new Date()).getFullYear() ? '' : date.getFullYear()+' '),
            local_str('TIME_at'),
            date.getHours(),
            date.getMinutes()
        );
    }
}

function get_friendly_timestamp_short(time)
{
    assert(isNumber(time));

    var date = new Date(time); 
    var now = new Date();

    var now_day_time = Math.floor(now.getTime() / (24*60*60*1000));
    var day_time = Math.floor(time / (24*60*60*1000));

    if ((now >= date) && (now - date < 60*1000))
        return local_str('TIME_Just_now');
    else
    if ((now >= date) && (now - date < 4*60*60*1000)) {
        var hour_date = new Date(now - date);
        var hours = hour_date.getHours();
        var minutes = hour_date.getMinutes();
        var str = '';
        if (hours)
            str += F(local_str('TIME_SHORT_hour'), hours);
        if (minutes) {
            if (str)
                str += ' ';
            str += F(local_str('TIME_SHORT_minute'), minutes);
        }
        return str + ' ' + local_str('TIME_ago');
    }
    else
    // Today
    if (day_time == now_day_time) {
        return F("%s %02d:%02d",
            local_str('TIME_Today'),
            date.getHours(),
            date.getMinutes()
        );
    } 
    else
    // Yesterday
    if (day_time == now_day_time-1) {
        return F("%s %02d:%02d",
            local_str('TIME_Yesterday'),
            date.getHours(),
            date.getMinutes()
        );
    } 
    else {    
        return F("%s %s%s", 
            date.getDate(),
            XS.Lang.MONTHS_SHORT[date.getMonth()],
            (date.getFullYear() == (new Date()).getFullYear() ? '' : ' ' + date.getFullYear())
        );
    }
}

function time_string_to_secs(time_string)
{
    return (function() {
        var r3 = /(\d+):(\d+):(.+)/
        var r2 = /(\d+):(.+)/
        var m
        
        m = time_string.match(r3)
        if (m)
            return m[1]*3600 + m[2]*60 + m[3]*1
        m = time_string.match(r2)
        if (m)
            return m[1]*60 + m[2]*1
        else
            return time_string * 1
    })().toFixed(1) * 1
}

function time_string_long(seconds)
{
    if (seconds<0)
        console.log("time_string() error: seconds < 0!")
        
    var hours = Math.floor(seconds / 3600)
    seconds -= hours * 3600
    var minutes = Math.floor(seconds / 60)
    seconds -= minutes*60
    seconds = Math.round(seconds);

    return F("%02d:%02d:%02d", hours, minutes, seconds)
}

function time_string_short(seconds)
{
    if (seconds<0)
        console.log("time_string() error: seconds < 0!");

    var hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes*60;
    seconds = Math.round(seconds);
    
    // Dynamic short version with decimals
    if (hours)
        return F("%d:%02d:%02d", hours, minutes, seconds);
    else if (minutes)
        return F("%d:%02d", minutes, seconds);
    else
        return F("%d", seconds);
}

// ----------------------------------------------------------------------------
// DOM VFX
// ----------------------------------------------------------------------------

function node_fadeout(node, hide_func) {
    // Setup animation
    var style = node.getAttribute('style');
    node.setAttribute('style', style + '; transition: opacity 0.25s ease-in-out; -webkit-transition: opacity 0.25s ease-in-out; opacity: 0.0;');
    if (hide_func)
        setTimeout(partial(hide_func, node), 250);
}

function node_fadein(node, time) {
    time = time == null ? '0.250' : time;
    // Fade-in
    node.style.opacity = '0.0';
    setTimeout(function() { 
        node.style.transition = F('opacity %ss ease-in-out', time);        
        node.style.webkitTransition = F('opacity %ss ease-in-out', time);        
        node.style.opacity = '1.0';
        // var style = node.getAttribute('style')
        // node.setAttribute('style', style + F('; transition: opacity %ss ease-in-out; -webkit-transition: opacity %ss ease-in-out; opacity: 1.0;', time, time)); 
    }, 10);

}

function collapse_node_fadeout(node) {
    // Setup animation
    var style = node.getAttribute('style');
    node.setAttribute('style', style + '; transition: opacity 0.25s ease-in-out; -webkit-transition: opacity 0.25s ease-in-out; opacity: 0.0;');
    var deferred_collapse = function(node) {
        node.style.display = 'none';
    }
    setTimeout(partial(deferred_collapse, node), 500);
}

function delete_node_fadeout(node) {
    // Setup animation
    var style = node.getAttribute('style');
    node.setAttribute('style', style + '; transition: opacity 0.25s ease-in-out; -webkit-transition: opacity 0.25s ease-in-out; opacity: 0.0;');
    var deferred_collapse = function(node) {
        node.parentNode.removeChild(node);
    }
    setTimeout(partial(deferred_collapse, node), 500);
}

function delete_node(node) {
    node.parentNode.removeChild(node);
}

function swap_nodes(old_node, new_node) {
    assert(old_node != null, 'old_node != null');
    assert(new_node != null, 'new_node != null');
    old_node.parentNode.insertBefore(new_node, old_node);
    return old_node.parentNode.removeChild(old_node);
}

// ----------------------------------------------------------------------------
// DOM Element Nodes Management
// ----------------------------------------------------------------------------

//This code is jQuery's
function add_class(elem,value){
 var rspaces = /\s+/;
 var classNames = (value || "").split( rspaces );
 var className = " " + elem.className + " ",
 setClass = elem.className;
 for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
  if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
   setClass += " " + classNames[c];
  }
 }
 elem.className = setClass.replace(/^\s+|\s+$/g,'');//trim
}

//This code is jQuery's
function remove_class(elem,value){
 var rspaces = /\s+/;
 var rclass = /[\n\t]/g
 var classNames = (value || "").split( rspaces );
 var className = (" " + elem.className + " ").replace(rclass, " ");
 for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
  className = className.replace(" " + classNames[c] + " ", " ");
 }
 elem.className = className.replace(/^\s+|\s+$/g,'');//trim
}

function has_class(elem, class_name) {
    var regexp = /[\n\t\r]/g;
    var class_name = ' ' + class_name + ' ';
    if ((' ' + elem.className + ' ').replace(regexp, ' ').indexOf(class_name) > -1) {
        return true;
    }

    return false;
}

function is_descendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}

function get_ancestor_with_class(elem, class_name) {
    var p = elem.parentNode;
    while(p) {
        if (has_class(p, class_name))
            return p;
        else
            p = p.parentNode;
    }
    return null;
}

function get_descendant_with_class(elem, class_name) {
    var elemlist = elem.getElementsByClassName(class_name);
    assert(elemlist.length == 1, 'get_descendant_with_class("'+class_name+'") found '+elemlist.length+' results\n(1 expected)');
    return elemlist.item(0);
}

function get_descendants_with_class(elem, class_name) {
    return elem.getElementsByClassName(class_name);
}

function remove_all_children(elem) {
    while(elem.lastChild)
        elem.removeChild(elem.lastChild);
}

// elem can be an object or the element id
function set_element_val(elem, val)
{
    if (typeof(elem) == "string")
        elem = O(elem);

    if(elem.tagName == "INPUT")
    {
        if (['checkbox', 'radio'].indexOf(elem.getAttribute('type')) != -1)
            elem.checked = val ? true : false;
        else
            elem.value = val;
    }
    else
    if(elem.tagName == "TEXTAREA")
    {
        elem.value = val;
    }
    else
        elem.innerHTML = val;
}

// elem can be an object or the element id
function get_element_val(elem)
{
    if (typeof(elem) == "string")
        elem = O(elem);
    
    if(elem.tagName == "INPUT")
    {
        if (['checkbox', 'radio'].indexOf(elem.getAttribute('type')) != -1)
            return elem.checked;
        else
            return elem.value;
    }
    else
    if(elem.tagName == "TEXTAREA")
    {
        return elem.value;
    }
    else
        return elem.innerHTML;
}

// ----------------------------------------------------------------------------
// Overlay Debugging
// ----------------------------------------------------------------------------

function scroll_to_elem(elem, offset) {
    window.scrollTo(0, get_elem_rect(elem).top + offset);
}

function get_elem_rect(elem) {
    var r = elem.getBoundingClientRect();
    var sy = 'scrollY' in document ? document.scrollY : window.scrollY;
    var sx = 'scrollX' in document ? document.scrollX : window.scrollX;
    var top  = r.top  + sy;
    var left = r.left + sx;
    var bottom  = r.bottom  + sy;
    var right = r.right + sx;
    return {top:top, left:left, bottom:bottom, right:right, width:right-left, height:bottom-top};
}

// rect = {left,top,width,height}
function set_elem_rect(elem, rect) {
    elem.style.position = 'absolute';
    elem.style.display = 'block';
    elem.style.left = rect.left+'px';
    elem.style.top = rect.top+'px';
    elem.style.width = rect.width+'px';
    elem.style.height = rect.height+'px';
}

function wrap(wrapper, wrapped, color, opacity) {
    var r = wrapped.getBoundingClientRect();
    var sy = 'scrollY' in document ? document.scrollY : window.scrollY;
    var sx = 'scrollX' in document ? document.scrollX : window.scrollX;
    var top  = r.top  + sy;
    var left = r.left + sx;
    wrapper.style.position = 'absolute';
    wrapper.style.display = 'block';
    wrapper.style.left = left+'px';
    wrapper.style.top = top+'px';
    wrapper.style.width = (r.right - r.left)+'px';
    wrapper.style.height = (r.bottom - r.top)+'px';
    wrapper.style.backgroundColor = color;
    wrapper.style.opacity = opacity;
}

// ----------------------------------------------------------------------------
// Language support
// ----------------------------------------------------------------------------

function local_str(str) {
    assert(str in XS.Lang, "Language string '"+str+"' not found!");
    return XS.Lang[str];
}

function languagefy_element(elem) {    
    for (var i = 0; i < elem.attributes.length; i++) {
        var attrib = elem.attributes[i];
        if (attrib.specified) {
            if (attrib.value.length > 1 && attrib.value[0] == '$') {
                var lang_str = attrib.value.substring(1);
                attrib.value = local_str(lang_str);
            }
        }
    }

    // Descend recursively
    for(var i=0; i<elem.children.length; ++i) {
        languagefy_element(elem.children[i]);
    }
}

// ----------------------------------------------------------------------------
// Function default arguments
// ----------------------------------------------------------------------------

// uses default vals if a parameter is missing or is null.
function apply_defaults(params, defaults) {
    var expanded = {}

    assert(typeof params == typeof {});

    for(var key in params) {
        assert(key in defaults, F('Unknown parameter "%s"', key));
    }

    for(var key in defaults) {
        if (key in params && params[key] != null) 
            expanded[key] = params[key];
        else
            expanded[key] = defaults[key];
    }
    return expanded;
}

// ----------------------------------------------------------------------------
// Templating system
// ----------------------------------------------------------------------------

function clone_object(o){
  var copy = Object.create( Object.getPrototypeOf(o) );
  var propNames = Object.getOwnPropertyNames(o);

  propNames.forEach(function(name){
    var desc = Object.getOwnPropertyDescriptor(o, name);
    Object.defineProperty(copy, name, desc);
  });

  return copy;
}

function clone_dictionary(obj1) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    return obj3;
}

// Merges obj2 over obj1
function merge_dictionaries(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

function render_template(template_name, dictionary) {
    dictionary = typeof dictionary == typeof {} ? dictionary : {}

    var html = O(template_name).innerHTML;
    for (var name in dictionary) {
        var value = dictionary[name];
        html = html.replace_all('{{'+name+'}}', value);
    }
    return html;
}

function render_template_to_node(template_name, dictionary) {
    var html = render_template(template_name, dictionary);
    return html_to_node(html);
}

function html_to_node(html) {
    var mother = O('mother-node');

    // inoculates the html code in the mother node - conception!
    mother.innerHTML = html;
    
    // remove all text nodes
    while(mother.childNodes.length && mother.childNodes[0].nodeName == '#text') {
        mother.removeChild(mother.childNodes[0]);
    }
    
    // save the node we are interested in - a new baby node is born!
    var node = mother.removeChild(mother.childNodes[0]);

    // remove all remaining nodes, typically spurious text nodex that
    // follow the template so they don't accumulate
    while(mother.childNodes.length) {
        mother.removeChild(mother.childNodes[0]);
    }

    return node;
}

// ----------------------------------------------------------------------------

// mic fixme: to be implemented with a nice CSS gui with fade in/out
function info_dialog(message) {
    alert(message);
}

function error_dialog(message) {
    console.log(message);
    alert(message);
}

function confirm_dialog(message) {
    return confirm(message);
}

function error_dialog_xhr(xhr) {
    if (xhr.status !== 0) {
        var message = F('message: "%s"\nstatus: "%s"\nready state: "%s"', xhr.responseText, xhr.status, xhr.readyState);
        console.log(message);
        alert(message);
    }
}

function completed_challenge_dialog() {
    return prompt('Congratulations!\n\nWhat\'s the % of completion (between 1 and 100)?');
}

// -----------------------------------------------------------------------------
// Random utils
// -----------------------------------------------------------------------------

function rand_int(max) {
    return Math.floor(Math.random()*65535*65535) % max;
}

function random_choice(choices) {
    return choices[rand_int(choices.length)];
}

// -----------------------------------------------------------------------------
// HTML safety
// -----------------------------------------------------------------------------

function escape_html(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

function htmlize_links(text) {
    return Autolinker.link(
        text, 
        // these settings are actually hardcoded and modified inside our implementation of AFF_Autolinker.js
        {newWindow: false, stripPrefix: true, truncate: 60}
    );
}

function plain_text_to_html(text) {
    var html = text.slice()
    html = escape_html(html);
    // html = htmlize_hashtags(html);
    html = htmlize_links(html);
    return html;
}

function extract_youtube_id(text) {
    var regex = /(?:^|[^\w])youtube\.com\/watch\?.*v=(\w{11})/;
    // url = 'http://www.youtube.com/watch?v=VK4ah66jBvE&feature=feedu';
    // url ='http://www.youtube.com/watch?annotation_id=annotation_1450650773&feature=iv&src_vid=KRAMNWzfjcg&v=4ZHwu0uut3k'
    // url ='youtube.com/watch?annotation_id=annotation_1450650773&feature=iv&src_vid=KRAMNWzfjcg&v=4ZHwu0uut3k'
    var id = text.match(regex);
    if (id != null) {
        return id[1];
    } else {
        return null;
    }
}

/*
function escape_html( string )
{
    var pre = document.createElement('pre');
    var text = document.createTextNode( string );
    pre.appendChild(text);
    return pre.innerHTML;
}
*/

// -----------------------------------------------------------------------------
// Navigation
// -----------------------------------------------------------------------------

function navigate_to(hash) {
    XS.Router.navigate(hash);
}

function navigate_to_user(subpath) {
    XS.Router.navigate('/'+XS.me.username+subpath);
}


// -----------------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------------

function validate_email(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 


// param w:
//      "cm-1234"
//      "feet-1234-inch-1234"
//      ["cm",1234]
//      ["feet",1234,"inch",1234]
// return:
//      [cm,1234]
//      [feet,1234,inch,1234]
function convert_height(w, new_metrics) {

    if (typeof w != typeof []) {
        w = w.split('-');
    }

    var old_metrics = w[0];
    
    if (old_metrics == 'cm') {
        w[1] *= 1;
    }
    if (old_metrics == 'feet') {
        w[1] *= 1;
        w[3] *= 1;
    }

    if (old_metrics == new_metrics) {
        return w;
    }

    var cm = 0;
    switch(old_metrics) {
        case 'cm': 
            if (!isNumber(w[1]))
                return null;
            cm = w[1];
            break;
        case 'feet': 
            var feet = w[1];
            var inch = w[3];
            if (!isNumber(feet) || !isNumber(inch))
                return null;
            cm = feet * 30.48 + inch * 2.54;
            break;
        default:
            return null;
    }

    switch(new_metrics) {
        case 'cm': 
            return ['cm', cm];
        case 'feet':
            var feet = Math.floor(cm / 30.48);
            var inch = Math.round(((cm  - feet * 30.48) / 2.54));
            if (inch == 12) {
                inch = 0;
                feet += 1;
            }
            return ['feet', feet, 'inch', inch];
    }
}


// param w:
//      "kg-1234"
//      "stone-1234-lbs-1234"
//      ["kg",1234]
//      ["stone",1234,"lbs",1234]
// return:
//      [cm,1234]
//      [feet,1234,inch,1234]
function convert_weight(w, new_metrics) {

    if (typeof w != typeof []) {
        w = w.split('-');
    }

    var old_metrics = w[0];

    if (old_metrics == 'kg' || old_metrics == 'lbs') {
        w[1] *= 1;
    }
    if (old_metrics == 'stone') {
        w[1] *= 1;
        w[3] *= 1;
    }
    
    if (old_metrics == new_metrics) {
        return w;
    }

    var kg = 0;
    switch(old_metrics) {
        case 'kg': 
            if (!isNumber(w[1]))
                return null;
            kg = w[1];
            break;
        case 'lbs': 
            if (!isNumber(w[1]))
                return null;
            kg = w[1] * 0.45359237;
            break;
        case 'stone': 
            var stones = w[1];
            var lbs    = w[3];
            if (!isNumber(stones) || !isNumber(lbs))
                return null;
            kg = stones * 6.35029 + lbs * 0.45359237;
            break;
        default:
            return null;
    }

    switch(new_metrics) {
        case 'kg': 
            return ['kg', kg];
        case 'lbs': 
            return ['lbs', kg / 0.453592];
        case 'stone': 
            var stone = Math.floor(kg / 6.35029);
            var lbs   = ((kg  - stone * 6.35029) / 0.453592);
            return ['stone', stone, 'lbs', lbs];
    }
}

function get_weight_string(weight) {
    var w = weight;
    if (typeof w != typeof []) {
        w = w.split('-');
    }

    if (w[0] == 'kg')
        return (w[1] * 1).toFixed(1) + ' kg';
    if (w[0] == 'lbs')
        return (w[1] * 1).toFixed(0) + ' lbs';
    if (w[0] == 'stone') {
        w[1] = (w[1] * 1).toFixed(0);
        w[3] = (w[3] * 1).toFixed(1);
        if (w[1] == 0)
            return w[3] + ' lb';
        if (w[3] == 0)
            return w[1] + ' st ';
        else
            return w[1] + ' st ' + w[3] + ' lb';
    }
    else
        return '{err}'
}


function get_height_string(height) {
    var w = height;
    if (typeof w != typeof [])
        w = height.split('-');
    if (w[0] == 'cm')
        return w[1] + ' cm';
    if (w[0] == 'feet')
        return w[1] + '\'' + w[3] + '"';
    else
        return '{err}'
}


function get_weight_in_kg(weight) {
    var kg = convert_weight(weight, 'kg');
    return kg[1];
}

// -----------------------------------------------------------------------------
// Endless Scroll
// -----------------------------------------------------------------------------

// function near_bottom_of_page() {
//   return scroll_distance_from_bottom() < 150;
// }

// function scroll_distance_from_bottom(argument) {
//   return page_height() - (window.pageYOffset + window.innerHeight);
// }

// function page_height() {
//   return Math.max(document.body.scrollHeight, document.body.offsetHeight);
// }

function near_bottom_of_page(threshold) {
    return WL.doc.scrollTop() + WL.win.height() >= WL.doc.height() - threshold;
}

// -----------------------------------------------------------------------------
// Links Display
// -----------------------------------------------------------------------------

function get_short_link(link) {
    // if starts with http:// or https:// remove it
    var m = link.match(/^http:\/\/|^https:\/\//);
    if (m) {
        link = link.substr(m[0].length);
    }

    // if starts with www*. remove it
    var m = link.match(/^www[\d]*[.]/);
    if (m) {
        link = link.substr(m[0].length);
    }

    return link;
}

function get_full_link(link) {
    // if starts with http:// or https:// remove it
    var m = link.match(/^http:\/\/|^https:\/\//);
    if (m == null) {
        link = 'http://' + link;
    }

    return link;
}

function is_valid_url(url)
{
     // return url.match(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);
     return true;
}

// -----------------------------------------------------------------------------
// Random Art
// -----------------------------------------------------------------------------

function random_name() {
    var user_names = ['SuperWoman', 'BatMan', 'SuperMan', 'CatWoman', 'KenShiro', 'RokyIII', 'Terminatrix', 'Matrix', 'Catenaccio', 'Showman'];
    var names_dictionary = ['Superman', 'Wonderwoman', 'Barman', 'Spdierman', 'Bruce', 'Ironman', 'Godzilla', 'Kingkong', 'Obama', 'Aziz', 'Dreadd', 'Rambo', 'Terminator', 'Raul', 'Toki', 'Ken', 'Sautzer', 'Ryu', 'Mamia', 'Kioko'];
    var surnames_dictionary = ['Brambilla', 'Tozzi', 'Barak', 'Salvietti', 'Rossi', 'Bianchi', 'Springsteen', 'Kennedi', 'Lee', 'Johnson', 'Markson', 'Fifer', 'Willis', 'Sepultura', 'Armageddon', 'Berlusconi', 'Rodriguez'];

    var name = random_choice(names_dictionary);
    var surname = random_choice(surnames_dictionary);
    return name + ' ' + surname;
}

function random_sentence(word_count) {
    var ends_dictionary = ['.', '...', '!', '?', ' :-)', ' :-('];
    var words_dictionary = ['go','read','puck','write','run','lift','eat','drink','burn','tv','dumbell','weight','red','huge','small','good','ipad','cool'];

    word_count = word_count ? word_count : Math.floor(Math.random()*65536) % 30 + 3;
    var sentence = [];
    for(var i=0; i<word_count; ++i) {
        sentence.push(random_choice(words_dictionary));
    }
    sentence = sentence.join(' ') + random_choice(ends_dictionary);
    return sentence;
}

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

function story_uid_from_perspective_uid(perspective_uid) {
    // "0123456789_000000csTkiPjINPaP_publish" -> "000000csTkiPjINPaP"
    return perspective_uid.substring(11, 11 + XS.STORY_KEY_LENGTH);
}

// -----------------------------------------------------------------------------
// Hashtags
// -----------------------------------------------------------------------------

// function htmlize_hashtags(text) {
//     return text.replace(/(^|\W)#([a-z][_a-z\d]*[a-z\d])/ig, '$1<a href="#/hashtag/$2">#$2</a>');
// }

// does not include the #
function extract_hashtags(text) {
    var hashtag_regex = /(^|\W)(#[a-z][_a-z\d]*[a-z\d])/ig;
    // ",#ciao come va?" -> ",#ciao"
    // results contain also the part before #
    var results = text.match(hashtag_regex);
    // so we clean this up later
    if (results != null) {
        for(var i=0; i<results.length; ++i) {
            results[i] = results[i].match(/#[a-z][_a-z\d]*[a-z\d]/ig)[0].substring(1);
        }
    }
    return results !== null ? results : [];
}

function validate_hashtags(hashtags) {
    if (hashtags.length > XS.MAX_HASHTAG_COUNT) {
        return "Too many hashtags, maximum = " + XS.MAX_HASHTAG_COUNT;
    }
    for(var i=0; i<hashtags.length; ++i) {
        var hashtag = hashtags[i];
        if (hashtag.length < XS.MIN_HASHTAG_SIZE) {
            return 'Hashtag "#' + hashtag + '" too short, minimum = ' + XS.MIN_HASHTAG_SIZE + ' chars';
        }
        if (hashtag.length > XS.MAX_HASHTAG_SIZE) {
            return 'Hashtag "#' + hashtag + '" too long, maximum = ' + XS.MAX_HASHTAG_SIZE + ' chars';
        }
    }
    return null;
}

function get_group_name_linked(group) {
    if (group in XS.group_infos) {
        var groupname = XS.group_infos[group].name;
        var grouplabel = XS.group_infos[group].label;
        return F('<a href="#/groups/%s">%s</a>', groupname, grouplabel);
    } else {
        return 'unknown group'
    }
    
}

// ----------------------------------------------------------------------------
// long/short story uids conversions
// ----------------------------------------------------------------------------

function to_short_story_uid(uid) {
    return uid.match(/[0]{0,6}(.+)/)[1];
}

function to_long_story_uid(short_uid) {
    var rand_len = XS.STORY_KEY_LENGTH - XS.STORY_KEY_COUNTER;
    var digits_len = short_uid.length - rand_len;
    var rand_part = short_uid.substring(digits_len);
    var count_part = short_uid.substring(0, digits_len);
    if (count_part == '') {
        count_part = 0;
    }
    long_uid = F('%0'+XS.STORY_KEY_COUNTER+'d%s', count_part, rand_part)
    return long_uid;
}

function is_reply_uid(story_uid) {
    var reply_num = story_uid.substring(0, 6);
    return isNumber(reply_num) && reply_num*1 > 0;
}

function clear_selection() {
    if (window.getSelection && window.getSelection().empty) { // Chrome
        window.getSelection().empty();
    }
    else
    if (window.getSelection && window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
    }
    else 
    if (document.selection && document.selection.empty) {  // IE?
        document.selection.empty();
    }
}

function add_link_to_clipboard() {
    var body_element = document.getElementsByTagName('body')[0];
    var selection;
    selection = window.getSelection();
    var pagelink = "<br/>Read more at <a href='"+document.location.href+"'>"+document.location.href+"</a><br />";
    var copytext = selection + pagelink;
    var newdiv = document.createElement('div');
    newdiv.style.position='absolute';
    newdiv.style.left='-99999px';
    body_element.appendChild(newdiv);
    newdiv.innerHTML = copytext;
    selection.selectAllChildren(newdiv);
    window.setTimeout(function() {
        body_element.removeChild(newdiv);
    },0);
}

function fb_share_popup(url) {
    var winWidth  = screen.width / 1.5;
    winWidth = Math.max(winWidth, 480);
    var winHeight = screen.height / 2;
    var winTop    = (screen.height / 2) - winHeight / 1.5;
    var winLeft   = (screen.width  / 2) - winWidth  / 2;
    window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(url), 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}

function tw_share_popup(url, text) {
    // trim text
    var t_co_link_len = 25;
    var via_len       = 17; // ' via @WorthyLikes'
    var ellip_len     = 1;  // '…'
    var safe_len = 140 - ellip_len - t_co_link_len - via_len;
    if (text.length > safe_len) {
        text = text.substring(0,safe_len).trim() + '…';
    }

    var winWidth  = screen.width / 1.5;
    winWidth = Math.max(winWidth, 480);
    var winHeight = screen.height / 2;
    var winTop    = (screen.height / 2) - winHeight / 1.5;
    var winLeft   = (screen.width  / 2) - winWidth  / 2;
    window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(url) + '&via=WorthyLikes', 
        'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
}

function human_readable_file_size(size) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function safe_json_parse(json) {
    try {
        return JSON.parse(json);
    } catch(err) {
        throw "Json parse error: " + err.message + "\njson: " + json; 
    }
}

var err_callback = function(xhr) {
    var data = safe_json_parse(xhr.responseText);
    alert(data.message);
}
