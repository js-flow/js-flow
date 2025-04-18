function loadURLDropDown() {
    $('#flowUrls').append(`
        <option value="">Select One...</option>
        <option value="flows/floating.json">Octopus</option>
        <option value="flows/flowchart.json">Flow Chart</option>
        <option value="flows/swimlanes.json">Swim Lanes</option>
        <option value="flows/flow2.json">Marketing Flows</option>
    `);
    //get flow names or use default value
    var flowNames = localStorage.getItem("flows") || `{"flows":[{"name":"Flow 1"},{"name":"Flow 2"},{"name":"Flow 3"},{"name":"Flow 4"},{"name":"Flow 5"}]}`
    flowNames = JSON.parse(flowNames);
    populateFlowDropDown(flowNames);
}

function populateFlowDropDown(_flowNames, index) {
    _flowNames.flows.forEach(function(item, index){
        $('#flowNames').append(`<option value="${index}">${item.name}</option>`);
    })
}

