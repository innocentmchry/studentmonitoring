
fetch('/calculate_first_component/')
  .then(response => response.json())
  .then(data => {
    if (data.val == 0) {
      alert('Wait for the admin to end a conference, then reload again')
    }
    const ctx = document.getElementById('myChart');
    
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Percentage',
          data: data.data,
          borderWidth: 1
        }]
      },
    });


const ctx2 = document.getElementById('myChart2');


new Chart(ctx2, {
  type: 'bar',
  data: {
    labels: data.labels,
    datasets: [{
      label: 'Percentage wise distribution',
      data: data.data,
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)'
      ],
      borderColor: [
        'rgb(54, 162, 235)',
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
})
.catch(error => {
console.error('Error fetching first component:', error);
});



$.ajax({
    type:'GET',
    url: '/calculate_second_component/',
    success: async (response) => {
        var curiousList = $('.df');
        var confusedList = $('.s1');
        var boredList = $('.s2');
        var hopefullList = $('.s3');
        var neutralList = $('.s4');

        response.curious_person.forEach(item => myFunction(item, curiousList))
        response.confused_person.forEach(item => myFunction(item, confusedList))
        response.bored_person.forEach(item => myFunction(item, boredList))
        response.hopefull_person.forEach(item => myFunction(item, hopefullList))
        response.neutral_person.forEach(item => myFunction(item, neutralList))

        function myFunction(item, myListClass) {
          myListClass.append(`<li>${item}</li>`);
        }
    },
    error: async(response) => {
        alert("Second Component No Data Found");
    }
})


$.ajax({
  type:'GET',
  url: '/calculate_third_component/',
  success: async (response) => {
      
      labels = ['Curious', 'Confused', 'Bored', 'Hopefull','Neutral']

      // console.log('rows_list is:')
      // console.log(response.rows_list)
      // console.log('response data is: ')
      // console.log(response.data)

      for(i = 0; i < response.rows_list.length; i++){
        charPieId = `charPieChart${i}`
        charBarId = `charBarChart${i}`
        charScatterId = `charScatterChart${i}`


        let components1 = `<div class="usersOfThirdComponent">
                            <div class="namesOfThirdComponent"><h3>${response.rows_list[i][0]}</h3></div>
                            <div class="pieChart">
                                <canvas id="${charPieId}"></canvas>
                            </div>

                            <div class="pieChart">
                                <canvas class="barChartOfThirdComponent" id="${charBarId}"></canvas>
                            </div>

                            <div class="scatterChart">
                                <canvas id="${charScatterId}"></canvas>
                            </div>
                          </div>`

        document.getElementById('thirdComponent').insertAdjacentHTML('beforeend', components1)

        createUserPieChart(charPieId, i, labels, response.rows_list)
        createUserBarChart(charBarId, i, labels, response.rows_list, 'Emotions Count')
        createUserScatterChart(charScatterId, response.rows_list[i][1], response.data)


      }           
           
  },
  error: async(response) => {
      alert("Third Component No Data Found");
  }
})

$.ajax({
  type:'GET',
  url: '/calculate_fourth_component/',
  success: async (response) => {


      responseData = response.data;
      for (const name in responseData) {
        var list1 = [];
        var list2 = [];

        for (const obj of responseData[name]) {
            var key = Object.keys(obj)[0];
            var value = obj[key];

            list1.push(key);
            list2.push(value);
        }

        // Create for all users
        let id = `lineChart${name}`
        let components2 = `<div class="usersOfFourthComponent">
                              <div class="namesOfFourthComponent"><h3>${name}</h3></div>
                              <div class="lineChart">
                                  <canvas class="lineCanvas" id="${id}"></canvas>
                              </div>
                          </div>`
        
        document.getElementById('fourthComponent').insertAdjacentHTML('beforeend', components2)
        createUserLineChart(id, list1, list2)  
        

      }
  },
  error: async(response) => {
      alert("Fourth Component No Data Found");
  }
})



let createUserPieChart = (id, user, labels, rows) => {
  const ctx = document.getElementById(id);
  const config = {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Count',
        data: rows[user].slice(2),
        borderWidth: 1
      }]
    },
  }
  new Chart(ctx, config);
}


