'use strict';

module.exports = makeGraph;

var Graph = require('graph');

function makeGraph(file, targets) {
    var graph = new Graph();
    addTargets(graph, targets);
}

function addTargets(graph, targets) {
    for (var i = 0; i < targets.length; ++i) {
        graph.addNode(targets[i]);
    }
}



    var self = this;
    var prereq = this._rulePrereq.map(function (filePath) {
        return self.state.addNode(filePath);
    });
    for (var i = 0; i < this._ruleTargets; ++i) {
        var node = this.state.addNode(this._ruleTargets[i]);
        this.state.addEdge(prereq, node, this._ruleCommands);
    }



var file = read(stream('fu.mk'));
makeGraph(file, function (err, graph) {

});
