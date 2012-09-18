/* create the cache */
var cache = new ajaxCache(5000);

/**** caching framework class ****/

/* constructor */

function ajaxCache(timeout) {
    if (timeout != null) {
        this.defaultTimeout = timeout;
    }
}

/* initial values, init items and defaultTimeout */
ajaxCache.prototype.items = Object();
ajaxCache.prototype.defaultTimeout = 30000; /* 30 seconds */

/* put function */
ajaxCache.prototype.put = function(url, data, response, lifetime) {
    if (lifetime == null) {
        lifetime = this.defaultTimeout;
    }

    /* generate a key, why the brackets here? */
    var key = this.generate_key(url, [data]);

    /* store object with key response and expire time */
    this.items[key] = Object();
    this.items[key].response = response;
    this.items[key].expiresAt = (new Date().getTime()) + lifetime;
    return true;
}

/* get function */
ajaxCache.prototype.get = function(url, data) {

    /* generate key */
    var key = this.generate_key(url, data);

    /* check if there is a entry for the key */
    if (this.items[key] == null) return false;

    /* check if cache is expired */
    if (this.items[key].expiresAt < (new Date().getTime())) { /* delete object */
        delete this.items[key];
        return false;
    }

    /* return the response from cache */
    return this.items[key].response;
}

/* key generation from url and params */
ajaxCache.prototype.generate_key = function(url, data) {
    var key = url + JSON.stringify(data);
    return key;
};

/**** ajax test code ****/

function ajax(url, data) {

    var cachedResponse = cache.get(url, [data]);
    if (cachedResponse !== false) { /* show info for debugging */     
        /* update element with cached data */
        show_response(cachedResponse, $('post'), true);
    }
    else { /* send ajax request through mooTools Request.JSON */
        new Request.JSON({
            url: url,
            data: {
                json: JSON.encode(data),
                delay: 2
            },
            onSuccess: function(response) {

                /* store responce in cache */
                cache.put(url, data, response);

                /* update element with received data */
                show_response(response, $('post'), false);
            }
        }).send();
    }
}

/* ajax callback function */
show_response = function(obj, target, cached) {

    if(cached)
    {
        el = new Element('li', {
            text: 'cached Result:'
        }).inject($('post'));

    }
    else 
    {
        el = new Element('li', {
            text: 'request Result:'
        }).inject($('post'));
    }
    /* why does this work using $H ? */
    $H(obj).each(function(x, y) {
        new Element('li', {
            text: y + '=' + x
        }).inject(target);
    });

    /* flash to show update */
    target.highlight();

    $('update').removeAttribute('disabled');

};

/* example data to send and receive through jsFiddle echo service */
var dat = {
    text: 'Hallo Matze!',
    name: 'Horst Schröter ist auch dabei!',
    array: [1, 2],
    description: 'komplexes JSON object',
    object: {
        par1: 'Status',
        par2: [3, 2, 123],
        par3: {}
    }
};

/* Update button callback function */

function update() {

    /* at first empty div */
    $('post').empty();

    /* disable update button for the time being */
    $('update').setAttribute('disabled', true);

    /* execute ajax request */
    ajax('/echo/json/', dat);
}​