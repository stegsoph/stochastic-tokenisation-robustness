function applyStochasticWordHover(titleElement, palette) {
  if (!titleElement || titleElement.dataset.stochasticReady === "1") return;

  function colorWord(word) {
    var letters = word.querySelectorAll(".title-letter");
    var i = 0;
    while (i < letters.length) {
      var segmentLength = 1 + Math.floor(Math.random() * 3);
      var color = palette[Math.floor(Math.random() * palette.length)];
      for (var j = i; j < Math.min(i + segmentLength, letters.length); j += 1) {
        letters[j].style.color = color;
      }
      i += segmentLength;
    }
  }

  function resetWord(word) {
    var letters = word.querySelectorAll(".title-letter");
    for (var i = 0; i < letters.length; i += 1) letters[i].style.color = "";
  }

  function makeWord(token) {
    var word = document.createElement("span");
    word.className = "title-word";
    for (var i = 0; i < token.length; i += 1) {
      var letter = document.createElement("span");
      letter.className = "title-letter";
      letter.textContent = token.charAt(i);
      word.appendChild(letter);
    }
    word.addEventListener("mouseenter", function () {
      colorWord(word);
    });
    word.addEventListener("mouseleave", function () {
      resetWord(word);
    });
    word.addEventListener("touchstart", function () {
      colorWord(word);
    }, { passive: true });
    return word;
  }

  function processTextNode(textNode) {
    var text = textNode.nodeValue;
    if (!text || !text.trim()) return;
    var fragment = document.createDocumentFragment();
    var parts = text.split(/(\s+)/);
    for (var i = 0; i < parts.length; i += 1) {
      var token = parts[i];
      if (!token) continue;
      if (/^\s+$/.test(token)) fragment.appendChild(document.createTextNode(token));
      else if (/[A-Za-z0-9]/.test(token)) fragment.appendChild(makeWord(token));
      else fragment.appendChild(document.createTextNode(token));
    }
    textNode.parentNode.replaceChild(fragment, textNode);
  }

  function walk(node) {
    var children = Array.prototype.slice.call(node.childNodes);
    for (var i = 0; i < children.length; i += 1) {
      var child = children[i];
      if (child.nodeType === Node.TEXT_NODE) processTextNode(child);
      else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === "SUP") continue;
        walk(child);
      }
    }
  }

  walk(titleElement);

  document.addEventListener("touchstart", function (event) {
    if (!titleElement.contains(event.target)) {
      var words = titleElement.querySelectorAll(".title-word");
      for (var i = 0; i < words.length; i += 1) resetWord(words[i]);
    }
  }, { passive: true });

  titleElement.dataset.stochasticReady = "1";
}

function applyStochasticSegmentHover(titleElement, palette) {
  if (!titleElement || titleElement.dataset.segmentHoverReady === "1") return;

  function buildSegmentedFragment(text) {
    var fragment = document.createDocumentFragment();
    var parts = text.split(/(\s+)/);

    for (var p = 0; p < parts.length; p += 1) {
      var token = parts[p];
      if (!token) continue;

      if (/^\s+$/.test(token)) {
        fragment.appendChild(document.createTextNode(token));
        continue;
      }

      var i = 0;
      while (i < token.length) {
        var segLen = 2 + Math.floor(Math.random() * 4);
        var seg = token.slice(i, i + segLen);
        var span = document.createElement("span");
        span.className = "title-segment";
        span.style.color = palette[Math.floor(Math.random() * palette.length)];
        span.textContent = seg;
        fragment.appendChild(span);
        i += segLen;
      }
    }
    return fragment;
  }

  function colorizeTextNodes(node) {
    var children = Array.prototype.slice.call(node.childNodes);
    for (var i = 0; i < children.length; i += 1) {
      var child = children[i];

      if (child.nodeType === Node.TEXT_NODE) {
        var text = child.nodeValue;
        if (text && text.trim()) {
          var chunk = document.createElement("span");
          chunk.className = "title-segment-chunk";
          chunk.appendChild(buildSegmentedFragment(text));
          child.parentNode.replaceChild(chunk, child);
        }
        continue;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.classList && child.classList.contains("rq-number")) continue;
        colorizeTextNodes(child);
      }
    }
  }

  titleElement.addEventListener("mouseenter", function () {
    if (titleElement.dataset.segmentActive === "1") return;
    titleElement.dataset.originalHtml = titleElement.innerHTML;
    colorizeTextNodes(titleElement);
    titleElement.dataset.segmentActive = "1";
  });

  titleElement.addEventListener("mouseleave", function () {
    if (titleElement.dataset.segmentActive !== "1") return;
    titleElement.innerHTML = titleElement.dataset.originalHtml || titleElement.innerHTML;
    titleElement.dataset.segmentActive = "0";
  });

  titleElement.addEventListener("touchstart", function () {
    if (titleElement.dataset.segmentActive === "1") return;
    titleElement.dataset.originalHtml = titleElement.innerHTML;
    colorizeTextNodes(titleElement);
    titleElement.dataset.segmentActive = "1";
  }, { passive: true });

  document.addEventListener("touchstart", function (event) {
    if (titleElement.dataset.segmentActive !== "1") return;
    if (titleElement.contains(event.target)) return;
    titleElement.innerHTML = titleElement.dataset.originalHtml || titleElement.innerHTML;
    titleElement.dataset.segmentActive = "0";
  }, { passive: true });

  titleElement.dataset.segmentHoverReady = "1";
}

document.addEventListener("DOMContentLoaded", function () {
  var titlePalette = ["#4285F4", "#0F9D58", "#F4B400", "#DB4437", "#00ACC1", "#AB47BC", "#FB8C00"];
  var sectionPalette = ["#D22630", "#AB2328", "#93272C", "#E03C31", "#101820", "#2F2F2F"];

  var h1 = document.getElementById("stochastic-title");
  if (h1) applyStochasticWordHover(h1, titlePalette);

  var authors = document.querySelector(".authors");
  if (authors) applyStochasticWordHover(authors, titlePalette);

  var otherTitles = document.querySelectorAll("h2, h3");
  for (var i = 0; i < otherTitles.length; i += 1) {
    applyStochasticSegmentHover(otherTitles[i], sectionPalette);
  }
});
