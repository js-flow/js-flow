// this should be placed in the orgchart.js file and get called from that.
var jsFlow;

function renderJiraContent(_item) {
    return `
        <div class="content content-parent ${_item.data.state}">
            <div  class="content title-text">${_item.data.title}</div>
            <div  class="content content-text jira-desc">${_item.data.content}</div>
            <div  class="content jira-item-type">User Story</div>
            <div class="jira-status-parent">
                <table width="100%">
                    <tr>
                        <td width="40%"><div class="status-bar-parent"><div>&nbsp;</div></div></td>
                        <td width="40%"><div> &nbsp; 8 hrs left</div></td>
                        <td align="right"><img src="https://randomuser.me/api/portraits/women/4.jpg" /></td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="content"></div>
    `
}

function onNodeDragStop(_this) {
    var nodeId = _this.attr('id');
    var nodeIndex = jsFlow.getNodeIndexById(nodeId);
    var state = "";

    if ( jsFlow.isInside(nodeId, 'divApproved') ) {
        state = 'approved'
    } else if ( jsFlow.isInside(nodeId, 'divInProgress') )  {
        state = 'in-progress'
    } else if ( jsFlow.isInside(nodeId, 'divReadyForTest')) {
        state = 'ready-for-test'
    } else if ( jsFlow.isInside(nodeId, 'divPreProd')) {
        state = 'pre-prod'
    }

    jsFlow.nodes[nodeIndex].data.state = state;
    jsFlow.updateNode(nodeId)
    jsFlow.saveInfo();
}

function setJsFlow(_jsflow) {
    jsFlow = _jsflow;
}

export {
    setJsFlow,
    renderJiraContent,
    onNodeDragStop
}