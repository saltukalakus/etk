
Esq = require('esq');
module.exports = Etk;

function Etk(client, opt) {
    this.client = client;
    // Add tk namespace to elastic search object.
    this.client.tk = this.client.tk || {

        /**
         * Searches the key-value pair. Returns result to the callback
         * function.
         *
         * @example
         * elastic = require('elasticsearch');
         * Etk = require('etk');
         * var client = elastic.Client({hosts: ['localhost:9200']});
         * client = Etk(client, {index: "myindex", type: "mytype"});
         * client.tk.search("foo", "bar", function (err, resp) {
         *     ...
         * });
         * @param key {string} Key to search
         * @param value {string} Value of the key
         * @param cb {function} Callback function of signature (err, resp)
         */
        search: function (key, value, cb) {
            var esq = new Esq();
            esq.query("query", "filtered", "query", "match", key, value);
            var query = esq.getQuery();
            this.client.search({
                body: query},
                cb);
        },

        /**
         * Searches the key-value pair for the last number of days.
         * Returns result to the callback function.
         *
         * @param key {string} Key to search
         * @param value {string} Value of the key
         * @param days {number} Number of days back to search
         * @param cb {function} Callback function of signature (err, resp)
         */
        searchLastDays: function (key, value, days, cb) {
            var esq = new Esq();
            var search_days = "now-" + days.toString() + "d/d";
            esq.query("query", "filtered", "query", "match", key, value);
            esq.query("query", "filtered", "filter", "range", this.time_field, "gte", search_days);
            var query = esq.getQuery();
            this.client.search({
                body: query},
                cb);
        }
        /*
        ,

        searchBetween: function (key, value, start, end, cb) {
            var json_data = {"query": {
                "filtered": {
                    "query": {
                        "match": {
                            "foo": 1
                        }
                    },

                    "filter": {
                        "numeric_range": {
                            "@timestamp": {
                                "lt": "2015-06-30",
                                "gte": "2015-06-01"
                            }}}
                }
            }};
            this.client.search({
                    body: json_data},
                cb);
        }
        */
    };

    // Store elastic search client for etk use
    this.client.tk.client = this.client;
    // Default time field is Logstash compatible
    this.client.tk.time_field = opt.time_field || "@timestamp";
    // Default searches "all" available index
    this.client.tk.index = opt.index || "*";
    // Default searches "all" available types
    this.client.tk.type = opt.type || "*";
    return this.client;
}
