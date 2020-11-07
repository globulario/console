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

      // Display the welcome page...
      fetch("images/puffer_say.svg")
        .then((response) => response.text())
        .then((data) => {
          // Test the search bar.
          let html = `
            <div style="padding-top: 5%; padding-left: 400px; background-image: url(images/sea_wead.png); background-repeat: no-repeat; background-position: bottom;">${data}</div>
        `;
          let range = document.createRange();
          view.getWorkspace().appendChild(range.createContextualFragment(html));

          let rect = document.getElementById("svg_2")
          let foreignObject = <any> document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
          foreignObject.setAttribute("x", rect.getAttribute("x"))
          foreignObject.setAttribute("y", rect.getAttribute("y"))
          foreignObject.setAttribute("width", rect.getAttribute("width"))
          foreignObject.setAttribute("height", rect.getAttribute("height"))
          rect.parentNode.appendChild(foreignObject)

          foreignObject.innerHTML = "<h4>Welcome to Globular Console!</h4>"
        });

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
