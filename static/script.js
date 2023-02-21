const GOOGLE_API = 'YOUR_API_KEY'
const YELP_API = 'YOUR_API_KEY'
var direction = [1, 1, 1];

function checkBox(){
    const locbox = document.getElementById("box");
    const loc = document.getElementById("location");
    if(locbox.checked){
        loc.disabled = locbox.checked;
        loc.value = '';
        loc.style.backgroundColor = '#CCCCCC';
    }
    else{
        loc.disabled = locbox.checked;
        loc.style.backgroundColor = '#ffffff';
    }
}

function handleSubmit(e){
    e.preventDefault();    
    const key = document.getElementById("keyword");
    const dist = document.getElementById("distance");
    const cat = document.getElementById("category");
    const loc = document.getElementById("location");
    const locbox = document.getElementById("box");
    var xml = new XMLHttpRequest();
    let location = null;
    let url='';
    if(loc.value=='' && locbox.checked){
        var xml1 = new XMLHttpRequest();
        var loc_url = `https://ipinfo.io/json?token=${YELP_API}`
        xml1.open('GET', loc_url, true);
        xml1.send();
        xml1.onreadystatechange = () => {
            
            if (xml1.readyState === XMLHttpRequest.DONE) {
              const status = xml1.status;
              if (status === 0 || (status >= 200 && status < 400)) {
                
                location = JSON.parse(xml1.responseText).loc
                let category = cat.value.replaceAll(" ", "+");
                url = "/results?keyword=" + key.value + "&distance=" + dist.value + "&category=" + category + "&location=" + location 
                xml.open('GET', url, true);
                xml.send();
              } else {
                
              }
            }
          };
    }
    else{

        var xml1 = new XMLHttpRequest();
        var loc_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + loc.value + '&key=' + GOOGLE_API
        xml1.open('GET', loc_url, true);
        xml1.send();
        xml1.onreadystatechange = () => {

            if (xml1.readyState === XMLHttpRequest.DONE) {
              const status = xml1.status;
              if (status === 0 || (status >= 200 && status < 400)) {
                if(JSON.parse(xml1.responseText).results[0]){
                    location = JSON.parse(xml1.responseText).results[0].geometry.location
                    let temp = String(location.lat) + "," + String(location.lng)
                    url = "/results?keyword=" + key.value + "&distance=" + dist.value + "&category=" + cat.value + "&location=" + temp 
                    xml.open('GET', url, true);
                    xml.send();
                }
                else{
                    $('#no-results').remove();
                    $('.no-records ').append(`<p id="no-results">No records have been found.</p>`);
                }
                
              } else {

              }
            }
          };
    }   
    xml.onreadystatechange = () => {
        if (xml.readyState === XMLHttpRequest.DONE) {
            const status = xml.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                var d1 = document.getElementById('results');     
                businesses = JSON.parse(xml.responseText).businesses;
                $('#no-results').remove();
                $('#results-card').remove();
                if(businesses.length == 0){
                    $('.no-records ').append(`<p id="no-results">No records have been found.</p>`);
                }
                else{
                    var tablestart = `<div id="results-card">
                    <table id="res-table" style="width:100%">
                    <tr style="height: 50px;">
                        <th>No.</th>
                        <th style="width: 100px">Image</th>
                        <th style="cursor: pointer;" onclick='sortTable(2)'>Business Name</th>
                        <th style="cursor: pointer;" onclick='sortTable(3)'>Rating</th>
                        <th style="cursor: pointer;" onclick='sortTable(4)'>Distance (miles)</th>
                    </tr>`;
                    let index = 1;
                    let distance = null;
                    var content = tablestart;
                    for(business of businesses){
                        distance = business['distance']/1609;
                        content += `<tr>
                        <td>${index}</td>
                        <td><img src=${ business['image_url'] } alt="" height=100 width=100></td>
                        <td id="business-url"><a href="#business-card" onclick="getBusinessDetails('${business['id']}')"">${ business['name'] }</a></td>
                        <td id="rating">${ business['rating'] }</td>
                        <td id="distance">${distance.toFixed(2)}</td>
                    </tr>`;
                    index += 1;
                    }
                    content += "</table></div>";
                    $('#results ').append(content);
                    window.scrollTo(0, 590);
                }
                
            } else {
                alert("error");
            }
        }
    };
}

function sortTable(column) {
    var table, rows, switching, i, x, y, shouldSwitch;
    const id = column - 2;
    table = document.getElementById("res-table");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[column];
        y = rows[i + 1].getElementsByTagName("td")[column];
        if(column>3){
            if(direction[id]===1) {
                if (compareNumbers(x, y)>0) {
                    shouldSwitch = true;
                    break;
                  }
            }
            else if(direction[id] === -1){
                if (compareNumbers(x, y)<0) {
                    shouldSwitch = true;
                    break;
                  }
            }
        }
        else {
            if(direction[id]===1) {
                if (x.innerText.toLowerCase() > y.innerText.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                  }
            }
            else if(direction[id] === -1){
                if (x.innerText.toLowerCase() < y.innerText.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                  }
            }
        }
        
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
    if(direction[id]===1){
        direction[id] = -1;
    }else if(direction[id] === -1){
        direction[id] = 1;
    }
  }

