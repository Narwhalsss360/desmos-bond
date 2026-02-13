const mainCalculatorContainer = Calc.domChangeDetector.elt
  .children[0]
  .children[0]
  .children[0];

let inEditState = false;
const expressionEachTemplateSpan = document.querySelector(".dcg-template-expressioneach");
const editModeActivatedEvent = new CustomEvent("desmos-bond-edit-mode-activated", { detail: { observer: null } });
const editModeDeactivatedEvent = new CustomEvent("desmos-bond-edit-mode-deactivated", { detail: { observer: null } });
const expressionEachTemplateSpanObserver = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type !== "attributes") {
      continue;
    }

    if (mutation.attributeName !== "class") {
      continue;
    }

    if (inEditState === mutation.target.classList.contains("dcg-EDIT-LIST-MODE")) {
      return;
    }

    inEditState = !inEditState
    const event = inEditState ? editModeActivatedEvent : editModeDeactivatedEvent;
    event.detail.observer = observer;
    document.dispatchEvent(event);
  }
}).observe(mainCalculatorContainer, { attributes: true });

const modalContainer = document.getElementById("dcg-modal-container");
const savedGraphsLoadedEvent = new CustomEvent("desmos-bond-saved-graphs-opened", {
  detail: {
    observer: null,
    loadedObserver: null,
    container: null,
    content: null,
    folderList: null,
    graphsContainer: null,
    graphsList: null
  }
})
const modalContainerObserver = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type !== "childList") {
      continue;
    }

    for (const newNode of mutation.addedNodes) {
      if (newNode.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const modalContent = document.querySelector(".dcg-my-graphs-modal__desktop-header-and-tile-content");
      if (!modalContent) {
        continue;
      }

      new MutationObserver((modalMutationsList, modalObserver) => {
        for (const modalMutation of modalMutationsList) {
          if (modalMutation.type !== "childList") {
            continue;
          }

          for (const modalNewNode of modalMutation.addedNodes) {
            if (modalNewNode.nodeType !== Node.ELEMENT_NODE) {
              continue;
            }

            savedGraphsLoadedEvent.detail.observer = observer;
            savedGraphsLoadedEvent.detail.loadedObserver = modalObserver;
            savedGraphsLoadedEvent.detail.container = modalContainer;
            savedGraphsLoadedEvent.detail.content = modalContainer.querySelector("dialog");
            savedGraphsLoadedEvent.detail.folderList = modalContainer.querySelector(".dcg-folders");
            savedGraphsLoadedEvent.detail.graphsContainer = modalContainer.querySelector(".dcg-saved-graphs__graphs-container");
            savedGraphsLoadedEvent.detail.graphsList = savedGraphsLoadedEvent.detail.graphsContainer.querySelector("ul");
            document.dispatchEvent(savedGraphsLoadedEvent);
          }
        }
      }).observe(modalContent, { childList: true });
    }
  }
}).observe(modalContainer, { childList: true });

const shareContainer = document.querySelector(".dcg-share-container");
const shareContainerOpenedEvent = new CustomEvent("desmos-bond-share-container-opened", {
  detail: {
    observer: null,
    container: null,
    content: null
  }
});
const shareContainerObserver = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    for (const newNode of mutation.addedNodes) {
      if (newNode.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const shareMenuContentElement = newNode.querySelector(".dcg-share-menu-content");
      if (!shareMenuContentElement) {
        continue;
      }
      shareContainerOpenedEvent.detail.observer = observer;
      shareContainerOpenedEvent.detail.container = shareContainer;
      shareContainerOpenedEvent.detail.content = shareMenuContentElement;
      document.dispatchEvent(shareContainerOpenedEvent);
    }
  }
}).observe(shareContainer, { childList: true });

const addExpressionContainer = document.querySelector(".dcg-add-expression-container");
const addExpressionContainerOpenedEvent = new CustomEvent("desmos-bond-add-expressions-container-opened", {
  detail: {
    observer: null,
    container: null,
    interior: null
  }
});
const addExpressionContainerObserver = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    for (const newNode of mutation.addedNodes) {
      if (newNode.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      const addExpressionInterior = newNode.querySelector(".dcg-dropdown-popover__interior");
      if (!addExpressionInterior) {
        continue;
      }

      addExpressionContainerOpenedEvent.detail.observer = observer;
      addExpressionContainerOpenedEvent.detail.container = addExpressionContainer;
      addExpressionContainerOpenedEvent.detail.interior = addExpressionInterior;
      document.dispatchEvent(addExpressionContainerOpenedEvent);
    }
  }
}).observe(addExpressionContainer, { childList: true });
