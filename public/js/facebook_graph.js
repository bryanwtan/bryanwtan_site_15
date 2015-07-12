// library: http://d3js.org/
// chart: https://github.com/mbostock/d3/wiki/Force-Layout

var color = d3.scale.category20() // colors
    , force = d3.layout.force(); // forces and links

var svg = d3.select('#fb_graph') // append to photos div
    .append('svg');
$('#fb_graph').append('<br>').append('<br>');

resize();
d3.select(window).on('resize', resize);

d3.json('facebook/graph.json', function(error, graph) { // read data
    if (error) throw error;

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .gravity(0.1)
        .start();

    var link = svg.selectAll('.link') // create links
        .data(graph.links)
        .enter().append('line')
        .attr('class', 'link')
        .style('stroke-width', function(d) { return Math.pow(d.value, 2) });

    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ? true : false;
    var node = svg.selectAll('.node') // create nodes
        .data(graph.nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', function(d) { return d.like_radius })
        .style('fill', function(d) { return color(d.group); })
        .on('dblclick', openLink) // click to go to page
        .call(force.drag);

    function openLink(d, i) {
        if(!isMobile){
            window.open(d.link, '_blank');
        }
    }

    force.on('tick', function() { // coordinates
        link.attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node.attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
    });

    var linkedByIndex = {}; // array logging connections
    for (i = 0; i < graph.nodes.length; i++) {
        linkedByIndex[i + ',' + i] = 1;
    };
    graph.links.forEach(function (d) {
        linkedByIndex[d.source.index + ',' + d.target.index] = 1;
    });
});

function resize() {
    var width = $('#fb_graph').width()
        , height = $('#graph_descriptor').height()
        , scale = Math.min(height, width)

    svg.attr('width', width).attr('height', height);
    force
        .size([width, height])
        .charge(-scale*2)
        .chargeDistance(scale/4)
        .linkDistance(scale/8)
        .start();
}