function compareNumbers(a, b)
{
  return a.innerText.toLowerCase() - b.innerText.toLowerCase();
}

function getBusinessDetails(id){
    url = "/details?id=" + id;
    xml = new XMLHttpRequest();
    xml.onreadystatechange = () => {
        if (xml.readyState === XMLHttpRequest.DONE) {
            const status = xml.status;
            if (status === 0 || (status >= 200 && status < 400)) {
                details = JSON.parse(xml.responseText);
                var open;
                if(details.hours[0].is_open_now){
                    open = "Open Now";
                }
                else {
                    open = "Closed"
                }
                var category='';
                categories = details.categories;
                for(let i=0; i<details.categories.length-1; i++){
                    category += categories[0].title + " | ";
                }
                category += categories[categories.length-1].title;
                var address='';
                for(ad of details.location.display_address){
                    address += " " + ad;
                }
                var transactions = '';
                if(details.transactions.length == 2){
                    transactions = capitalize(details.transactions[0]) + ' | ' + capitalize(details.transactions[1]);
                }else if(details.transactions.length==1){
                    transactions = capitalize(details.transactions[0]);
                }else{
                    
                }
                
                var content = `<div id="business-card">
                <p id="title">${details.name}</p>
                <hr style="color: lightgrey; width:95%;text-align:left; margin-left: auto; margin-right: auto; margin-bottom: 30px;">
                <div class="row">`
                var j = 0;
                if(details.hours[0].is_open_now!=undefined){
                    content+=`<div class="column">
                        <span id="col-1">Status</span><br>
                        <span id="col-2" style=""><p id="status">${open}</p></span><br>       
                    </div>`;
                    j++;
                }
                if(category!=undefined){
                    content += `<div class="column">
                        <span id="col-1">Category</span><br>
                        <span id="col-2">${category}</span><br>
                    </div>`
                    j++;
                    if(j%2==0){
                        content += `</div>
                        <div class="row">`
                        j=0;
                    }
                }
                if(address!=undefined){
                    content += `<div class="column">
                        <span id="col-1">Address</span><br>
                        <span id="col-2">${address}</span><br>
                    </div>`;
                    j++;
                    if(j%2==0){
                        content += `</div>
                        <div class="row">`
                        j=0;
                    }
                }
                if(details.display_phone){
                    content += `<div class="column">
                    <span id="col-1">Phone Number</span><br>
                    <span id="col-2">${details.display_phone}</span><br>
                    </div>`
                    j++;
                    if(j%2==0){
                        content += `</div>
                        <div class="row">`
                        j=0;
                    }
                }
                if(transactions){
                    content += `<div class="column">
                    <span id="col-1">Transactions Supported</span><br>
                    <span id="col-2">${transactions}</span><br>
                    </div>`
                    j++;
                    if(j%2==0){
                        content += `</div>
                        <div class="row">`
                        j=0;
                    }
                }
                if(details.price){
                    content += `<div class="column">
                    <span id="col-1">Price</span><br>
                    <span id="col-2">${details.price}</span><br>
                    </div>`
                    j++;
                    if(j%2==0){
                        content += `</div>
                        <div class="row">`
                        j=0;
                    }
                }
                if(details.url){
                    content += `<div class="column">
                    <span id="col-1">More info</span><br>
                    <span id="col-2"><a href=${details.url} target="_blank">Yelp</a></span><br>
                    </div>
                    </div>`
                }
                
                content += `<div class="business-image">
                <table>
                    <tr>`
                    
                for(let k=0; k<details.photos.length; k++){
                    content += `<td><img src=`+ details.photos[k] + `><br>Photo ` + (k+1) + `</td>`
                }
                content += `</tr>
                            </table>
                            </div>
                        </div>`;                 
                $('#business-card').remove();
                $.when( $('#b-card').append(content) ).done(function() {
                    window.scrollTo(0, 5000);
                    if(details.hours[0].is_open_now){
                        var elem = document.getElementById('status');
                        elem.style.setProperty('border','1px solid green','');
                        elem.style.setProperty('background-color','green','');
                    }
                    else {
                        var elem = document.getElementById('status');
                        elem.style.setProperty('border','1px solid red','');
                        elem.style.setProperty('background-color','red','');
                    }
                });
            } else {
                alert("error");
            }
        }
    };
    xml.open("GET", url);
    xml.send();
}

function clearFields(){
    const key = document.getElementById("keyword");
    const dist = document.getElementById("distance");
    const cat = document.getElementById("category");
    const loc = document.getElementById("location");
    const box = document.getElementById("box");
    key.value = '';
    dist.value = '10';
    loc.disabled = false;
    loc.value = '';
    loc.style.backgroundColor = "#ffffff";
    box.checked = false;
    cat.selectedIndex = 0;
    $('#results-card').remove();
    $('#business-card').remove();
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
