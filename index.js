"use strict";

// Get DOM-Elements
const numberNodesInput = document.getElementById("numberNodes");
const startEdgeInput = document.getElementById("startEdge");
const endEdgeInput = document.getElementById("endEdge");
const nodeBtn = document.getElementById("nodeBtn");
const addNode = document.getElementById("addNode");
const addEdge = document.getElementById("addEdge");
const editEdge = document.getElementById("editEdge");
const addNodeText = document.getElementById("addNodeText");
const addEdgeText = document.getElementById("addEdgeText");
const removeNodeText = document.getElementById("removeNodeText");
const editEdgeText = document.getElementById("editEdgeText");
const removeNode = document.getElementById("removeNode");
const edgeBtn = document.getElementById("edgeBtn");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const resultBox = document.getElementById("resultBox");
const container = document.getElementById("inputNetwork");
const results = [];

// Setup input network
let nodeList = [];
let edgeList = [];
let nodes = new vis.DataSet(nodeList);
let edges = new vis.DataSet(edgeList);
let nodesExist = false;
let addNodeModeActiv = false;
let addEdgeModeActiv = false;
let editEdgeModeActiv = false;

let data = {
  nodes: nodes,
  edges: edges,
};
const options = {
  nodes: {
    font: "20px Arial #000",
    color: "#fff",
  },
  edges: {
    width: 3,
    color: {
      color: "#fff",
    },
  },
  interaction: {
    dragNodes: true,
    selectable: false,
  },
  layout: {
    randomSeed: 1,
  },
  manipulation: {
    enabled: false,
    addNode: function (data, callback) {
      data.id = nodeList.length + 1;
      data.label = `${nodeList.length + 1}`;
      nodeList.push({
        id: nodeList.length + 1,
        label: `${nodeList.length + 1}`,
      });
      callback(data);
      network.addNodeMode();
    },
    addEdge: function (data, callback) {
      edgeList.push({
        from: Number(data.from),
        to: Number(data.to),
      });
      callback(data);
      network.addEdgeMode();
    },
    deleteNode: function (removeData, callback) {
      nodeList = nodeList
        .filter((node) => node.id !== removeData.nodes[0])
        .map((node) => {
          if (node.id > removeData.nodes[0]) {
            node.id -= 1;
            node.label = `${parseInt(node.label) - 1}`;
          }
          return node;
        });
      edgeList = edgeList
        .filter(
          (edge) =>
            !(
              edge.to === removeData.nodes[0] ||
              edge.from === removeData.nodes[0]
            )
        )
        .map((edge) => {
          if (edge.to > removeData.nodes[0]) edge.to -= 1;
          if (edge.from > removeData.nodes[0]) edge.from -= 1;
          return edge;
        });
      nodes = new vis.DataSet(nodeList);
      edges = new vis.DataSet(edgeList);
      data = {
        nodes,
        edges,
      };
      network = new vis.Network(container, data, options);
      callback(removeData);
      resetResult();
    },
    deleteEdge: function (removeData, callback) {
      console.log(removeData);
      callback(removeData);
    },
  },
};
let network = new vis.Network(container, data, options);

// Functions
const getMatrix = () => {
  const matrix = Array(nodeList.length);
  for (let i = 0; i < nodeList.length; i++) {
    matrix[i] = new Array(nodeList.length).fill(0);
  }
  edgeList.forEach((edge) => {
    matrix[edge.from - 1][edge.to - 1]++;
    matrix[edge.to - 1][edge.from - 1]++;
  });
  return matrix;
};

const addResult = (result) => {
  result.push(result[0]);
  resultBox.insertAdjacentHTML(
    "beforeend",
    `<div class="result"><p class="resultPath">${result.join(
      " &rarr;  "
    )}</p><button class="displayResult">Anzeigen</button></div>`
  );
  results.push([...result]);
};

const resetAll = () => {
  resultBox.innerHTML = "";
  resultBox.classList.remove("noResult");
  results.length = 0;
  nodeList = [];
  edgeList = [];
  edges = new vis.DataSet(edgeList);
  nodes = new vis.DataSet(nodeList);
  data = {
    nodes,
    edges,
  };
  network = new vis.Network(container, data, options);
  let resultNetwork = new vis.Network(
    document.getElementById("resultNetwork"),
    { nodes: new vis.DataSet([]), edge: new vis.DataSet([]) },
    options
  );
};

const resetResult = () => {
  resultBox.innerHTML = "";
  resultBox.classList.remove("noResult");
  let resultNetwork = new vis.Network(
    document.getElementById("resultNetwork"),
    { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) },
    options
  );
};

// Funcionality
addNode.addEventListener("click", (e) => {
  e.preventDefault();
  if (!addNodeModeActiv) {
    if (addEdgeModeActiv) addEdge.click();
    if (editEdgeModeActiv) editEdge.click();
    network.addNodeMode();
    addNodeText.textContent = "Hinzufügen abbrechen";
  } else {
    network.disableEditMode();
    addNodeText.innerHTML = "Knoten hinzufügen";
  }
  addNodeText.classList.toggle("activBtn");
  addNodeText.classList.toggle("inactiveBtn");
  addNodeModeActiv = !addNodeModeActiv;
});

