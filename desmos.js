async function fetchGraph(graphId) {
   return await (await fetch(`https://www.desmos.com/calculator/${graphId}`, {
    headers: {
      Accept: "application/json"
    }
  })).json();
}

function importExpressions(graph) {
  const globalExpressionsFolder = `import(${graph.hash}).folder`;
  const globalExpressions = [];
  let expressions = Calc.getState().expressions.list;
  for (let i = 0; i < graph.state.expressions.list.length; i++) {
    if (i === -1) {
      break;
    }

    let expression = graph.state.expressions.list[i];
    expression.id = `import(${graph.hash}):${expression.id}`;

    const existingIndex = expressions.findIndex(expr => expr.id === expression.id);
    if (existingIndex !== -1) {
      expressions[existingIndex] = expression;
      graph.state.expressions.list.splice(i, 1);
      i--;
    }

    if (expression.type === "folder") {
      expression.title = `${graph.title}:${expression.title}`;
    } else {
      if (expression.folderId) {
        expression.folderId = `import(${graph.hash}):${expression.folderId}`;
      } else {
        expression.folderId = globalExpressionsFolder;
        if (existingIndex === -1) {
          graph.state.expressions.list.splice(i, 1);
          i--
          globalExpressions.push(expression);
        }
      }
    }

    if (expression.type === "table") {
      for (const column in expression.columns) {
        column.id = `import(${graph.id}):${column.id}`;
      }
    }
  }

  let globalExpressionsFolderIndex = expressions.findIndex(expr => expr.id === globalExpressionsFolder);
  if (globalExpressionsFolderIndex === -1) {
    globalExpressionsFolderIndex = expressions.length;
    expressions.push({
      type: "folder",
      id: globalExpressionsFolder,
      title: `Imports: ${graph.title}`
    });
  }

  Calc.setState({
    ...Calc.getState(),
    expressions: {
      list: [
        ...expressions.toSpliced(globalExpressionsFolderIndex + 1),
        ...globalExpressions,
        ...expressions.toSpliced(0, globalExpressionsFolderIndex + 1),
        ...graph.state.expressions.list
      ]
    }
  });
}

function getFunctionCallFromNote(note) {
  const result = /(.+)\((.+)\);/gm.exec(note);
  if (result === null) {
    return [null, null];
  };
  return result.toSpliced(0, 1);
}

function dispatchListener(evt) {
  if (evt.type !== "set-note-text") {
    return;
  }
  const [functionName, argument] = getFunctionCallFromNote(evt.text);

  if (functionName === null) {
    return;
  }

  switch (functionName) {
    case "latex": {
      Calc.controller.runAfterDispatch(() => {
        const state = Calc.getState();
        const expressionIndex = state.expressions.list.findIndex(expr => expr.id === evt.id);
        state.expressions.list[expressionIndex] = {
          ...state.expressions.list[expressionIndex],
          type: "expression",
          latex: argument
        }
        Calc.setState(state);
      });
      break;
    }
    case "import": {
      const graphId = argument;
      if (graphId.length !== 10) {
        const message = "Invalid graph id, the graph id is the text .desmos.com/calculator/<here>";
        alert(message);
        console.error(message);
        return;
      }
      Calc.controller.runAfterDispatch(async () => {
        try {
          importExpressions(await fetchGraph(graphId));
          Calc.removeExpression({ id: evt.id });
        } catch (err) {
          alert(err);
          console.log(err);
        }
      });
      break;
    }
    default: {
      console.log(`desmos-bond: ${functionName} with (${argument}) is not a supported function.`);
    }
  }
}

const demosBondCalcDispatcherListerId = Calc.controller.dispatcher.register(dispatchListener);
