'use strict';

module.exports = Edge;

function Edge(fromNodes, toNode, commands) {
    Object.defineProperty(this, 'fromNodes', {value: fromNodes.slice()});
    Object.defineProperty(this, 'toNode', {value: toNode});
    Object.defineProperty(this, 'commands', {value: commands.slice()});
}
