// added a feature to add hours to Date format
Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
}

// added a feature to add minutes to Date format
Date.prototype.addMinutes = function (min) {
  this.setMinutes(this.getMinutes() + min);
  return this;
}


async function graphdata(queue_id, htmlNum) {

  // get the Date format for the current time minus 3 minutes
  date = new Date().addHours(8).addMinutes(-3).toISOString()
  // get the date to be the same format as the required params
  date = date.substring(0, date.length - 5) + "%2B08:00"
  url = "http://localhost:8080/company/arrival_rate?queue_id=" + queue_id + "&from=" + date + "&duration=3"
  console.log(url)
  try {
    const response = await fetch(url);
    const json = await response.json()
    const status = response.status
    if (status >= 400) {
      window.alert("error:" + status + " while fetching")
    }
    // hide the error image
    document.getElementById("error" + htmlNum).style.display = "none"
    return json
  } catch (err) {
    console.log(htmlNum)
    // show the error image
    document.getElementById("error" + htmlNum).style.display = "block"
  }
}

chartarray = []
interval = []
deleting = false;
function createQueue(queue_id, htmlNum) {
  if(interval[htmlNum]!=undefined){
  chartarray[htmlNum].destroy()
    clearInterval(interval[htmlNum])
    deleting = true;
  }
  console.log(htmlNum)
  graphdata(queue_id, htmlNum).then(function (data) {
    // convert the keys of the json data to x and y
    json = JSON.parse(JSON.stringify(data).split('"timestamp":').join('"x":'));
    json = JSON.parse(JSON.stringify(json).split('"count":').join('"y":'));
    for (i = 0; i < json.length; i++) {
      json[i]["x"] = json[i]["x"] * 1000
    }

    var config = {
      type: 'line',
      data: {
        datasets: [{
          label: queue_id,
          backgroundColor: "red",
          borderColor: "green",
          data: json,
          fill: 'none',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'time',
            display: true,
            ticks: {
              maxRotation: 90,
              minRotation: 80
            },
            time: {
              format: 'mm:ss',
              tooltipFormat: 'mm:ss',
              unit: 'second',
              stepSize: 30,
              displayFormats: {
                'minute': 'mm:ss',
                'hour': 'mm:ss'
              },
            }
          }],
          yAxes: [{
            display: true,
            ticks: {
              beginAtZero: true   // minimum value will be 0.
            }
          }]
        },
      }
    };

    console.log(json)
    var ctx = document.getElementById('myChart' + htmlNum).getContext('2d');
    chartarray[htmlNum] = new Chart(ctx, config);
    style = document.getElementsByTagName("style")[0]
    currentstyle = style.innerHTML
    currentstyle = currentstyle + "#myChart" + htmlNum + "{width:500px !important;height:500px !important;}" +
      "#loader" + htmlNum + " {" +
      "border: 4px solid #f3f3f3;" +
      "border-top: 4px solid #3498db;" +
      "border-radius: 50%;" +
      "width: 30px;" +
      "height: 30px;" +
      "animation: spin 2s linear infinite;" +
      "margin-left: 40px;" +
      "margin-top: 40px;" +
      "position: absolute;" +
      "display: none;" +
      "}"
    style.innerHTML = currentstyle
  }
  ).then(function () {
    interval[htmlNum] = setInterval(function () {
      document.getElementById("loader" + htmlNum).style.display = "block"
      graphdata(queue_id, htmlNum).then(function (data) {
        console.log("repeat")
        json = JSON.parse(JSON.stringify(data).split('"timestamp":').join('"x":'));
        json = JSON.parse(JSON.stringify(json).split('"count":').join('"y":'));
        for (i = 0; i < json.length; i++) {
          json[i]["x"] = json[i]["x"] * 1000
        }
        console.log(data)
        document.getElementById("loader" + htmlNum).style.display = "none"
        // updated the data of the current chart
        if(deleting==false){
        chartarray[htmlNum].data.datasets[0].data = json
        chartarray[htmlNum].update()
        }
        deleting = false;
      }
      )
    }, 3000)
  })
}


