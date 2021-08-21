import "./css/main.css";
import { ConsoleApplication, ConsoleApplicationView } from "./src/application";

/**
 * The main entry point of an applicaition.
 */
function main() {

  let view = new ConsoleApplicationView();

  // The application.
  let application = new ConsoleApplication(view);

  // Connected to the backend.
  application.init(
    window.location.origin + "/config",
    () => {

    },
    (err: any) => {
      console.log(err);
    }
  );
}

/**
 * The main function will be call a the end of document initialisation.
 */
document.addEventListener("DOMContentLoaded", function (event) {

  main();
});
