import "./styles.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ActorRefFrom, spawn, createMachine, send } from "xstate";
import { useMachine } from "@xstate/react";
import { createChildMachine } from "./child-machine";
import { inspect } from "@xstate/inspect";

// inspect({ iframe: false });

type ParentContext = {
  ref: ActorRefFrom<ReturnType<typeof createChildMachine>>;
};

const parentMachine = createMachine<ParentContext>({
  id: "parent-machine",
  initial: "initial",
  context: () => ({
    ref: spawn(createChildMachine(), {
      name: "child-machine"
    })
  }),
  states: {
    initial: {
      on: {
        SUBMIT: {
          actions: () => console.log("parent submit"),
          target: "submitting"
        }
      }
    },
    submitting: {
      entry: send("SUBMIT", { to: (context) => context.ref }),
      on: {
        SUCCESS: {
          target: "submitted"
        },
        FAILURE: {
          target: "submitted"
        }
      }
    },
    submitted: {
      on: {
        BACK: {
          target: "initial"
        }
      }
    }
  }
});

function App() {
  const [current, send] = useMachine(parentMachine, { devTools: true });
  const state = current.value;

  const childRef = current.context.ref?.getSnapshot?.();
  let submissionError = null;
  if (childRef) {
    submissionError = childRef.context.submissionError;
  }
  return (
    <div className="App">
      <h1>XState React Template</h1>
      <h2>Fork this template!</h2>
      <button onClick={() => send({ type: "SUBMIT" })}>Submit</button>{" "}
      <div style={{ color: "red", marginTop: "5px" }}>
        Current State: {state}
      </div>
      <div style={{ color: "red", marginTop: "5px" }}>
        {submissionError && `Error: ${submissionError}`}
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
