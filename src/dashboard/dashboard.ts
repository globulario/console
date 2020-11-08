import {
  CreateConnectionRqst,
  Connection,
  StoreType,
} from "../../../globular-mvc/node_modules/globular-web-client/monitoring/monitoring_pb";
import { Model } from "../../../globular-mvc/Model";
import { queryTsRange, queryTs } from "../../../globular-mvc/node_modules/globular-web-client/api";

/**
 * Display server and services cpu, memory and network usage.
 */
export class Dashboard {
  constructor() {}

  init() {
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
          endTime/1000,
          (values: any) => {
              console.log(values)
          },
          (err: any) => {
              console.log(err)
          }
        );
  }
}
