var cnt = 0;
var nodes;
var lines;

$.fn.extend({
    cssAsInt: function(_cssProp){
        return parseInt(this.css(_cssProp))
    }
})    

$(document).ready(function(){
    console.log('doc ready in default.js')
    $(document).on('click',".widget", function(){
        // fires when a widget gets clicked
         if ( $(this).attr('id') === "widgetAddNode") {
            // add Node
            var nodeCount = nodes.length;
            nodes.push({"top":"100px","left":"100px","id":"div" + nodeCount+1});
            drawNodes(nodes);
         }
         if ( $(this).attr('id') === "widgetClearSVG") {
            $("svg").empty();
         }
         if ( $(this).attr('id') === "widgetClearNodes") {
            $(".node").remove();
         }
         if ( $(this).attr('id') === "widgetDrawNodes") {
            drawNodes();
         }


    })
    $(document).on('click',".node", function(){
        // fires when a widget gets clicked
        console.log('node click...');
        $(".node").removeClass('selectedBorder')
        $(this).addClass('selectedBorder');
    })
    $(document).on('click',"svg,path,circle", function(){
        $(".node").removeClass('selectedBorder')
    })

})

function createNode() {
    return $(`<div class="node"><div>Drag Me!</div><div>Content</div></div>`);
}

function drawNodes() {
    //$('#main').empty();
    // clear out nodes to avoid dupes - 
    // TODO: Make this smarter by checking to see if node exists and not
    // adding it in that case
    $(".node").remove();

    nodes.forEach(function(item){
        $('#main').append(createNode()
        .css({'top':item.top,'left':item.left})
        .attr('id',item.id))
    })

    $('.node').draggable({ 
        grid: [ 20, 20 ], 
        stop: function(event, ui) {
            drawLines();
        }
    })

}

function drawLines() {
    console.log('here in drawLines');
    $("svg").empty();
    lines.forEach(function(item){
        drawLine(item.fromDiv,item.toDiv,'',item.id)
    })
    addSVGListeners();
}


function addRedrawButton() {
    $('#main').append( $(`<div class="redraw"><button class="btnRedraw">Re-Draw</button></div>`) );
    $(".btnRedraw").on('click', drawLines)
}
function addControls() {
    $('#main').append($(`
        <div class="controls">
            <button class="button" id="btnSave">Save</button>
            <button class="button" id="btnLoad">Load</button>
        </div>`));
}
function addWidgets() {
    $('#main').append($(`
        <div class="widgets">
            <div class="widget" id="widgetAddNode">Add Node</div>
            <div class="widget" id="widgetAddLine">Add Line</div>
            <div class="widget" id="widgetClearLine">Clear Line</div>
            <div class="widget" id="widgetClearSVG">Clear SVG</div>
            <div class="widget" id="widgetClearNodes">Clear Nodes</div>
            <div class="widget" id="widgetDrawNodes">Draw Nodes</div>
        </div>`))
}

function addSVGListeners() {
    $('svg').on('click', function(){
        console.log('svg click');
        $(".node").removeClass('selectedBorder')
        $('path').css("stroke-width", 1).css("stroke","#aaa")
        event.stopPropagation();
    })

    $('svg > path').on('click', function(){
        console.log('path click');
        console.log($(this).attr('id'));
        $(".node").removeClass('selectedBorder')
        $('path').css("stroke-width", 1).css("stroke","#aaa")
        $(this).css("stroke-width", 1).css("stroke","black")
        event.stopPropagation();
    })
    
    $('svg > circle').on('click', function(){
        console.log('circle click');
        $(".node").removeClass('selectedBorder')
        // $('path').css("stroke-width", 1).css("stroke","#aaa")
        // $(this).css("stroke-width", 1).css("stroke","black")
        event.stopPropagation();
    })
}

function createSVGCircle(x, y, radius, fillColor) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg',"circle");  
    circle.setAttribute("cx", x)
    circle.setAttribute("cy", y)
    circle.setAttribute("r", radius)
    circle.setAttribute("fill", fillColor)
    return circle;
}

function createSVGPath(pathData, strokeColor, fillColor) {
    var newpath = document.createElementNS('http://www.w3.org/2000/svg',"path");  
    newpath.setAttribute("d", pathData);  
    newpath.setAttribute("stroke", `#aaa`);
    newpath.setAttribute("stroke-width", 1);  
    newpath.setAttribute("fill", `transparent`);  
    // newpath.setAttribute("id", cnt);
    // cnt += 1;  
    return newpath;
}

function getCurveBoundingBoxPoints(beginDiv, endDiv, mode = "") {
    
    if (mode === "") {
        var top = $(beginDiv).cssAsInt("top") + $(beginDiv).cssAsInt("height") / 2
        var left = $(beginDiv).cssAsInt("left") + $(beginDiv).cssAsInt("width")
        var width = $(endDiv).cssAsInt("left") - left;
        var height = $(endDiv).cssAsInt('top') - top + ($(endDiv).cssAsInt('height') / 2);
    }
    
    if (mode === "vert") {
        var top = $(beginDiv).cssAsInt("top") + $(beginDiv).cssAsInt("height");
        var left = $(beginDiv).cssAsInt("left") + ( $(beginDiv).cssAsInt("width") / 2 );
        console.log(left);
        var width = $(endDiv).cssAsInt('left') - $(beginDiv).cssAsInt('left');
        var height = $(endDiv).cssAsInt('top') - top;
    }
    
    return {"top":top,"left":left,"width":width,"height":height}
}

function drawLine(beginDiv, endDiv, mode, lineId) {
    var points = getCurveBoundingBoxPoints(beginDiv, endDiv, mode);

    // pull properties out of object for brevity later in code
    var { left, top, width, height } = points;
    if (mode === "") {
        var pathData = `M ${left} ${top} C ${left+(width/2)} ${top}, ${left+(width/2)} ${top+height}, ${left+width} ${top+height}`
    }
    if (mode === "vert") {
        var pathData = `M ${left} ${top} C ${left} ${top+(height/2)}, ${left+width} ${top+(height/2)}, ${left+width} ${top+height}`
    }

    var newPath = createSVGPath(pathData, "#aaa","transparent")
    newPath.setAttribute("id", lineId);

    document.getElementById('svgcontainer').appendChild(newPath);

    if (mode === "vert") {
        top += 3
        height -= 6;
    }
    if (mode === "") {
        left +=3;
        width -=6;
    }
    // draw a connector on each "node" and draw a smooth bezier between those 'control points'
    var newcircle = createSVGCircle(left, top, 4, "#aaa")
    document.getElementById('svgcontainer').appendChild(newcircle);

    var newcircle = createSVGCircle(left+width, top+height, 4, "#aaa")
    document.getElementById('svgcontainer').appendChild(newcircle);
}

