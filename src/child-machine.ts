import { createMachine, assign, sendParent } from "xstate";

export type ChildContext = { submissionError: string };

export const createChildMachine = () => {
  return createMachine<ChildContext>(
    {
      id: "child-machine",
      initial: "ready",
      context: {
        submissionError: ""
      },
      states: {
        ready: {
          entry: () => console.log("child ready"),
          on: {
            SUBMIT: {
              target: "submitting",
              actions: () => console.log("child submit")
            }
          }
        },
        submitting: {
          invoke: {
            src: "submitChild",
            onDone: {
              target: "submitted"
            },
            onError: {
              target: "ready",
              actions: ["setSubmissionError", "sendFailure"]
            }
          }
        },
        submitted: {}
      }
    },
    {
      actions: {
        setSubmissionError: assign({
          submissionError: (_, ev) => {
            return "error";
          }
        }),
        sendFailure: sendParent("FAILURE"),
        sendSuccess: sendParent("SUCCESS")
      },
      services: {
        submitChild: () => {
          return new Promise((resolve, reject) => reject("error"));
        }
      }
    }
  );
};