addEdge.addEventListener("click", (e) => {
  e.preventDefault();
  if (!addEdgeModeActiv) {
    if (addNodeModeActiv) addNode.click();
    if (editEdgeModeActiv) editEdge.click();
    network.addEdgeMode();
    addEdgeText.textContent = "Hinzufügen abbrechen";
  } else {
    network.disableEditMode();
    addEdgeText.textContent = "Kante hinzufügen";
  }
  addEdgeText.classList.toggle("activBtn");
  addEdgeText.classList.toggle("inactiveBtn");
  addEdgeModeActiv = !addEdgeModeActiv;
});

removeNode.addEventListener("click", (e) => {
  e.preventDefault();
  network.deleteSelected();
  removeNodeText.classList.toggle("activBtn");
  removeNodeText.classList.toggle("inactiveBtn");
  setTimeout(() => {
    removeNodeText.classList.toggle("activBtn");
    removeNodeText.classList.toggle("inactiveBtn");
  }, 500);
});

editEdge.addEventListener("click", (e) => {
  e.preventDefault();
  if (!editEdgeModeActiv) {
    if (addNodeModeActiv) addNode.click();
    if (addEdgeModeActiv) addEdge.click();
    editEdgeText.textContent = "Bearbeiten abbrechen";
    network.editEdgeMode();
  } else {
    editEdgeText.textContent = "Kante bearbeiten";
    network.disableEditMode();
  }
  editEdgeText.classList.toggle("activBtn");
  editEdgeText.classList.toggle("inactiveBtn");
  editEdgeModeActiv = !editEdgeModeActiv;
});

resetBtn.addEventListener("click", (e) => {
  e.preventDefault();
  resetAll();
});

searchBtn.addEventListener("click", () => {
  // reset the results
  resetResult();
  // algorithm
  const matrix = getMatrix();
  const n = nodeList.length;
  const x = Array(n).fill(0);
  let usedEdges = [];
  const hamiltonian = (k) => {
    while (true) {
      x.length = n;
      nextEdge(k);
      if (x[k] === 0) return;
      if (x[0] === 2) return;
      if (k === n - 1) addResult(x);
      else hamiltonian(k + 1);
    }
  };
  const nextEdge = (k) => {
    while (true) {
      // increment
      x[k] = (x[k] + 1) % (n + 1);
      // check if 0
      if (x[k] === 0) return;
      // check if duplicate
      let valid = true;
      for (let j = 0; j < n; j++) if (x[j] === x[k] && k !== j) valid = false;
      if (!valid) continue;
      // check for connection
      // refresh used edges
      usedEdges = Array(nodeList.length);
      for (let i = 0; i < nodeList.length; i++) {
        usedEdges[i] = new Array(nodeList.length).fill(0);
      }
      x.forEach((vertex, i) => {
        if (vertex !== 0) {
          if (i !== 0) {
            usedEdges[vertex - 1][x[i - 1] - 1]++;
            usedEdges[x[i - 1] - 1][vertex - 1]++;
          }
          if (i === x.length - 1) {
            usedEdges[0][vertex - 1]++;
            usedEdges[vertex - 1][0]++;
          }
        }
      });
      // check for connection and for duplicate edges
      if (k !== 0) {
        if (usedEdges[x[k - 1] - 1][x[k] - 1] > matrix[x[k - 1] - 1][x[k] - 1])
          continue;
      }
      if (k === x.length - 1) {
        if (usedEdges[x[0] - 1][x[k] - 1] > matrix[x[0] - 1][x[k] - 1])
          continue;
      }
      // all conditions apply
      return;
    }
  };
  hamiltonian(0);
  // if no solutions display that none are found
  if (results.length === 0) {
    resultBox.innerHTML = "<p>Keine Lösung gefunden</p>";
    resultBox.classList.add("noResult");
  } else {
    // remove border of last displayed result
    resultBox.querySelectorAll(".result")[
      resultBox.querySelectorAll(".result").length - 1
    ].style.border = "none";

    // functionality to display the result
    const displayResultBtns = document.querySelectorAll(".displayResult");
    displayResultBtns.forEach((btn, i) => {
      btn.id = `btn-${i}`;
      // function for every results button
      btn.onclick = () => {
        const result = results[Number(btn.id.split("-")[1])]; // get result from button
        const edgeListColor = [...edgeList].map((edge) => {
          edge.color = "#fff";
          return edge;
        });
        // color edges
        for (let i = 1; i < result.length; i++) {
          [...edgeListColor]
            .filter((edge) => {
              if (
                (edge.from === result[i - 1] && edge.to === result[i]) ||
                (edge.to === result[i - 1] && edge.from === result[i])
              )
                return true;
              return false;
            })
            .forEach((edge) => (edge.color = "#000"));
        }
        let resultNetwork = new vis.Network(
          document.getElementById("resultNetwork"),
          { nodes, edges: new vis.DataSet(edgeListColor) },
          options
        );
      };
    });
  }
});

// Tests
const test1 = () => {
  nodeList = [];
  addNodes(5);
  edgeList = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 5 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
  ];
  edges = new vis.DataSet(edgeList);
  nodes = new vis.DataSet(nodeList);
  data = {
    nodes,
    edges,
  };
  network = new vis.Network(container, data, options);
};

const addNodes = (numberNodes) => {
  const nodeListLength = nodeList.length;
  for (let i = nodeListLength + 1; i < numberNodes + 1 + nodeListLength; i++) {
    nodeList.push({ id: i, label: `${i}` });
  }
  nodes = new vis.DataSet(nodeList);
  data = {
    nodes,
    edges,
  };
  network = new vis.Network(container, data, options);
};
