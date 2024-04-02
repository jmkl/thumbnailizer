import { core, app, action, constants, imaging } from "photoshop";

function test(data) {
  console.log(data, app.activeDocument);
}

test("hello worldx");
