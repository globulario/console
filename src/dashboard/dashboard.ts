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
        <div id="gauge_div" class="col s12"></div>
      </div>
    </div>
    `
    let range = document.createRange()
    let fragment = range.createContextualFragment(layout)

    workspace.appendChild(fragment)
    this.gaugeDiv = document.getElementById("gauge_div")

  }

  init() {
    
    let drawChart = () =>{ 

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

    google.charts.load('current', { 'packages': ['gauge'] });
    google.charts.setOnLoadCallback(drawChart);
  

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
    // queryTsRange(Model.globular, "")

    // Get a range from start to end time
    /*
    let endTime = new Date().getTime();
        let startTime = endTime - (1000);
        
        queryTsRange(
          Model.globular,
          "dashboard_connection",
          "globular_services_cpu_usage_counter",
          startTime/1000,
          endTime/1000,
          1,
          (values: any) => {
              console.log(values)
          },
          (err: any) => {
              console.log(err)
          }
        );*/

    let endTime = new Date().getTime();
    let startTime = endTime - (1000);

    queryTs(
      Model.globular,
      "dashboard_connection",
      "globular_services_cpu_usage_counter",
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
