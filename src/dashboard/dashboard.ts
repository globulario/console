import {
  CreateConnectionRqst,
  Connection,
  StoreType,
} from "../../../globular-mvc/node_modules/globular-web-client/monitoring/monitoring_pb";
import { Model } from "../../../globular-mvc/Model";
import { queryTsRange, queryTs } from "../../../globular-mvc/node_modules/globular-web-client/api";
import "materialize-css/sass/materialize.scss";


/**
 * Display server and services cpu, memory and network usage.
 */
export class Dashboard {
  private gaugeDiv: any

  constructor(workspace: any) {
    let layout = `
    <div class="container"> 
      <div class="row"> 
        <div class="col s12 m12"> 
          <div class="card-panel" style="height: 200px">              
                  <div id="gauge_div"></div>
             </div>
          </div>
       </div> 
       
       <div class="row">
         <div class="col s12 m12" >  
          <div class="card-panel" style="height: 550px">       
            <div id="chart_div" style="width: 100%; height: 100%"></div>
         </div>     
       </div>
    </div>    
   </div>
   <div id="valueDiv"></div>

   <div class="container"> 

   </div>

    `
    let range = document.createRange()
    let fragment = range.createContextualFragment(layout)

    workspace.appendChild(fragment)
    this.gaugeDiv = document.getElementById("gauge_div")


  }

  init() {

    let drawGauge = () => {

      var data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Memory', 80],
        ['CPU', 55],
        ['Network', 68]
      ]);

      var options = {
        width: 400, height: 120,
        redFrom: 90, redTo: 100,
        yellowFrom: 75, yellowTo: 90,
        minorTicks: 5
      };
      var chart = new google.visualization.Gauge(this.gaugeDiv);

      chart.draw(data, options);

      setInterval(function () {
        data.setValue(0, 1, 40 + Math.round(60 * Math.random()));
        chart.draw(data, options);
      }, 13000);
      setInterval(function () {
        data.setValue(1, 1, 40 + Math.round(60 * Math.random()));
        chart.draw(data, options);
      }, 5000);
      setInterval(function () {
        data.setValue(2, 1, 60 + Math.round(20 * Math.random()));
        chart.draw(data, options);
      }, 26000);
    }


    function drawChart() {
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'X');
      data.addColumn('number', 'Dogs');



      data.addRows([
        [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9],
        [6, 11],  [7, 27],  [8, 33],  [9, 40],  [10, 32], [11, 35],
        [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
        [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
        [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
        [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
        [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
        [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
        [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
        [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
        [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
        [66, 70], [67, 72], [68, 75], [69, 80]
      ]);

      var options = {
        hAxis: {
          title: 'Time'
        },
        vAxis: {
          title: 'Popularity'
        }
      };

      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

      chart.draw(data, options);
    }


    google.charts.load('current', { 'packages': ['gauge'] });
    google.charts.setOnLoadCallback(() => {
      drawGauge()
      google.charts.load('current', { 'packages': ['corechart', 'line'] });
      google.charts.setOnLoadCallback(drawChart);
    });



    // Set the resize event.
    window.addEventListener('resize', ()=>{
      drawChart()
    });




    
    /* TODO create the connection once when the application is installed.
    let rqst = new CreateConnectionRqst();
    let info = new Connection();
    info.setId("dashboard_connection");
    info.setPort(9090);
    info.setStore(StoreType.PROMETHEUS);
    info.setHost("localhost");
    rqst.setConnection(info);
    Model.globular.monitoringService
      .createConnection(rqst, {
        application: Model.application,
        domain: Model.domain,
      })
      .then(() => {
        
      })
      .catch((err: any) => {
        console.log(err);
      });*/
   //  queryTsRange(Model.globular, "")

    // Get a range from start to end time
  
    let endTime_ = new Date().getTime();
        let startTime_ = endTime_ - (60);
        
        queryTsRange(
          Model.globular,
          "dashboard_connection",
          "globular_services_memory_usage_counter",
          startTime_/1000,
          endTime_/1000,
          1,
          (values: any) => {
              console.log(values)
          },
          (err: any) => {
              console.log(err)
          }
        );



    let endTime = new Date().getTime();
    let startTime = endTime - (1000);

    queryTs(
      Model.globular,
      "dashboard_connection",
      "globular_services_memory_usage_counter",
      endTime / 1000,
      (values: any) => {
        console.log(values)


   


      },
      (err: any) => {
        console.log(err)

      }
    );
  }
}
