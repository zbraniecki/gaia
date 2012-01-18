document.addEventListener("DOMContentLoaded", function() {
  var headNode = document.getElementsByTagName('head')[0];
  if (!headNode)
    return;

  var resources = [];
  var links = headNode.getElementsByTagName('link')
  for (var i = 0; i < links.length; i++) {
    if (links[i].type == 'intl/l20n')
      resources.push(links[i].href);
  }

  var ctx = L20n.getContext();
  resources.forEach(function addResource(resource) {
    ctx.addResource(resource);
  });

  ctx.onReady = function() {
    var nodes = document.body.getElementsByTagName('*');
    for (var i = 0, node; node = nodes[i]; i++) {
      localizeNode(ctx, node);
    }

    // XXX should use an event maybe?
    OnLocalizationReady(ctx);
  }

  HTMLElement.prototype.retranslate = function() {
    localizeNode(ctx, this);
  }

  HTMLDocument.prototype.__defineGetter__('l10nData', function() {
    return ctx.data;
  });

  ctx.freeze();
});

// XXX move this crap to L20n.Utils?
function getPathTo(element, context) {
  const TYPE_ELEMENT = 1;

  if (element === context)
    return '.';

  var id = element.getAttribute('id');
  if (id)
    return '*[@id="' + id + '"]';

  var localPath = element.getAttribute('l10n-path');
  if (localPath)
    return element.getAttribute('l10n-path');

  var index = 0;
  var siblings = element.parentNode.childNodes;
  for (var i = 0, sibling; sibling = siblings[i]; i++) {
    if (sibling === element) {
      var pathToParent = getPathTo(element.parentNode, context);
      return pathToParent + '/' + element.tagName + '[' + (index + 1) + ']';
    }

    if (sibling.nodeType == TYPE_ELEMENT && sibling.tagName === element.tagName)
      index++;
  }
}

function getElementByPath(path, context) {
  const FIRST_ORDERED = XPathResult.FIRST_ORDERED_NODE_TYPE;

  var xpe = document.evaluate(path, context, null, FIRST_ORDERED, null);
  return xpe.singleNodeValue;
}

function localizeNode(ctx, node) {
  var l10nId = node.getAttribute('l10n-id');
  if (!l10nId)
    return;

  var args;
  // XXX can we get rid of the test for nodeData if it should not be exposed?
  // node.nodeData must not be exposed
  if (node.nodeData) {
    args = node.nodeData;
  } else if (node.hasAttribute('l10n-args')) {
    args = JSON.parse(node.getAttribute('l10n-args'));
    node.nodeData = args;
  }

  // XXX vn what is L0?
  // get attributes from the LO
  var attributes = ctx.getAttributes(l10nId, args);
  if (attributes) {
    for (var name in attributes) {
      node.setAttribute(name, attributes[name]);
    }
  }

  var valueFromCtx = ctx.get(l10nId, args);
  if (valueFromCtx === null)
    return;

  // deep-copy the original node
  var origNode = node.cloneNode(true);
  node.innerHTML = valueFromCtx;

  // overlay the attributes of descendant nodes
  var children = node.getElementsByTagName('*');
  for (var i=0, child; child = children[i]; j++) {
    var path = child.getAttribute('l10n-path') || getPathTo(child, node);

    // match the child node with the equivalent node in origNode
    var origChild = getElementByPath(path, origNode);
    if (!origChild)
      continue;

    for (var j=0, origAttr; origAttr = origChild.attributes[j]; j++) {
      if (!child.hasAttribute(origAttr.name))
        child.setAttribute(origAttr.nodeName, origAttr.value);
    }
  }
}

