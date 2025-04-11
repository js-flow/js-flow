// this should be placed in the orgchart.js file and get called from that.
function renderOrgChartContent(_item) {
    return `
        <div class="content orgPhoto">
            <img src="https://randomuser.me/api/portraits/women/4.jpg" class="photo" />
            <span  class="text">${_item.data.content}</span>
        </div>
        <div class="content orgDesc">IT Development</div>
    `
}


