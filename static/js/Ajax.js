(function() {
'use strict';

window.XS = window.XS == undefined ? {} : window.XS;

XS.Ajax = function(params) {
    var defaults = {
        onsuccess: function() {},
        onerror:   function() {},
        onloadend: function() {},
        data: {},
        url: '',
        async: true,
        is_multipart_form: false,
    };

    params = apply_defaults(params, defaults);

    this.xhr = null;
    this.aborted   = false;
    this.onsuccess = params.onsuccess;
    this.onerror   = params.onerror;
    this.onloadend = params.onloadend;
    this.data      = params.data;
    this.url       = params.url;
    this.async     = params.async;
    this.is_multipart_form = params.is_multipart_form;
}

XS.Ajax.prototype.abort = function() {
    if (this.aborted != true && this.xhr != null) {
        this.aborted = true;
        this.xhr.abort();
    }
}

XS.Ajax.prototype.get = function() {
    // compile data to be sent
    var self = this;

    assert(this.is_multipart_form === false);

    var params = []
    for(var k in self.data) {
        var v = self.data[k];
        // important: skip null values otherwise they get string encoded to 'null' while we want them to BE null.
        if (v === null) {
            continue;
        }
        var param = F('%s=%s', k, encodeURIComponent(v));
        params.push(param);
    }
    var query = params.length == 0 ? '' : '?' + params.join('&');

    var xhr = new XMLHttpRequest();
    self.xhr = xhr;
    xhr.onreadystatechange = function () {
        // 0: request not initialized 
        // 1: server connection established
        // 2: request received 
        // 3: processing request 
        // 4: request finished and response is ready
        // aborted requested don't call any callback
        if (self.aborted == false) 
        {
            if (xhr.readyState == 4) {
                self.onloadend(xhr);
                if (xhr.status == 200) {
                    self.onsuccess(xhr);
                } else {
                    self.onerror(xhr);
                }
            }
        }
    }

    // xhr.addEventListener("loadend", loadend, false);
    xhr.open('GET', self.url + query, self.async);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
    xhr.send(null);
}

XS.Ajax.prototype.post = function() {
    // compile data to be sent
    var self = this;

    var data = null;

    // case where data is 'new FormData()'
    if (self.is_multipart_form === true) {
        data = self.data;
    } else {
        var params = []
        for(var k in self.data) {
            var v = self.data[k];
            // important: skip null values otherwise they get string encoded to 'null' while we want them to BE null.
            if (v === null) {
                continue;
            }
            var param = F('%s=%s', k, encodeURIComponent(v));
            params.push(param);
        }
        data = params.join('&');
    }

    var xhr = new XMLHttpRequest();
    self.xhr = xhr;
    xhr.onreadystatechange = function () {
        // 0: request not initialized 
        // 1: server connection established
        // 2: request received 
        // 3: processing request 
        // 4: request finished and response is ready
        if (xhr.readyState == 4) {
            self.onloadend(xhr);
            if (xhr.status == 200) {
                self.onsuccess(xhr);
            } else {
                self.onerror(xhr);
            }
        }
    }

    // xhr.addEventListener("loadend", loadend, false);
    xhr.open('POST', self.url, self.async);
    if (self.is_multipart_form == false) {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
    }
    xhr.send(data);
}
})();