let createUserBarChart = (id, user, labels, rows, legend) => {
  const ctx = document.getElementById(id);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: legend,
        data: rows[user].slice(2),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      aspectRatio: 1,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}





let createUserScatterChart = (id, uid, responseData) => {

  const ctx = document.getElementById(id);
  const data = {
    datasets: [{
      label: 'Valence Arousal Scatter Plot',
      data: responseData[uid],
      backgroundColor: 'rgb(255, 99, 132)'
    }],
  };

  const config = {
    type: 'scatter',
    data: data,
    options: {
      scales: {
        x: {
          grid: {
              drawBorder: false,
              color: (context) => {
                if(context.tick.value === 0){
                  return 'black'
                }
              },
          },
          suggestedMin: -1,
          suggestedMax: 1,
          title: {
            display: true,
            text: 'Valence'
          },
        },
        y: {
          grid: {
            drawBorder: false,
            color: (context) => {
              if(context.tick.value === 0){
                return 'black'
              }
          }
          },
          suggestedMin: -1,
          suggestedMax: 1,
          title: {
            display: true,
            text: 'Arousal'
        },
        }
      },
      aspectRatio: 1,
    }
  };

  new Chart(ctx, config)
}

let createUserLineChart = (id, mylabels, mydata) => {
  const ctx = document.getElementById(id);
      const labels = mylabels;
      const data = {
        labels: labels,
        datasets: [{
          label: 'Emotions',
          data: mydata,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };

      const customLabels = {
        '0': 'Neutral',
        '10': 'Hopefull',
        '20': 'Curious',
        '-10': 'Confused',
        '-20': 'Bored'
      };

      const config = {
        type: 'line',
        data: data,
        options: {
          responsive: false,
          maintainAspectRatio: false,
          aspectRatio: 4,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time Stamp'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Emotions'
              },
              ticks: {
                callback: function(value) {
                  return customLabels[value] || '';
                }
              }
            }
          }
        }
       
      };
      new Chart(ctx, config);
}

let downloadCsvFile = () => {
  window.location.href = '/download_csv_file/'
}

let clearData = async () => {
  var userConfirmed = window.confirm("Would you like to clear this meeting data?");
  if (userConfirmed) {
    let EMAIL = sessionStorage.getItem('email')
    let response = await fetch('/check_admin_clear_data/', {
      method:'POST',
      headers:{
          'Content-Type':'application/json'
      },
      body:JSON.stringify({'email': EMAIL})
    })
    let result = await response.json()
    if (result.deleted == 1) {
      alert('Clear Data Successfull!')
      location.reload();
    }else {
      alert('Permission Denied, Only Admins can delete')
    }
  } else {
      alert("Clear Data canceled!");
  }

}

let recalculate = async () => {  
  let EMAIL = sessionStorage.getItem('email')
  let response = await fetch('/check_admin_recalculate_data/', {
    method:'POST',
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({'email': EMAIL})
  })
  let result = await response.json()
  if (result.recalculated == 1) {
    alert('Recalculation Successfull!')
    location.reload();
  }else {
    alert('Permission Denied, Only Admins can recalculate')
  }
  
}

let downloadCsvFile2 = () => {
  window.location.href = '/download_csv_file2/'
}


// window.addEventListener('beforeunload', clearData)
document.getElementById('downloadButton').addEventListener('click', downloadCsvFile)
document.getElementById('downloadButton2').addEventListener('click', downloadCsvFile2)
document.getElementById('clearBtn').addEventListener('click', clearData)
document.getElementById('recalculateBtn').addEventListener('click', recalculate)