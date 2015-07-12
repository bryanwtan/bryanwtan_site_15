var request = require('request')
    , facebook_keys = require('./keys.json')
    , fs = require('fs')
    , fb_response_file = 'facebook.json'
    , fb_graph_file = './public/facebook/graph.json'
    , CronJob = require('cron').CronJob;

// setup for d3 force graph
var list_to_match_against = []
    , all_name_map = []
    , link_map = {}
    , name_map = {}
    , new_graph = { "nodes": [], "links": [] };

// get some new data and save to JSON every day at 4am
new CronJob('0 30 3 * * *', function() {
    request('https://graph.facebook.com/photographybybryan/albums?key=value&access_token='
        + facebook_keys.facebook.appID + '|' + facebook_keys.facebook.appSecret
        + '&fields=likes.summary(true),name,link,count,comments.summary(true)'
        , function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            fs.writeFile(fb_response_file, body, function(err) {
                if(err) {
                  console.log(err);
                } else {
                  console.log("New Facebook data " + fb_response_file);
                }
            });
        }
    });
}, null, true, 'America/New_York');

new CronJob('0 0 4 * * *', function() {
    var read_facebook_json = require('./' + fb_response_file)
    // read the facebook.json response
    var keys = Object.keys(read_facebook_json)
        , related_albums = [];
    read_new_graph();
}, null, true, 'America/New_York');

function read_new_graph() {
    read_facebook_json[keys[0]].forEach(
        find_related_albums // ignore cover photo and profile pic albums
    );
    read_elements(related_albums[0], 0, related_albums.length);
};

function find_related_albums(element, index, array) {
    if(element.name.indexOf('Seniors') > -1) {
        related_albums.push(element);
    }
};

function read_elements(element, index, array) {
    var like_count = element['likes']['summary']['total_count']
        , node_obj = {};

    node_obj.like_radius = Math.floor(like_count/3 + 5);
    node_obj.name = element['name']; // album name
    node_obj.group = Math.floor(element.count/10); // pic ct color
    node_obj.link = element['link']; // link to album

    map_of_names(element, index);
    map_of_comment_names(element, index);

    new_graph['nodes'].push(node_obj);
    if(index < array - 1) {
        read_elements(related_albums[index + 1], index + 1, array)
    } else {
        // after the nodes have been created, make links
        push_links();
        fs.writeFile(fb_graph_file, JSON.stringify(new_graph, null, 4), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("JSON saved to " + fb_graph_file);
            }
        });
    }
};

function map_of_names(element, index) {
    element['likes']['data'].forEach( function(like_set, i) {
        var name = like_set['name'];
        // link nodes with shared name likes
        if (name_map.hasOwnProperty(name)) {
            name_map[name].push(index)
        } else { name_map[name] = [index] }
    });
}

function map_of_comment_names(element, index) {
    element['comments']['data'].forEach( function(comment_set, i) {
        var name = comment_set['from']['name'];
        // link nodes with shared name likes
        if (name_map.hasOwnProperty(name)) {
            name_map[name].push(index)
        } else { name_map[name] = [index] }
    });
}

function push_links(){
    // clean out the keys that dont have multiple nodes
    var keys_in_name_obj = Object.keys(name_map)
    for( i = 0; i < keys_in_name_obj.length; i++) {
        if(name_map[keys_in_name_obj[i]].length == 1) {
            delete name_map[keys_in_name_obj[i]];
        }
    }
    keys_in_name_obj = Object.keys(name_map)
    keys_in_name_obj.forEach(
        node_linking
    );
}

function node_linking(element, index, array) {
    // console.log(element)
    var newLink
        , newLinkHash
        , albumIds;
    albumIds = name_map[element];
    for(i = 1; i < albumIds.length; i++) {
        for(j = 0; j < i; j++) {
            newLink = {
              source: albumIds[i],
              target: albumIds[j],
              value: 1
            };
            newLinkHash = generate_link_hash(newLink);
            if (link_map[newLinkHash]) {
                link_map[newLinkHash].value++;
            } else {
                link_map[newLinkHash] = newLink;
                new_graph['links'].push(newLink); // create new link
            }
        }
    }
};

function generate_link_hash(link) {
    if (link.source < link.target) {
        return link.source + ',' + link.target;
    } else {
        return link.target + ',' + link.source;
    }
}

function existing_keys(object, key) {
    if ( object[key] != undefined ){
        return Object.keys(object[key])
    } else { return 0 }
};
