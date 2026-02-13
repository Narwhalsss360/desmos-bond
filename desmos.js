function toggleEditMode() {
  document.querySelector(".dcg-action-toggle-edit").dispatchEvent(new Event("dcg-tap"));
}

function closeModal() {
  document.querySelector(".dcg-shared-close-cross")?.dispatchEvent(new Event("dcg-tap"));
}

function toggleAddExpressionDropdown() {
  document.querySelector(".dcg-add-expression-container").children[0].dispatchEvent(new Event("dcg-tap"));
}

function findParent(elem, predicate) {
  const parent = elem.parentNode;
  if (parent.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  if (predicate(parent)) {
    return parent;
  }
  return findParent(parent, predicate);
}

function getGraphTitle() {
  return document.getElementById("dcg-graph-title-text").innerText;
}

let cachedId = null;
function getGraphId() {
  if (cachedId === null) {
    cachedId = JSON.parse(document.body.getAttribute("data-load-data"))?.graph?.hash;
  }
  return cachedId;
}

function downloadJSON(exportObj, exportName) {
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", url);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // Required for Firefox to work correctly
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  URL.revokeObjectURL(url);
}

function getExpressionInDOM(id) {
  return document.querySelector(`[expr-id="${id}"]`);
}

function swapExpressionId(oldId, newId) {
  const state = Calc.getState();
  const expr = state.expressions.list.find(e => e.id === oldId);
  if (!expr) {
    throw Error(`There is no expression with id: ${oldId}`);
  }
  expr.id = newId;
  if (expr.type === "folder") {
    for (const expression of state.expressions.list) {
      if (expression.folderId === oldId) {
        expression.folderId = newId;
      }
    }
  }
  Calc.setState(state);
}

function constructExpressionActionButton(iconClass, ariaLabel) {
  const hitAreaContainer = document.createElement("div");
  hitAreaContainer.className = "dcg-tooltip-hit-area-container dcg-do-not-blur dcg-cursor-default";
  hitAreaContainer.setAttribute("handleevent", true);
  hitAreaContainer.setAttribute("tabIndex", -1);
  hitAreaContainer.toggleAttribute("ontap", true);
  hitAreaContainer.innerHTML = String.raw`<div class="dcg-tooltip-hit-area-container dcg-do-not-blur dcg-cursor-default" handleevent="true" tabindex="-1" ontap=""><span class="dcg-exp-action-button" handleevent="true" role="button" tabindex="0" aria-label="${ariaLabel}" ontap=""><i class="${iconClass}" aria-hidden="true"></i></span></div>`;
  return hitAreaContainer;
}

function constructDropdownOption(iconClass, text, red = false) {
  const listitem = document.createElement("div");
  listitem.role = "listitem";
  listitem.className = "dropdown-option-container";
  listitem.innerHTML = String.raw`<div role="link" tabindex="0" id="option-duplicate" class="${(red ? "dcg-red-dropdown-option" : "dcg-standard-link-styling")} dcg-dropdown-choice" ontap=""><div class="dcg-option-icon-container"><i aria-hidden="true" class="${iconClass}" dcg-option-icon"></i></div><span class="option-title"><span class="dcg-mixed-text-math"><span class="dcg-label-raw-text">${text}</span></span></span></div>`;
  return listitem;
}

function constructAddExpressionOption(iconClass, text) {
  const addExpressionContainer = document.createElement("div");
  addExpressionContainer.className = "dcg-new-item dcg-do-not-blur";
  addExpressionContainer.role = "button";
  addExpressionContainer.tabIndex = 0;
  addExpressionContainer.toggleAttribute("ontap");
  addExpressionContainer.ariaLabel = text;
  addExpressionContainer.innerHTML = String.raw`<div class="dcg-expression-icon__container" aria-hidden="true"><i class="${iconClass}" aria-hidden="true"></i></div>${text}`;
  return addExpressionContainer;
}

function modifyEditActions() {
  for (const expression of Calc.getExpressions()) {
    const item = getExpressionInDOM(expression.id);
    if (!item /*Not visible*/) {
      continue;
    }

    const editActionsSpan = item.querySelector(".dcg-expression-edit-actions");
    if (!editActionsSpan /*Not visible*/) {
      continue;
    }
    const deleteContainer = editActionsSpan.querySelector(".dcg-delete-btn").parentNode;

    const buttons = [];
    if (!item.querySelector(".copy-latex-action-button") && expression.latex) {
      const copyLatexButton = constructExpressionActionButton("dcg-icon-clipboard", "Copy latex");
      copyLatexButton.classList.add("copy-latex-action-button");
      copyLatexButton.addEventListener("keydown", () => navigator.clipboard.writeText(expression.latex));
      copyLatexButton.addEventListener("click", () => navigator.clipboard.writeText(expression.latex));
      buttons.push(copyLatexButton);
    }

    if (expression.id.startsWith("import") && !item.querySelector(".unlink-expression-action-button")) {
      const unlinkExpressionButton = constructExpressionActionButton("dcg-icon-unlock", "Unlink import");
      function unlink() {
        swapExpressionId(expression.id, expression.id.substr("import".length));
        toggleEditMode();
      }
      unlinkExpressionButton.classList.add("unlink-expression-action-button");
      unlinkExpressionButton.addEventListener("keydown", unlink);
      unlinkExpressionButton.addEventListener("click", unlink);
      buttons.push(unlinkExpressionButton);
    }

    for (const button of buttons) {
      editActionsSpan.insertBefore(button, deleteContainer);
    }
  }
}

function modifyShareModal(evt) {
  const shareYourGraphContent = evt.detail.content.querySelector(".dcg-share-menu__content--share-your-graph");
  console.log(shareYourGraphContent);
  const exportActionSection = document.createElement("div");
  exportActionSection.className = "dcg-share-menu__alternative-action-section";
  exportActionSection.innerHTML = String.raw`<div style="display: contents;" class="">or <a class="dcg-share-menu__link dcg-blue-link" role="link" tabindex="0" ontap="">Export Graph State</a>.</div>`;
  const exportA = exportActionSection.querySelector("a");
  function exportClick() {
    downloadJSON(Calc.getState(), getGraphTitle());
    shareContainer.children[0].dispatchEvent(new Event("dcg-tap"));
  }
  exportA.addEventListener("click", exportClick);
  exportA.addEventListener("keydown", exportClick);
  shareYourGraphContent.appendChild(exportActionSection);
}

function modifySavedGraphOptions(evt) {
  const savedGraphLink = findParent(evt.detail.dropdown, node => node.tagName.toUpperCase() === "A");
  if (!savedGraphLink /*Not a graph*/) {
    return;
  }
  const graphId = savedGraphLink.id.substr(8);

  if (savedGraphLink.classList.contains("desmos-bond-modified")) {
    return;
  }
  savedGraphLink.classList.add("desmos-bond-modified");

  if (graphId === getGraphId()) {
    return;
  }

  const importedSentinel = `import(${graphId})`;
  if (Calc.getExpressions().find(expr => expr.id.startsWith(importedSentinel))) {
    const clearImportsOption = constructDropdownOption("dcg-icon-undo", "Clear imports", true);
    function clearImportsClick() {
      clearImportsFrom(graphId);
      closeModal();
    }
    clearImportsOption.addEventListener("click", clearImportsClick);
    clearImportsOption.addEventListener("keydown", clearImportsClick);
    evt.detail.dropdown.appendChild(clearImportsOption);
  }

  const importOption = constructDropdownOption("dcg-icon-insert", "Import");
  async function importClick() {
    importExpressions(await fetchGraph(graphId));
    closeModal();
  }
  importOption.addEventListener("click", importClick);
  importOption.addEventListener("keydown", importClick);

  evt.detail.dropdown.appendChild(importOption);
}

function modidyAddExpressionOptions(evt) {
  const insertLatexOption = constructAddExpressionOption("dcg-icon-title", "latex");
  function insertLatexOptionClick() {
    Calc.setExpression({
      type: "text",
      text: "latex("
    });
    toggleAddExpressionDropdown();
  }
  insertLatexOption.addEventListener("click", insertLatexOptionClick);
  insertLatexOption.addEventListener("keydown", insertLatexOptionClick);
  evt.detail.interior.appendChild(insertLatexOption);

  const importOption = constructAddExpressionOption("dcg-icon-insert", "import");
  function importOptionClick() {
    Calc.setExpression({
      type: "text",
      text: "import("
    });
    toggleAddExpressionDropdown();
  }
  importOption.addEventListener("click", importOptionClick);
  importOption.addEventListener("keydown", importOptionClick);
  evt.detail.interior.appendChild(importOption);

}

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

function clearImportsFrom(graphId) {
  const state = structuredClone(Calc.getState());
  const importSentinel = `import(${graphId})`;
  const importedFolders = [];
  const reusedFolders = [];
  for (let i = 0; i < state.expressions.list.length; i++) {
    const expression = state.expressions.list[i];
    if (expression.id.startsWith(importSentinel)) {
      if (expression.type == "folder") {
        importedFolders.push(expression);
        continue;
      }
      state.expressions.list.splice(i, 1);
      i--;
    } else if (expression.folderId && expression.folderId.startsWith(importSentinel)) {
      reusedFolders.push(expression.folderId);
      expression.folderId = expression.folderId.substr(6);
    }

  }
  for (const importedFolder of importedFolders) {
    if (reusedFolders.includes(importedFolder.id)) {
      importedFolder.id = importedFolder.id.substr(6);
    } else {
      state.expressions.list = state.expressions.list.filter(e => e !== importedFolder);
    }
  }

  Calc.setState(state);
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

document.addEventListener("desmos-bond-edit-mode-activated", () => {
  modifyEditActions();
  document.addEventListener("desmos-bond-expressions-in-dom-updated", modifyEditActions);
})

document.addEventListener("desmos-bond-edit-mode-deactivated", () => {
  document.removeEventListener("desmos-bond-expressions-in-dom-updated", modifyEditActions);
});

document.addEventListener("desmos-bond-share-container-opened", modifyShareModal);

document.addEventListener("desmos-bond-saved-graphs-shared-options-dropdown-opened", modifySavedGraphOptions);

document.addEventListener("desmos-bond-add-expression-container-opened", modidyAddExpressionOptions);
