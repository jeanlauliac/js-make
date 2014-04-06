'use strict';

var Node = require('./node');
var Edge = require('./edge');
var makeError = require('./make-error')({
    DUP_COMMANDS: 'duplicate commands for target "%s"'
});

module.exports = Graph;

function Graph() {
    this._nodes = {};
    this._edges = [];
}

Graph.prototype.addNode = function (filePath) {
    if (this.nodes.hasOwnProperty(filePath)) return this._nodes[filePath];
    var node = new Node(filePath);
    return node;
};

Graph.prototype.addEdge = function (fromNodes, toNode, commands) {
    var edge = new Edge(fromNodes, toNode, commands);
    if (toNode.edgeIn !== null)
        throw makeError('DUP_COMMANDS', toNode.filePath);
    toNode.edgeIn = edge;
    for (var i = 0; i < fromNodes.length; ++i)
        fromNodes[i].edgesOut.push(edge);
    this._edges.push(edge);
    return edge;
};
