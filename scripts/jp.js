function addMonitorBtn() {
  var btnHTML = (
    "<div class='col-sm-6' style='padding: 10px;'>" +
    "<button class='addMonitorBtn' type='button' onclick='addMonitor()'>" +
    "<i class='fas fa-plus-circle' style='padding-right: 5px;'></i>Add Another" +
    "</button>" +
    "</div>"
  );
  document.getElementById("row").innerHTML = btnHTML;
}

var htmlNum = 0;
function addMonitor() {
  var html = (
    "<div class='col-sm-6' id='html" + htmlNum + "' style='padding: 10px;'>" +
    "<div class='formCard'>" +

    "<label for='companyid" + htmlNum + "' style='color: black;'>Company Id</label>" +
    "<input type='text' id='companyid" + htmlNum + "' style='font-family: FontAwesome; width: 180px;' placeholder='&#xf002' required></input>" +
    "<button type='button' class='searchBtn' style='margin-left: 10px;' onclick='populateDropDown(document.getElementById(\"companyid" + htmlNum + "\").value, " + htmlNum + ")'>Search</button>" +
    "<div class='loader' id='loader'></div><br>" +

    "<label for='queueid' style='color: black; padding-right: 20px;'>Queue Id</label>" +
    "<select id='selectqueueid" + htmlNum + "' name='selectqueueid' style='width: 180px;'  onchange='if (this.selectedIndex != 0) createQueue(this.value," + htmlNum + ");'>" +
    "</select>" +

    "<input type='checkbox' id='hideInactiveBtn' name='hideinactive' checked='checked' style='margin-left: 10px;' onclick='populateDropDown(document.getElementById(\"companyid" + htmlNum + "\").value, " + htmlNum + ")'></input>" +
    "<label for='hideinactive' style='color: black;'>Hide Inactive</label>" +

    "<button type='button' class='closeBtn' onclick='deleteMonitor(" + htmlNum + ")'>X</button>" +
    "<div id='loader" + htmlNum + "' ></div>" +
    "<div id ='error" + htmlNum + "' style='display:none' class = 'error'>" +
    "<img src='./images/error.jpg' alt='Error fetching' width='30' height='30'>" +
    "</div>" + 
    "<canvas id='myChart" + htmlNum + "'></canvas>" +
    "</div>" +
    "</div>"
  );
  var divRow = document.getElementById("row");
  divRow.insertAdjacentHTML('afterbegin', html);
  htmlNum++;
}

function deleteMonitor(htmlNum) {
  document.getElementById("html" + htmlNum).remove();
  clearInterval(interval[htmlNum])
}

//make sure backend has started or typeerror: failed to fetch would occur when searching 
const host = "https://ades-2b01.herokuapp.com";

async function getQueueData(companyid) {
  try {
    const response = await fetch(`${host}/company/queue?company_id=` + companyid);
    const json = await response.json();
    const status = response.status;
    if (status >= 400) {
      return error(json, status);
    }
    return json;
  } catch (err) {
    error(err);
  }
}

function populateDropDown(companyid, htmlNum) {
  var singleQueueID = [];
  var html = "<option value=0>Select queue id</option>";
  //check input 
  var pattern = /[!@#$%^&*(),.?":{}|<>a-zA-Z]+/; //https://regex101.com/ 
  var companyidInput = document.getElementById("companyid" + htmlNum).value;

  if (companyidInput.toString().length != 10) {
    return window.alert("Company ID must be only 10 digits long");
  } else if (pattern.test(companyidInput)) {
    return window.alert("Invalid Company ID");
  }
  //get data
  const spinner = document.getElementById("loader");
  console.log(spinner);
  spinner.style.visibility = "visible";
  getQueueData(companyid)
    .then(res => {
      spinner.style.visibility = "hidden";
      console.log(res)
      if (res == 0) {
        return window.alert("Unknown Company ID");
      }
      for (let a = 0; a < res.length; a++) {
        // var option = document.createElement("option");
        singleQueueID[a] = res[a];
        // option.text = singleQueueID[a].queue_id;
        // option.value = singleQueueID[a].queue_id;


        console.log(res[a]);
        if (document.getElementById("hideInactiveBtn").checked == true) { //btn is checked, show those which is active only
          if (singleQueueID[a].is_active == 1) {
            console.log("1")
            var options = (
              "<option value='" + singleQueueID[a].queue_id + "'>" + singleQueueID[a].queue_id + "</option>"
            );
            html += options;
            document.getElementById("selectqueueid" + htmlNum).innerHTML = html;
          }
        } else { //btn is not checked, show all queue 
          console.log("2")
          if (singleQueueID[a].is_active == 0) {
            var options = (
              "<option value='" + singleQueueID[a].queue_id + "' disabled>" + singleQueueID[a].queue_id + "</option>"
            );
          } else {
            var options = (
              "<option value='" + singleQueueID[a].queue_id + "'>" + singleQueueID[a].queue_id + "</option>"
            );
          }
          html += options;
          document.getElementById("selectqueueid" + htmlNum).innerHTML = html;
        }
      }
    })
    .catch(e => {
      console.log(e);
      return window.alert("Failed to fetch");
    });
}
