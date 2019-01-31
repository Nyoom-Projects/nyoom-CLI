module.exports = function unirest_prom(unirest_req, always_resolve) {
    // Returns a Promise by wrapping a unirest.Request object in
    // a Promise that immediately calls `.end(...)`
    //
    // Params:
    //
    // *   unirest_req - unirest.Request - any unirest Request object that has
    //                   not yet had `.end(...)` called on it
    // *   always_resolve - bool (optional) - defaults to `false`, iff `true` then
    //                      the Promise always resolves--even when the request fails
    //                      (since HTTP errors are encapsulated in the `response`
    //                      object). A unirest.Response object is passed to either
    //                      `resolve` or `reject`.
    //
    return new Promise((resolve, reject) => {
        unirest_req.end(r => {
            return ((always_resolve === true ||
                (r.status >= 200 && r.status < 300)) ?
                resolve(r) :
                reject(r));
        });
    });
};
